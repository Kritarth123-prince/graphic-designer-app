const { PortfolioProject } = require('../models');
const { savePreviewImage, deletePreviewImage, previewFilePath } = require('../services/fileStorage.service');
const { isValidImage } = require('../utils/fileSignature');

async function addImages(req, res) {
  const project = await PortfolioProject.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const files = req.files || [];
  if (files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded.' });
  }

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
    saved.push({ url: previewFilePath(key), storageKey: key, alt: project.title });
  }

  project.images.push(...saved);
  await project.save();

  return res.status(201).json({ success: true, project });
}

async function removeImage(req, res) {
  const { id, imageId } = req.params;
  const project = await PortfolioProject.findById(id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const image = project.images.id(imageId);
  if (!image) {
    return res.status(404).json({ success: false, message: 'Image not found.' });
  }

  await deletePreviewImage(image.storageKey);
  image.deleteOne();
  await project.save();

  return res.json({ success: true, project });
}

module.exports = { addImages, removeImage };
