/**
 * Global config & API helpers shared by all pages.
 * If you serve the static client from the Express server itself,
 * leave API_BASE empty and the relative /api/* paths just work.
 */
window.MGE = window.MGE || {};

MGE.API_BASE = (() => {
  // If client is served from same origin as API, use relative paths.
  // If you open the HTML directly (file://) or via Live Server, point this at your API host.
  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    // When using Live Server on 5500/5173 and Express on 4000:
    if (window.location.port && window.location.port !== '4000') {
      return 'http://localhost:4000';
    }
  }
  return '';
})();

MGE.api = async function api(path, options = {}) {
  const res = await fetch(`${MGE.API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
};

MGE.formatPrice = function formatPrice(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(n);
};

MGE.escapeHtml = function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
