const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error(
      'Email is not configured — set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD in server/.env.'
    );
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
  });
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  await getTransporter().sendMail({ from, to, subject, text, html });
}

function formatContactNotification(inquiry) {
  const text = [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone/WhatsApp: ${inquiry.phone || '—'}`,
    `Subject: ${inquiry.subject}`,
    `Submission Date: ${inquiry.createdAt.toLocaleString()}`,
    '',
    'Message:',
    inquiry.message,
  ].join('\n');

  return { subject: `New Website Inquiry — ${inquiry.subject}`, text };
}

async function sendContactNotification(inquiry) {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL;
  if (!receiver) throw new Error('CONTACT_RECEIVER_EMAIL is not set in server/.env.');

  const { subject, text } = formatContactNotification(inquiry);
  await sendMail({ to: receiver, subject, text });
}

async function sendContactConfirmation(inquiry, designerName) {
  const text = `Thank you for contacting ${designerName || 'us'}.\nYour message has been received and we will get back to you soon.`;
  await sendMail({ to: inquiry.email, subject: 'We received your message', text });
}

function formatCustomDesignNotification(request) {
  const text = [
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `WhatsApp: ${request.whatsapp}`,
    `Design Type: ${request.designType}`,
    `Dimensions: ${request.dimensions || '—'}`,
    `Quantity: ${request.quantity}`,
    `Budget: ${request.budget || '—'}`,
    `Deadline: ${request.deadline ? request.deadline.toDateString() : '—'}`,
    `Submission Date: ${request.createdAt.toLocaleString()}`,
    '',
    'Project Description:',
    request.projectDescription,
  ].join('\n');

  return { subject: `New Custom Design Request — ${request.designType}`, text };
}

async function sendCustomDesignNotification(request) {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL;
  if (!receiver) throw new Error('CONTACT_RECEIVER_EMAIL is not set in server/.env.');

  const { subject, text } = formatCustomDesignNotification(request);
  await sendMail({ to: receiver, subject, text });
}

module.exports = {
  sendMail,
  sendContactNotification,
  sendContactConfirmation,
  sendCustomDesignNotification,
};
