// Multer's fileFilter only sees the *declared* Content-Type of a
// multipart part, which any raw HTTP client (curl, a script, Burp Suite,
// a browser dev tools override) can set to anything regardless of the
// actual bytes being sent. That check alone stops accidental wrong-file
// uploads through the real UI; it stops nothing from a deliberate
// attacker. This checks the actual leading bytes of the file instead —
// signatures a forged Content-Type header can't fake.

const SIGNATURES = {
  png: (buf) => buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  jpeg: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  webp: (buf) =>
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP',
  pdf: (buf) => buf.length >= 4 && buf.subarray(0, 4).toString('ascii') === '%PDF',
  zip: (buf) =>
    buf.length >= 4 &&
    (buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) ||
      buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x05, 0x06])) ||
      buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x07, 0x08]))),
  psd: (buf) => buf.length >= 4 && buf.subarray(0, 4).toString('ascii') === '8BPS',
  // Legacy PostScript / old-style .ai files not saved as PDF-compatible
  postscript: (buf) => buf.length >= 2 && buf.subarray(0, 2).toString('ascii') === '%!',
  // Legacy .doc (OLE compound file format)
  ole: (buf) => buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
};

function matches(buffer, types) {
  return types.some((t) => SIGNATURES[t]?.(buffer));
}

// Preview images: strictly JPEG/PNG/WebP — these become public URLs.
function isValidImage(buffer) {
  return matches(buffer, ['png', 'jpeg', 'webp']);
}

// Original design files: PSD/AI(pdf-or-postscript)/PDF/PNG/JPEG/ZIP.
function isValidOriginalFile(buffer) {
  return matches(buffer, ['psd', 'pdf', 'postscript', 'png', 'jpeg', 'zip']);
}

// Contact/custom-design attachments: images, PDF, or Word docs (legacy + modern, the latter is zip-based).
function isValidAttachment(buffer) {
  return matches(buffer, ['jpeg', 'png', 'webp', 'pdf', 'ole', 'zip']);
}

module.exports = { isValidImage, isValidOriginalFile, isValidAttachment };
