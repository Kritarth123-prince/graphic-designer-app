const multer = require('multer');

// Memory storage: files are validated here, then handed to
// fileStorage.service which generates the on-disk name. The original
// filename is never used to build a path (prevents path traversal) and
// is only ever stored as metadata, not trusted for anything executable.
const storage = multer.memoryStorage();

const PREVIEW_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PREVIEW_MAX_SIZE = 8 * 1024 * 1024; // 8MB per image

const ORIGINAL_MIME_TYPES = [
  'image/vnd.adobe.photoshop', // .psd
  'application/octet-stream', // some browsers report .psd/.ai this way
  'application/pdf',
  'application/postscript', // .ai
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/x-zip-compressed', // Windows browsers (Chrome/Edge on Windows) report .zip this way
];
const ORIGINAL_MAX_SIZE = 200 * 1024 * 1024; // 200MB

function fileFilterFactory(allowedMimeTypes) {
  return (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  };
}

const uploadPreviewImages = multer({
  storage,
  limits: { fileSize: PREVIEW_MAX_SIZE, files: 10 },
  fileFilter: fileFilterFactory(PREVIEW_MIME_TYPES),
});

const uploadOriginalFile = multer({
  storage,
  limits: { fileSize: ORIGINAL_MAX_SIZE, files: 1 },
  fileFilter: fileFilterFactory(ORIGINAL_MIME_TYPES),
});

const ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ATTACHMENT_MAX_SIZE = 15 * 1024 * 1024; // 15MB

const uploadContactAttachment = multer({
  storage,
  limits: { fileSize: ATTACHMENT_MAX_SIZE, files: 1 },
  fileFilter: fileFilterFactory(ATTACHMENT_MIME_TYPES),
});

// Normalizes multer's thrown errors into the app's standard error shape
// instead of letting a raw multer error reach the client.
function handleUploadErrors(err, req, res, next) {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
  }
  next();
}

module.exports = {
  uploadPreviewImages,
  uploadOriginalFile,
  uploadContactAttachment,
  handleUploadErrors,
};
