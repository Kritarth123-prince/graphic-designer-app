const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');

// Cloudinary-backed storage. Preview images upload as public assets;
// original design files and contact/custom-design attachments upload as
// `type: 'authenticated'` (Cloudinary's access-controlled delivery type) —
// never a plain public URL. Controllers only ever see an opaque
// `storageKey` (the Cloudinary public_id) and, for private files, a
// freshly generated signed URL — never a raw Cloudinary secret.

const PREVIEW_FOLDER = 'graphic-designer-app/previews';
const ORIGINAL_FOLDER = 'graphic-designer-app/originals';
const ATTACHMENT_FOLDER = 'graphic-designer-app/attachments';

const SIGNED_URL_TTL_SECONDS = 5 * 60; // 5 minutes — long enough for one download click

function bufferToDataUri(buffer) {
  return `data:application/octet-stream;base64,${buffer.toString('base64')}`;
}

function extOf(originalName) {
  const match = /\.([a-zA-Z0-9]+)$/.exec(originalName || '');
  return match ? match[1].toLowerCase() : undefined;
}

// ---------- Preview images (public) ----------

async function savePreviewImage(buffer, originalName) {
  const result = await cloudinary.uploader.upload(bufferToDataUri(buffer), {
    folder: PREVIEW_FOLDER,
    resource_type: 'image',
    public_id: crypto.randomUUID(),
  });
  // storageKey stores BOTH pieces Cloudinary needs to delete it later,
  // joined so the rest of the app still treats it as one opaque string.
  return `${result.public_id}|image`;
}

async function deletePreviewImage(storageKey) {
  if (!storageKey) return;
  const [publicId, resourceType] = storageKey.split('|');
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' }).catch(() => {});
}

// The Product/Portfolio models store `url` separately from `storageKey`
// (set at upload time to `result.secure_url`) — this helper exists only
// for parity with the local-disk version's interface; preview URLs are
// Cloudinary's own CDN URLs and need no further resolution.
function previewFilePath(storageKey) {
  const [publicId] = (storageKey || '').split('|');
  return cloudinary.url(publicId, { resource_type: 'image', secure: true });
}

// ---------- Original design files (private) ----------

async function saveOriginalFile(buffer, originalName) {
  const result = await cloudinary.uploader.upload(bufferToDataUri(buffer), {
    folder: ORIGINAL_FOLDER,
    resource_type: 'raw',
    type: 'authenticated', // Cloudinary access-controlled delivery — not publicly reachable
    public_id: crypto.randomUUID(),
    format: extOf(originalName),
  });
  return `${result.public_id}|raw|${extOf(originalName) || ''}`;
}

async function deleteOriginalFile(storageKey) {
  if (!storageKey) return;
  const [publicId] = storageKey.split('|');
  await cloudinary.uploader
    .destroy(publicId, { resource_type: 'raw', type: 'authenticated' })
    .catch(() => {});
}

// Returns a short-lived signed URL — call this only after your own
// requireAuth middleware has already confirmed the requester is allowed
// to see this file. The signature itself is what makes the Cloudinary
// URL work; without it the asset is not fetchable.
function originalFilePath(storageKey) {
  const [publicId, , format] = (storageKey || '').split('|');
  return cloudinary.utils.private_download_url(publicId, format || undefined, {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
    attachment: true,
  });
}

// Cloudinary's private_download_url can't be given a custom download
// filename (it always names the file after the public_id/format), so to
// deliver it under its original upload name we fetch the bytes ourselves
// and let the controller set its own Content-Disposition header.
async function fetchPrivateFile(signedUrl) {
  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from storage (status ${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// Builds a Content-Disposition value that downloads under the given name,
// including for names with non-ASCII characters (RFC 5987).
function attachmentHeader(filename) {
  const safeName = (filename || 'download').replace(/"/g, '');
  return `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`;
}

// ---------- Contact / custom-design attachments (private) ----------

async function saveAttachment(buffer, originalName) {
  const result = await cloudinary.uploader.upload(bufferToDataUri(buffer), {
    folder: ATTACHMENT_FOLDER,
    resource_type: 'raw',
    type: 'authenticated',
    public_id: crypto.randomUUID(),
    format: extOf(originalName),
  });
  return `${result.public_id}|raw|${extOf(originalName) || ''}`;
}

async function deleteAttachment(storageKey) {
  if (!storageKey) return;
  const [publicId] = storageKey.split('|');
  await cloudinary.uploader
    .destroy(publicId, { resource_type: 'raw', type: 'authenticated' })
    .catch(() => {});
}

function attachmentFilePath(storageKey) {
  const [publicId, , format] = (storageKey || '').split('|');
  return cloudinary.utils.private_download_url(publicId, format || undefined, {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
    attachment: true,
  });
}

module.exports = {
  savePreviewImage,
  deletePreviewImage,
  previewFilePath,
  saveOriginalFile,
  deleteOriginalFile,
  originalFilePath,
  saveAttachment,
  deleteAttachment,
  attachmentFilePath,
  fetchPrivateFile,
  attachmentHeader,
};
