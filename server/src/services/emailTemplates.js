/**
 * Email templates for MGE.
 * Four types: admin/customer x enquiry/quote.
 * Each returns { subject, html, text }.
 */

const COMPANY = 'M. Gyamprah Enterprise';
const BRAND_NAVY = '#19326f';
const INK_DARK = '#0b1220';
const INK_MUTED = '#6b7280';
const LINE = '#e6e8ec';
const BG_SOFT = '#f7f8fa';

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const ghs = (n) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 2 }).format(Number(n || 0));

function layout({ preheader, headline, bodyHtml, footerNote }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(headline)}</title>
</head>
<body style="margin:0;padding:0;background:${BG_SOFT};font-family:'Helvetica Neue',Arial,sans-serif;color:${INK_DARK};line-height:1.55;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${esc(preheader || '')}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BG_SOFT};padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#fff;border:1px solid ${LINE};border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:${BRAND_NAVY};padding:20px 28px;color:#fff;">
            <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.7);font-weight:600;">${COMPANY}</div>
            <div style="font-size:20px;font-weight:700;margin-top:4px;letter-spacing:-0.01em;">${esc(headline)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:${BG_SOFT};border-top:1px solid ${LINE};font-size:12px;color:${INK_MUTED};">
            ${footerNote || `${COMPANY} &middot; Accra, Ghana &middot; Building &middot; Steel &middot; Fuel`}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function kvTable(rows) {
  const cells = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid ${LINE};color:${INK_MUTED};font-size:13px;width:140px;vertical-align:top;">${esc(k)}</td>
          <td style="padding:8px 0;border-bottom:1px solid ${LINE};color:${INK_DARK};font-size:14px;vertical-align:top;">${esc(v)}</td>
        </tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">${cells}</table>`;
}

function lineItemsTable(items) {
  if (!items?.length) return '';
  const rows = items
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK_DARK};">${esc(it.product_name)}</td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK_DARK};text-align:right;white-space:nowrap;">${it.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK_DARK};text-align:right;white-space:nowrap;">${ghs(it.unit_price)}</td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK_DARK};text-align:right;white-space:nowrap;font-weight:600;">${ghs(it.line_total)}</td>
        </tr>`
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin-top:8px;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 0;border-bottom:2px solid ${INK_DARK};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};">Item</th>
          <th align="right" style="padding:8px 0;border-bottom:2px solid ${INK_DARK};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};">Qty</th>
          <th align="right" style="padding:8px 0;border-bottom:2px solid ${INK_DARK};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};">Unit price</th>
          <th align="right" style="padding:8px 0;border-bottom:2px solid ${INK_DARK};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};">Line total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── Enquiries ───────────────────────────────────────────────────────────

function adminEnquiry(e) {
  const subject = `[MGE] New enquiry from ${e.name}${e.subject ? ` — ${e.subject}` : ''}`;
  const html = layout({
    preheader: `${e.name} sent an enquiry: ${e.subject || 'General'}`,
    headline: 'New customer enquiry',
    bodyHtml: `
      <p style="margin:0 0 16px;color:${INK_DARK};">Someone just submitted the contact form on your website.</p>
      ${kvTable([
        ['Name', e.name],
        ['Email', e.email],
        ['Phone', e.phone],
        ['Company', e.company],
        ['Subject', e.subject],
      ])}
      <div style="margin-top:20px;padding:16px;border:1px solid ${LINE};border-radius:6px;background:${BG_SOFT};">
        <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};font-weight:600;margin-bottom:8px;">Message</div>
        <div style="white-space:pre-wrap;font-size:14px;color:${INK_DARK};">${esc(e.message)}</div>
      </div>
      <p style="margin:24px 0 0;font-size:13px;color:${INK_MUTED};">Reply directly to this email to respond to ${esc(e.name)}.</p>
    `,
  });
  const text = [
    `New customer enquiry — ${COMPANY}`,
    '',
    `Name:    ${e.name}`,
    `Email:   ${e.email}`,
    e.phone   ? `Phone:   ${e.phone}` : null,
    e.company ? `Company: ${e.company}` : null,
    e.subject ? `Subject: ${e.subject}` : null,
    '',
    'Message:',
    e.message,
    '',
    `Reply directly to this email to respond to ${e.name}.`,
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

function customerEnquiryAck(e) {
  const subject = `We received your enquiry — ${COMPANY}`;
  const html = layout({
    preheader: 'Thank you for contacting M. Gyamprah Enterprise. We will be in touch shortly.',
    headline: 'Thank you for getting in touch',
    bodyHtml: `
      <p style="margin:0 0 12px;color:${INK_DARK};">Hello ${esc(e.name.split(' ')[0] || e.name)},</p>
      <p style="margin:0 0 16px;color:${INK_DARK};">
        Thanks for reaching out to ${COMPANY}. We've received your enquiry and our team will get back to you within one business day.
      </p>
      <div style="margin:16px 0;padding:16px;border:1px solid ${LINE};border-radius:6px;background:${BG_SOFT};">
        <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};font-weight:600;margin-bottom:8px;">Your message</div>
        ${e.subject ? `<div style="font-weight:600;color:${INK_DARK};margin-bottom:6px;">${esc(e.subject)}</div>` : ''}
        <div style="white-space:pre-wrap;font-size:14px;color:${INK_DARK};">${esc(e.message)}</div>
      </div>
      <p style="margin:20px 0 4px;color:${INK_DARK};font-size:14px;">Need to reach us sooner?</p>
      <p style="margin:0;font-size:14px;color:${INK_DARK};">
        Call us on <a href="tel:+233240000000" style="color:${BRAND_NAVY};">+233 24 000 0000</a>
        or reply to this email.
      </p>
      <p style="margin:24px 0 0;color:${INK_MUTED};font-size:13px;">— The MGE team</p>
    `,
    footerNote: `${COMPANY} &middot; Accra, Ghana &middot; This is an automated acknowledgement.`,
  });
  const text = [
    `Hello ${e.name.split(' ')[0] || e.name},`,
    '',
    `Thanks for reaching out to ${COMPANY}. We've received your enquiry and our team will get back to you within one business day.`,
    '',
    'Your message:',
    e.subject ? `Subject: ${e.subject}` : '',
    e.message,
    '',
    'Need to reach us sooner? Call +233 24 000 0000 or reply to this email.',
    '',
    '— The MGE team',
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

