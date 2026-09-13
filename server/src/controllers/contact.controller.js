const { ContactInquiry } = require('../models');
const { getOrCreateSettings } = require('../services/settings.service');
const { sendContactNotification, sendContactConfirmation } = require('../services/email.service');
const {
  saveAttachment,
  deleteAttachment,
  attachmentFilePath,
  fetchPrivateFile,
  attachmentHeader,
} = require('../services/fileStorage.service');
const { isValidAttachment } = require('../utils/fileSignature');

// ---------- Public ----------

async function submit(req, res) {
  let attachment = { storageKey: null, originalName: null };
  if (req.file) {
    if (!isValidAttachment(req.file.buffer)) {
      return res.status(400).json({
        success: false,
        message: 'Attachment content does not match an accepted file type (image, PDF, or Word document).',
      });
    }
    const key = await saveAttachment(req.file.buffer, req.file.originalname);
    attachment = { storageKey: key, originalName: req.file.originalname };
  }

  const inquiry = await ContactInquiry.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '',
    subject: req.body.subject,
    message: req.body.message,
    attachment,
  });

  // The inquiry is saved regardless of whether email sending succeeds —
  // a down SMTP server should never make the customer's message vanish.
  // The admin can still see it in /admin/inquiries either way.
  let emailSent = true;
  try {
    await sendContactNotification(inquiry);
    const settings = await getOrCreateSettings();
    await sendContactConfirmation(inquiry, settings.designerName).catch(() => {});
  } catch (err) {
    emailSent = false;
    console.error('[contact] Failed to send notification email:', err.message);
  }

  return res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully.',
    emailSent,
  });
}

// ---------- Admin ----------

async function listAdmin(req, res) {
  const { read, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (read === 'true') filter.read = true;
  if (read === 'false') filter.read = false;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [inquiries, total] = await Promise.all([
    ContactInquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ContactInquiry.countDocuments(filter),
  ]);

  return res.json({ success: true, inquiries, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

async function getAdminById(req, res) {
  const inquiry = await ContactInquiry.findById(req.params.id);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }
  return res.json({ success: true, inquiry });
}

function setRead(read) {
  return async (req, res) => {
    const inquiry = await ContactInquiry.findByIdAndUpdate(req.params.id, { read }, { new: true });
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }
    return res.json({ success: true, inquiry });
  };
}

async function remove(req, res) {
  const inquiry = await ContactInquiry.findById(req.params.id);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }
  if (inquiry.attachment?.storageKey) {
    await deleteAttachment(inquiry.attachment.storageKey);
  }
  await inquiry.deleteOne();
  return res.json({ success: true, message: 'Inquiry deleted.' });
}

async function downloadAttachment(req, res) {
  const inquiry = await ContactInquiry.findById(req.params.id);
  if (!inquiry || !inquiry.attachment?.storageKey) {
    return res.status(404).json({ success: false, message: 'No attachment on record.' });
  }
  const signedUrl = attachmentFilePath(inquiry.attachment.storageKey);
  const buffer = await fetchPrivateFile(signedUrl);

  res.setHeader('Content-Disposition', attachmentHeader(inquiry.attachment.originalName));
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(buffer);
}

module.exports = {
  submit,
  listAdmin,
  getAdminById,
  markRead: setRead(true),
  markUnread: setRead(false),
  remove,
  downloadAttachment,
};
