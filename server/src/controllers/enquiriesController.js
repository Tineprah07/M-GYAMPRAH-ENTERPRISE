const { query } = require('../config/db');
const mailer = require('../services/mailer');
const templates = require('../services/emailTemplates');

async function createEnquiry(req, res, next) {
  try {
    const { name, email, phone, company, subject, message } = req.body;
    const { rows } = await query(
      `INSERT INTO enquiries (name, email, phone, company, subject, message)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, created_at`,
      [name, email, phone || null, company || null, subject || null, message]
    );
    const saved = rows[0];

    // Fire off both emails in the background — never block the user response.
    const enquiry = { id: saved.id, name, email, phone, company, subject, message };
    Promise.allSettled([
      mailer.send({
        to: process.env.MAIL_ADMIN || process.env.SMTP_USER,
        replyTo: email,
        ...templates.adminEnquiry(enquiry),
      }),
      mailer.send({
        to: email,
        ...templates.customerEnquiryAck(enquiry),
      }),
    ]).catch((err) => console.error('[enquiries] background email error:', err));

    res.status(201).json({
      data: saved,
      message: 'Thank you. Your enquiry has been received. Our team will contact you shortly.',
    });
  } catch (err) {
    next(err);
  }
}

async function listEnquiries(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT id, name, email, phone, company, subject, message, status, created_at
       FROM enquiries ORDER BY created_at DESC LIMIT 200`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEnquiry, listEnquiries };