// ─── Quote requests (orders) ──────────────────────────────────────────────

function adminQuote(o) {
  const subject = `[MGE] Quote request — ${o.customer_name} (${ghs(o.total)})`;
  const html = layout({
    preheader: `${o.customer_name} requested a quote for ${ghs(o.total)}`,
    headline: 'New quote request',
    bodyHtml: `
      <p style="margin:0 0 16px;color:${INK_DARK};">A customer has submitted a quote request from the cart.</p>
      ${kvTable([
        ['Name', o.customer_name],
        ['Email', o.customer_email],
        ['Phone', o.customer_phone],
        ['Company', o.customer_company],
        ['Order ID', `#${o.order_id || o.id}`],
      ])}
      <h3 style="margin:24px 0 0;font-size:14px;color:${INK_DARK};">Items</h3>
      ${lineItemsTable(o.items)}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;">
        <tr>
          <td style="font-size:14px;color:${INK_MUTED};text-align:right;">Indicative total</td>
          <td style="font-size:18px;color:${INK_DARK};font-weight:700;text-align:right;width:140px;padding-left:12px;">${ghs(o.total)}</td>
        </tr>
      </table>
      ${o.notes ? `
        <div style="margin-top:20px;padding:16px;border:1px solid ${LINE};border-radius:6px;background:${BG_SOFT};">
          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};font-weight:600;margin-bottom:8px;">Customer notes</div>
          <div style="white-space:pre-wrap;font-size:14px;color:${INK_DARK};">${esc(o.notes)}</div>
        </div>
      ` : ''}
      <p style="margin:24px 0 0;font-size:13px;color:${INK_MUTED};">Reply directly to this email to send the customer a confirmed quote.</p>
    `,
  });
  const text = [
    `New quote request — ${COMPANY}`,
    '',
    `Name:    ${o.customer_name}`,
    `Email:   ${o.customer_email}`,
    o.customer_phone   ? `Phone:   ${o.customer_phone}` : null,
    o.customer_company ? `Company: ${o.customer_company}` : null,
    `Order:   #${o.order_id || o.id}`,
    '',
    'Items:',
    ...o.items.map((it) => `  - ${it.product_name} x ${it.quantity} @ ${ghs(it.unit_price)} = ${ghs(it.line_total)}`),
    '',
    `Indicative total: ${ghs(o.total)}`,
    o.notes ? `\nCustomer notes:\n${o.notes}` : '',
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

