const { CustomDesignRequest } = require('../models');
const { sendCustomDesignNotification } = require('../services/email.service');
const { saveAttachment, deleteAttachment, attachmentFilePath } = require('../services/fileStorage.service');
const { isValidAttachment } = require('../utils/fileSignature');

// ---------- Public ----------

async function submit(req, res) {
  let referenceFile = { storageKey: null, originalName: null };
  if (req.file) {
    if (!isValidAttachment(req.file.buffer)) {
      return res.status(400).json({
        success: false,
        message: 'Reference file content does not match an accepted file type (image, PDF, or Word document).',
      });
    }
    const key = await saveAttachment(req.file.buffer, req.file.originalname);
    referenceFile = { storageKey: key, originalName: req.file.originalname };
  }

  const request = await CustomDesignRequest.create({
    name: req.body.name,
    email: req.body.email,
    whatsapp: req.body.whatsapp,
    designType: req.body.designType,
    projectDescription: req.body.projectDescription,
    dimensions: req.body.dimensions || '',
    quantity: req.body.quantity || 1,
    budget: req.body.budget || '',
    deadline: req.body.deadline || null,
    referenceFile,
    status: 'NEW',
  });

  // Same resilience principle as the contact form: the request is saved
  // regardless of whether the notification email succeeds.
  let emailSent = true;
  try {
    await sendCustomDesignNotification(request);
  } catch (err) {
    emailSent = false;
    console.error('[custom-design] Failed to send notification email:', err.message);
  }

  return res.status(201).json({
    success: true,
    message: 'Your custom design request has been sent successfully.',
    emailSent,
  });
}

// ---------- Admin ----------

async function listAdmin(req, res) {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [requests, total] = await Promise.all([
    CustomDesignRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    CustomDesignRequest.countDocuments(filter),
  ]);

  return res.json({ success: true, requests, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

async function getAdminById(req, res) {
  const request = await CustomDesignRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }
  return res.json({ success: true, request });
}

async function updateStatus(req, res) {
  const request = await CustomDesignRequest.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }
  return res.json({ success: true, request });
}

async function remove(req, res) {
  const request = await CustomDesignRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }
  if (request.referenceFile?.storageKey) {
    await deleteAttachment(request.referenceFile.storageKey);
  }
  await request.deleteOne();
  return res.json({ success: true, message: 'Request deleted.' });
}

async function downloadReferenceFile(req, res) {
  const request = await CustomDesignRequest.findById(req.params.id);
  if (!request || !request.referenceFile?.storageKey) {
    return res.status(404).json({ success: false, message: 'No reference file on record.' });
  }
  const signedUrl = attachmentFilePath(request.referenceFile.storageKey);
  res.redirect(signedUrl);
}

module.exports = { submit, listAdmin, getAdminById, updateStatus, remove, downloadReferenceFile };
