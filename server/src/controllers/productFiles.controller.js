const { Product } = require('../models');
const {
  savePreviewImage,
  deletePreviewImage,
  previewFilePath,
  saveOriginalFile,
  deleteOriginalFile,
  originalFilePath,
} = require('../services/fileStorage.service');
const { isValidImage, isValidOriginalFile } = require('../utils/fileSignature');

async function addPreviewImages(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const files = req.files || [];
  if (files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded.' });
  }

  // Multer's fileFilter only checked the *declared* Content-Type, which is
  // attacker-controlled — verify the actual bytes before uploading anything.
  const invalid = files.find((f) => !isValidImage(f.buffer));
  if (invalid) {
    return res.status(400).json({
      success: false,
      message: `"${invalid.originalname}" is not a valid JPEG, PNG, or WebP file.`,
    });
  }

  const saved = [];
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const key = await savePreviewImage(file.buffer, file.originalname);
    saved.push({ url: previewFilePath(key), storageKey: key, alt: product.title });
  }

  product.previewImages.push(...saved);
  if (!product.thumbnail && saved[0]) {
    product.thumbnail = saved[0].url;
  }
  await product.save();

  return res.status(201).json({ success: true, product });
}

async function removePreviewImage(req, res) {
  const { id, imageId } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const image = product.previewImages.id(imageId);
  if (!image) {
    return res.status(404).json({ success: false, message: 'Image not found.' });
  }

  await deletePreviewImage(image.storageKey);
  image.deleteOne();
  await product.save();

  return res.json({ success: true, product });
}

async function uploadOriginalFile(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  if (!isValidOriginalFile(req.file.buffer)) {
    return res.status(400).json({
      success: false,
      message: 'File content does not match an accepted design-file format (PSD/AI/PDF/PNG/JPEG/ZIP).',
    });
  }

  // Replace any previous original file rather than accumulating orphans.
  if (product.file?.storageKey) {
    await deleteOriginalFile(product.file.storageKey);
  }

  const key = await saveOriginalFile(req.file.buffer, req.file.originalname);
  product.file = {
    storageKey: key,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  };
  await product.save();

  return res.status(201).json({
    success: true,
    file: { originalName: product.file.originalName, size: product.file.size },
  });
}

// Admin-only: redirects to a freshly generated, short-lived signed
// Cloudinary URL so the designer can prepare the file for manual
// delivery after payment is verified. This is never reachable by
// customers — no public download route exists, and the signed URL is
// only generated after requireAuth has already passed.
async function downloadOriginalFile(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product || !product.file?.storageKey) {
    return res.status(404).json({ success: false, message: 'No original file on record.' });
  }

  const signedUrl = originalFilePath(product.file.storageKey);
  res.redirect(signedUrl);
}

module.exports = { addPreviewImages, removePreviewImage, uploadOriginalFile, downloadOriginalFile };