function customerQuoteAck(o) {
  const subject = `Your quote request received — ${COMPANY}`;
  const html = layout({
    preheader: 'Thank you for your quote request. Our sales team will confirm pricing shortly.',
    headline: 'Quote request received',
    bodyHtml: `
      <p style="margin:0 0 12px;color:${INK_DARK};">Hello ${esc(o.customer_name.split(' ')[0] || o.customer_name)},</p>
      <p style="margin:0 0 16px;color:${INK_DARK};">
        Thanks for your quote request. Our sales team will review the items below and come back to you with confirmed pricing and delivery timing within one business day.
      </p>
      <h3 style="margin:20px 0 0;font-size:14px;color:${INK_DARK};">Your request</h3>
      ${lineItemsTable(o.items)}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;">
        <tr>
          <td style="font-size:14px;color:${INK_MUTED};text-align:right;">Indicative total</td>
          <td style="font-size:18px;color:${INK_DARK};font-weight:700;text-align:right;width:140px;padding-left:12px;">${ghs(o.total)}</td>
        </tr>
      </table>
      <p style="margin:18px 0 0;font-size:13px;color:${INK_MUTED};font-style:italic;">
        Indicative pricing. Final pricing is confirmed by our sales team after we check stock and delivery details.
      </p>
      <p style="margin:24px 0 4px;color:${INK_DARK};font-size:14px;">Reference: <strong>#${o.order_id || o.id}</strong></p>
      <p style="margin:0;font-size:14px;color:${INK_DARK};">
        Questions? Call <a href="tel:+233240000000" style="color:${BRAND_NAVY};">+233 24 000 0000</a>
        or reply to this email.
      </p>
      <p style="margin:24px 0 0;color:${INK_MUTED};font-size:13px;">— The MGE team</p>
    `,
    footerNote: `${COMPANY} &middot; Accra, Ghana &middot; This is an automated acknowledgement.`,
  });
  const text = [
    `Hello ${o.customer_name.split(' ')[0] || o.customer_name},`,
    '',
    `Thanks for your quote request. Our sales team will review the items and come back to you with confirmed pricing and delivery timing within one business day.`,
    '',
    'Your request:',
    ...o.items.map((it) => `  - ${it.product_name} x ${it.quantity} @ ${ghs(it.unit_price)} = ${ghs(it.line_total)}`),
    '',
    `Indicative total: ${ghs(o.total)}`,
    '',
    'Indicative pricing. Final pricing confirmed by our sales team.',
    '',
    `Reference: #${o.order_id || o.id}`,
    'Questions? Call +233 24 000 0000 or reply to this email.',
    '',
    '— The MGE team',
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

module.exports = {
  adminEnquiry,
  customerEnquiryAck,
  adminQuote,
  customerQuoteAck,
};
