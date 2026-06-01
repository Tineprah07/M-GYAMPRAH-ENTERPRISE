const nodemailer = require('nodemailer');

let transporter = null;
let lastVerifiedAt = 0;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (transporter) return transporter;
  if (!isConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) !== 587, // 465 = SSL, 587 = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    connectionTimeout: 8000,
  });

  return transporter;
}

/**
 * Send an email. Never throws — logs failures and returns { ok, error? }.
 * The customer-facing API response should not depend on email succeeding.
 */
async function send({ to, subject, html, text, replyTo }) {
  const tx = getTransporter();
  if (!tx) {
    console.warn('[mailer] SMTP not configured — skipping email to', to);
    return { ok: false, error: 'SMTP not configured' };
  }

  const from = process.env.MAIL_FROM || `M. Gyamprah Enterprise <${process.env.SMTP_USER}>`;

  try {
    const info = await tx.sendMail({
      from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    console.log(`[mailer] sent "${subject}" to ${to} (id=${info.messageId})`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[mailer] failed to send "${subject}" to ${to}:`, err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Verify SMTP connection at startup (and at most once per hour after).
 * Returns true if reachable, false otherwise. Never throws.
 */
async function verify() {
  const tx = getTransporter();
  if (!tx) return false;
  if (Date.now() - lastVerifiedAt < 60 * 60 * 1000) return true;
  try {
    await tx.verify();
    lastVerifiedAt = Date.now();
    console.log('[mailer] SMTP connection verified');
    return true;
  } catch (err) {
    console.warn('[mailer] SMTP verify failed:', err.message);
    return false;
  }
}

module.exports = { send, verify, isConfigured };
