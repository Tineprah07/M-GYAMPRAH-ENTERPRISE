/* Font Awesome icon helper + brand logo (SVG).
 *
 * - Static icons in HTML are written directly as <i class="fa-solid fa-..."></i>.
 * - Dynamic templates (cart.js, products.js) call MGE.icon('NAME') to get the
 *   FA HTML string. Internal MGE names map to FA 6 classes here.
 * - The brand logo is still an SVG mark — FA doesn't have a custom MGE logo.
 */
(function () {
  // Internal name -> Font Awesome 6 (free) class string
  const FA_MAP = {
    building:    'fa-solid fa-building',
    steel:       'fa-solid fa-layer-group',
    fuel:        'fa-solid fa-gas-pump',
    truck:       'fa-solid fa-truck-fast',
    shield:      'fa-solid fa-shield-halved',
    award:       'fa-solid fa-award',
    handshake:   'fa-solid fa-handshake',
    coins:       'fa-solid fa-tags',
    globe:       'fa-solid fa-earth-africa',
    clock:       'fa-regular fa-clock',
    check:       'fa-solid fa-check',
    checkCircle: 'fa-solid fa-circle-check',
    spark:       'fa-solid fa-bolt',
    layers:      'fa-solid fa-layer-group',
    bolt:        'fa-solid fa-bolt',
    arrowRight:  'fa-solid fa-arrow-right',
    chevronRight:'fa-solid fa-chevron-right',
    search:      'fa-solid fa-magnifying-glass',
    cart:        'fa-solid fa-cart-shopping',
    close:       'fa-solid fa-xmark',
    phone:       'fa-solid fa-phone',
    mail:        'fa-solid fa-envelope',
    pin:         'fa-solid fa-location-dot',
    box:         'fa-solid fa-box-open',
    warn:        'fa-solid fa-triangle-exclamation',
  };

  // Brand logo: stacked bars suggesting materials/coils + M monogram + accent dot.
  // Kept as SVG because FA does not provide a custom company mark.
  const LOGO = `
    <svg viewBox="0 0 40 40" class="brand-mark" aria-hidden="true" fill="currentColor">
      <rect x="3"  y="18" width="6" height="20" rx="1.5"/>
      <rect x="11" y="10" width="6" height="28" rx="1.5"/>
      <rect x="19" y="14" width="6" height="24" rx="1.5"/>
      <path d="M27 4 L31 10 L35 4 V14 H33 V9 L31 12 L29 9 V14 H27 Z"/>
      <circle cx="36" cy="36" r="2"/>
    </svg>
  `;

  function renderLogos(root = document) {
    root.querySelectorAll('[data-logo]').forEach((node) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = LOGO;
      const el = tmp.firstElementChild;
      if (!el) return;
      const extra = node.getAttribute('class') || '';
      if (extra) el.setAttribute('class', ('brand-mark ' + extra).trim());
      node.replaceWith(el);
    });
  }

  window.MGE = window.MGE || {};
  // Returns "<i class='fa-solid fa-...' aria-hidden='true'></i>" or '' if unknown.
  MGE.icon = (name, extraClass = '') => {
    const fa = FA_MAP[name];
    if (!fa) return '';
    const cls = extraClass ? `${fa} ${extraClass}` : fa;
    return `<i class="${cls}" aria-hidden="true"></i>`;
  };
  MGE.logo = () => LOGO;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderLogos());
  } else {
    renderLogos();
  }
})();
