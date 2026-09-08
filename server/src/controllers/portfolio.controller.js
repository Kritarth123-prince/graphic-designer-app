const { PortfolioProject } = require('../models');
const { generateUniqueSlug } = require('../services/slug.service');
const { deletePreviewImage } = require('../services/fileStorage.service');

const PUBLIC_PROJECTION =
  'title slug client year category description brief creativeDirection process ' +
  'finalResult images featured seo createdAt';

// ---------- Public ----------

async function listPublic(req, res) {
  const projects = await PortfolioProject.find({ published: true })
    .select(PUBLIC_PROJECTION)
    .sort({ featured: -1, createdAt: -1 });
  return res.json({ success: true, projects });
}

async function getPublicBySlug(req, res) {
  const project = await PortfolioProject.findOne({ slug: req.params.slug, published: true }).select(
    PUBLIC_PROJECTION
  );
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  return res.json({ success: true, project });
}

// ---------- Admin ----------

async function listAdmin(req, res) {
  const projects = await PortfolioProject.find({}).sort({ createdAt: -1 });
  return res.json({ success: true, projects });
}

async function getAdminById(req, res) {
  const project = await PortfolioProject.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  return res.json({ success: true, project });
}

async function create(req, res) {
  const slug = await generateUniqueSlug(PortfolioProject, req.body.title);

  const project = await PortfolioProject.create({
    title: req.body.title,
    slug,
    client: req.body.client,
    year: req.body.year,
    category: req.body.category,
    description: req.body.description,
    brief: req.body.brief,
    creativeDirection: req.body.creativeDirection,
    process: req.body.process,
    finalResult: req.body.finalResult,
    featured: req.body.featured || false,
    published: false, // starts as a draft, same as products
    seo: {
      title: req.body.seoTitle || '',
      metaDescription: req.body.seoMetaDescription || '',
      ogImage: req.body.seoOgImage || '',
    },
  });

  return res.status(201).json({ success: true, project });
}

async function update(req, res) {
  const project = await PortfolioProject.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  if (req.body.title && req.body.title !== project.title) {
    project.title = req.body.title;
    project.slug = await generateUniqueSlug(PortfolioProject, req.body.title, project._id);
  }

  const editableFields = [
    'client',
    'year',
    'category',
    'description',
    'brief',
    'creativeDirection',
    'process',
    'finalResult',
    'featured',
  ];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  }

  if (req.body.seoTitle !== undefined) project.seo.title = req.body.seoTitle;
  if (req.body.seoMetaDescription !== undefined) project.seo.metaDescription = req.body.seoMetaDescription;
  if (req.body.seoOgImage !== undefined) project.seo.ogImage = req.body.seoOgImage;

  await project.save();
  return res.json({ success: true, project });
}

function setPublished(published) {
  return async (req, res) => {
    const project = await PortfolioProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    project.published = published;
    await project.save();
    return res.json({ success: true, project });
  };
}

async function remove(req, res) {
  const project = await PortfolioProject.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  await Promise.all((project.images || []).map((img) => deletePreviewImage(img.storageKey)));
  await project.deleteOne();
  return res.json({ success: true, message: 'Project deleted.' });
}

module.exports = {
  listPublic,
  getPublicBySlug,
  listAdmin,
  getAdminById,
  create,
  update,
  publish: setPublished(true),
  unpublish: setPublished(false),
  remove,
};
