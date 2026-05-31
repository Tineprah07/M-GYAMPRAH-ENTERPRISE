/* Products page logic - fetches from API, filters, search, add-to-cart */
(function () {
  const grid    = document.querySelector('[data-products-grid]');
  const chips   = document.querySelector('[data-filter-chips]');
  const search  = document.querySelector('[data-product-search]');
  const status  = document.querySelector('[data-products-status]');
  const featured = document.querySelector('[data-featured-grid]');

  if (!grid && !featured) return;

  const CATEGORY_LABELS = {
    all: 'All products',
    'building-materials': 'Building Materials',
    'steel-imports': 'Steel Imports',
    'fuel': 'Fuel Station',
  };

  const state = { items: [], category: 'all', search: '' };

  function cardHtml(p) {
    const badge = p.is_featured ? `<span class="product-badge">Featured</span>` : '';
    const img = p.image_url
      ? `<img src="${MGE.escapeHtml(p.image_url)}" alt="${MGE.escapeHtml(p.name)}" loading="lazy" onerror="this.style.background='#eef2f7';this.removeAttribute('src')" />`
      : `<div style="width:100%;height:100%;background:#eef2f7"></div>`;
    return `
      <article class="product-card reveal">
        <div class="product-media">
          ${img}
          ${badge}
        </div>
        <div class="product-body">
          <span class="product-cat">${MGE.escapeHtml(CATEGORY_LABELS[p.category] || p.category)}</span>
          <h3 class="product-name">${MGE.escapeHtml(p.name)}</h3>
          <p class="product-desc">${MGE.escapeHtml(p.description || '')}</p>
          <div class="product-footer">
            <div class="product-price">
              <strong>${MGE.formatPrice(p.price)}</strong>
              ${p.unit ? `<span>per ${MGE.escapeHtml(p.unit)}</span>` : ''}
            </div>
            <button class="btn btn-primary btn-sm" data-add-id="${p.id}">Add to cart ${MGE.icon ? MGE.icon('arrowRight') : ''}</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderGrid() {
    if (!grid) return;
    let list = state.items;
    if (state.category !== 'all') list = list.filter((p) => p.category === state.category);
    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (CATEGORY_LABELS[p.category] || '').toLowerCase().includes(q)
      );
    }
    if (status) status.textContent = `Showing ${list.length} ${list.length === 1 ? 'product' : 'products'}`;

    if (list.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        ${MGE.icon ? MGE.icon('box') : ''}
        <h3 style="margin-top:1rem;color:var(--ink-900)">No products match your search</h3>
        <p style="margin:.35rem 0 0">Try a different keyword or category.</p>
      </div>`;
      return;
    }
    grid.innerHTML = list.map(cardHtml).join('');
    // Re-run reveal observer on new nodes
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
      }, { threshold: 0.1 });
      grid.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    } else {
      grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }
  }

  function renderFeatured() {
    if (!featured) return;
    const list = state.items.filter((p) => p.is_featured).slice(0, 4);
    featured.innerHTML = list.map(cardHtml).join('');
  }

  async function load() {
    try {
      if (grid) grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Loading catalogue…</div>`;
      const res = await MGE.api('/api/products');
      state.items = res.data || [];
      renderGrid();
      renderFeatured();
    } catch (err) {
      console.error('Failed to load products:', err);
      const msg = `<div class="empty-state" style="grid-column:1/-1">
        ${MGE.icon ? MGE.icon('warn') : ''}
        <h3 style="margin-top:1rem;color:var(--ink-900)">Catalogue unavailable</h3>
        <p style="margin:.35rem 0 0">We could not reach the product API. Please make sure the backend server is running, then refresh.</p>
        <p style="font-size:.78rem;color:var(--ink-300);margin-top:1rem">${MGE.escapeHtml(err.message)}</p>
      </div>`;
      if (grid) grid.innerHTML = msg;
      if (featured) featured.innerHTML = msg;
    }
  }

  // Filter chip clicks
  if (chips) {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.category = chip.dataset.cat;
      renderGrid();
    });
  }

  // Search input
  if (search) {
    let t;
    search.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.search = e.target.value.trim();
        renderGrid();
      }, 180);
    });
  }

  // Add to cart click delegation (works on home featured + products page)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-id]');
    if (!btn) return;
    const id = Number(btn.dataset.addId);
    const p = state.items.find((x) => x.id === id);
    if (!p) return;
    MGE.Cart?.add(p, 1);
  });

  load();
})();
