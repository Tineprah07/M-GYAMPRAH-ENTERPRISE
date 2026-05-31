const { query } = require('../config/db');

async function createEnquiry(req, res, next) {
  try {
    const { name, email, phone, company, subject, message } = req.body;
    const { rows } = await query(
      `INSERT INTO enquiries (name, email, phone, company, subject, message)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, created_at`,
      [name, email, phone || null, company || null, subject || null, message]
    );
    res.status(201).json({
      data: rows[0],
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
