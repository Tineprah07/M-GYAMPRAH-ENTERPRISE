/* Slide-out cart, persistence, quote submission */
(function () {
  const STORAGE_KEY = 'mge_cart_v1';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  const Cart = {
    items: load(),

    add(product, qty = 1) {
      const existing = this.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += qty;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          unit: product.unit,
          image_url: product.image_url,
          quantity: qty,
        });
      }
      save(this.items);
      this.render();
      MGE.toast(`${product.name} added to cart`, 'success');
    },

    remove(id) {
      this.items = this.items.filter((i) => i.id !== id);
      save(this.items);
      this.render();
    },

    setQty(id, qty) {
      const it = this.items.find((i) => i.id === id);
      if (!it) return;
      it.quantity = Math.max(1, qty);
      save(this.items);
      this.render();
    },

    clear() {
      this.items = [];
      save(this.items);
      this.render();
    },

    total() {
      return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },

    count() {
      return this.items.reduce((s, i) => s + i.quantity, 0);
    },

    render() {
      const countEl = document.querySelector('[data-cart-count]');
      if (countEl) {
        const c = this.count();
        countEl.textContent = c;
        countEl.dataset.empty = c === 0 ? 'true' : 'false';
      }

      const body = document.querySelector('[data-cart-body]');
      const totalEl = document.querySelector('[data-cart-total]');
      const submitBtn = document.querySelector('[data-cart-submit]');
      if (!body) return;

      if (this.items.length === 0) {
        body.innerHTML = `<div class="cart-empty">
          ${MGE.icon ? MGE.icon('cart') : ''}
          <h4 style="margin:.25rem 0 .35rem;color:var(--ink-900);font-weight:600">Your cart is empty</h4>
          <p style="font-size:.88rem;color:var(--ink-400)">Browse our catalogue and request a quote for bulk orders.</p>
        </div>`;
        if (totalEl) totalEl.textContent = MGE.formatPrice(0);
        if (submitBtn) submitBtn.disabled = true;
        return;
      }

      if (submitBtn) submitBtn.disabled = false;
      body.innerHTML = this.items.map((i) => `
        <div class="cart-item">
          <img src="${MGE.escapeHtml(i.image_url || '')}" alt="${MGE.escapeHtml(i.name)}" loading="lazy" onerror="this.style.background='#eef2f7';this.removeAttribute('src');" />
          <div class="cart-item-info">
            <h4>${MGE.escapeHtml(i.name)}</h4>
            <span>${MGE.formatPrice(i.price)}${i.unit ? ' / ' + MGE.escapeHtml(i.unit) : ''}</span>
            <div class="cart-qty">
              <button type="button" aria-label="Decrease" data-cart-dec="${i.id}">−</button>
              <span>${i.quantity}</span>
              <button type="button" aria-label="Increase" data-cart-inc="${i.id}">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <strong>${MGE.formatPrice(i.price * i.quantity)}</strong>
            <button type="button" class="cart-remove" data-cart-remove="${i.id}">Remove</button>
          </div>
        </div>
      `).join('');

      if (totalEl) totalEl.textContent = MGE.formatPrice(this.total());
    },
  };

  // Drawer open/close
  function openCart() {
    document.querySelector('[data-cart-drawer]')?.classList.add('open');
    document.querySelector('[data-cart-overlay]')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    document.querySelector('[data-cart-drawer]')?.classList.remove('open');
    document.querySelector('[data-cart-overlay]')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cart-open], [data-cart-close], [data-cart-overlay], [data-cart-inc], [data-cart-dec], [data-cart-remove], [data-cart-add]');
    if (!t) return;

    if (t.matches('[data-cart-open]'))     { openCart(); }
    if (t.matches('[data-cart-close]'))    { closeCart(); }
    if (t.matches('[data-cart-overlay]'))  { closeCart(); }
    if (t.dataset.cartInc)                 { const id = Number(t.dataset.cartInc); const it = Cart.items.find(i=>i.id===id); if(it) Cart.setQty(id, it.quantity+1); }
    if (t.dataset.cartDec)                 { const id = Number(t.dataset.cartDec); const it = Cart.items.find(i=>i.id===id); if(it) Cart.setQty(id, it.quantity-1); }
    if (t.dataset.cartRemove)              { Cart.remove(Number(t.dataset.cartRemove)); }
  });

  // ESC closes cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  // Quote form (inside cart drawer)
  document.addEventListener('submit', async (e) => {
    if (!e.target.matches('[data-cart-form]')) return;
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[data-cart-submit]');
    const feedback = form.querySelector('[data-cart-feedback]');

    if (Cart.items.length === 0) {
      MGE.toast('Your cart is empty.', 'error');
      return;
    }

    const fd = new FormData(form);
    const payload = {
      customer_name: fd.get('customer_name')?.trim(),
      customer_email: fd.get('customer_email')?.trim(),
      customer_phone: fd.get('customer_phone')?.trim() || null,
      customer_company: fd.get('customer_company')?.trim() || null,
      notes: fd.get('notes')?.trim() || null,
      items: Cart.items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    };

    btn.disabled = true;
    const oldLabel = btn.textContent;
    btn.textContent = 'Submitting…';
    if (feedback) feedback.classList.remove('show', 'success', 'error');

    try {
      const res = await MGE.api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      Cart.clear();
      form.reset();
      if (feedback) {
        feedback.textContent = res.message || 'Quote request received.';
        feedback.classList.add('show', 'success');
      }
      MGE.toast('Quote request submitted.', 'success');
      setTimeout(closeCart, 1800);
    } catch (err) {
      if (feedback) {
        feedback.textContent = err.message || 'Something went wrong. Please try again.';
        feedback.classList.add('show', 'error');
      }
      MGE.toast(err.message || 'Submission failed', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = oldLabel;
    }
  });

  // Expose for products.js
  MGE.Cart = Cart;
  // Initial render
  Cart.render();
})();
