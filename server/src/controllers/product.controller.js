const { Product, Category } = require('../models');
const { generateUniqueSlug } = require('../services/slug.service');
const { generateProductId } = require('../services/productId.service');
const { deleteOriginalFile, deletePreviewImage } = require('../services/fileStorage.service');

// Fields safe to return on public endpoints. Explicitly excludes:
// file (private storage key), published, status, and any internal
// bookkeeping — matches spec §65 "Public API Security".
const PUBLIC_PROJECTION =
  'productId title slug description shortDescription price currency category ' +
  'previewImages thumbnail dimensions format includedFiles tags featured seo createdAt';

// ---------- Public ----------

async function listPublic(req, res) {
  const { q, category, sort = 'newest', page = 1, limit = 12 } = req.query;

  const filter = { status: 'published', published: true };

  if (category) {
    if (typeof category !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid category filter.' });
    }
    const cat = await Category.findOne({ slug: category }).select('_id');
    if (!cat) {
      return res.json({ success: true, products: [], total: 0, page: Number(page), pages: 0 });
    }
    filter.category = cat._id;
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    featured: { featured: -1, createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(PUBLIC_PROJECTION)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
}

async function getPublicBySlug(req, res) {
  const product = await Product.findOne({
    slug: req.params.slug,
    status: 'published',
    published: true,
  })
    .select(PUBLIC_PROJECTION)
    .populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  return res.json({ success: true, product });
}

// ---------- Admin ----------

async function listAdmin(req, res) {
  const { q, status, category, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return res.json({ success: true, products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

async function getAdminById(req, res) {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  return res.json({ success: true, product });
}

async function create(req, res) {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).json({ success: false, message: 'Category does not exist.' });
  }

  const slug = await generateUniqueSlug(Product, req.body.title);
  const productId = typeof req.body.productId === 'string' && req.body.productId
    ? req.body.productId.toUpperCase()
    : await generateProductId();

  const existingId = await Product.findOne({ productId });
  if (existingId) {
    return res.status(409).json({ success: false, message: `Product ID ${productId} is already in use.` });
  }

  const product = await Product.create({
    productId,
    title: req.body.title,
    slug,
    description: req.body.description,
    shortDescription: req.body.shortDescription,
    price: req.body.price,
    currency: req.body.currency || 'INR',
    category: category._id,
    dimensions: req.body.dimensions,
    format: req.body.format,
    includedFiles: req.body.includedFiles || [],
    tags: req.body.tags || [],
    featured: req.body.featured || false,
    // New products always start unpublished — an explicit publish
    // action is required (spec §13).
    published: false,
    status: 'draft',
    thumbnail: req.body.thumbnail || '',
    seo: {
      title: req.body.seoTitle || '',
      metaDescription: req.body.seoMetaDescription || '',
      ogImage: req.body.seoOgImage || '',
    },
  });

  return res.status(201).json({ success: true, product });
}

async function update(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category does not exist.' });
    }
    product.category = category._id;
  }

  if (req.body.title && req.body.title !== product.title) {
    product.title = req.body.title;
    product.slug = await generateUniqueSlug(Product, req.body.title, product._id);
  }

  const editableFields = [
    'description',
    'shortDescription',
    'price',
    'currency',
    'dimensions',
    'format',
    'includedFiles',
    'tags',
    'featured',
    'thumbnail',
  ];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  }

  if (req.body.seoTitle !== undefined) product.seo.title = req.body.seoTitle;
  if (req.body.seoMetaDescription !== undefined) product.seo.metaDescription = req.body.seoMetaDescription;
  if (req.body.seoOgImage !== undefined) product.seo.ogImage = req.body.seoOgImage;

  await product.save();
  return res.json({ success: true, product });
}

function setStatus(status) {
  return async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (status === 'published' && !product.thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Add at least one preview image before publishing this product.',
      });
    }

    product.status = status;
    product.published = status === 'published';
    await product.save();

    return res.json({ success: true, product });
  };
}

async function remove(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  if (product.file?.storageKey) {
    await deleteOriginalFile(product.file.storageKey);
  }
  await Promise.all((product.previewImages || []).map((img) => deletePreviewImage(img.storageKey)));

  await product.deleteOne();
  return res.json({ success: true, message: 'Product deleted.' });
}

module.exports = {
  listPublic,
  getPublicBySlug,
  listAdmin,
  getAdminById,
  create,
  update,
  publish: setStatus('published'),
  unpublish: setStatus('draft'),
  archive: setStatus('archived'),
  remove,
};
