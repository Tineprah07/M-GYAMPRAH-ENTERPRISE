// UTIL: Select helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ---------- YEAR IN FOOTER ---------- */
const yearSpan = $("#year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* ---------- MOBILE NAV ---------- */
const menuToggle = $("#menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
    }
  });
}

/* ---------- REVEAL ON SCROLL ---------- */
const revealEls = $$(".reveal");
if ("IntersectionObserver" in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  // Fallback
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* ---------- CART LOGIC ---------- */
let cart = [];

const cartToggleBtn = $("#cart-toggle");
const cartPanel = $("#cart-panel");
const cartCloseBtn = $("#cart-close");
const overlay = $("#overlay");
const cartItemsContainer = $("#cart-items");
const cartTotalEl = $("#cart-total");
const cartCountEl = $("#cart-count");

// Load from localStorage
const storedCart = localStorage.getItem("mgeCart");
if (storedCart) {
  try {
    cart = JSON.parse(storedCart);
  } catch {
    cart = [];
  }
  renderCart();
}

function openCart() {
  if (!cartPanel || !overlay) return;
  cartPanel.classList.add("open");
  overlay.classList.add("visible");
}

function closeCart() {
  if (!cartPanel || !overlay) return;
  cartPanel.classList.remove("open");
  overlay.classList.remove("visible");
}

if (cartToggleBtn) {
  cartToggleBtn.addEventListener("click", openCart);
}
if (cartCloseBtn) {
  cartCloseBtn.addEventListener("click", closeCart);
}
if (overlay) {
  overlay.addEventListener("click", () => {
    closeCart();
    if (navLinks) navLinks.classList.remove("open");
  });
}

function saveCart() {
  localStorage.setItem("mgeCart", JSON.stringify(cart));
}

function addToCart(item) {
  const existing = cart.find((c) => c.name === item.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(name) {
  cart = cart.filter((item) => item.name !== name);
  saveCart();
  renderCart();
}

function renderCart() {
  if (!cartItemsContainer || !cartTotalEl || !cartCountEl) return;

  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    cartTotalEl.textContent = "GHS 0.00";
    cartCountEl.textContent = "0";
    return;
  }

  let total = 0;
  let count = 0;

  cart.forEach((item) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    count += item.qty;

    const row = document.createElement("section");
    row.className = "cart-item";
    row.innerHTML = `
      <section>
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-meta">Qty: ${item.qty} × GHS ${item.price.toFixed(2)}</div>
      </section>
      <section style="text-align:right;">
        <div class="cart-item-meta">GHS ${lineTotal.toFixed(2)}</div>
        <button class="cart-item-remove" data-remove="${item.name}">Remove</button>
      </section>
    `;
    cartItemsContainer.appendChild(row);
  });

  cartTotalEl.textContent = `GHS ${total.toFixed(2)}`;
  cartCountEl.textContent = String(count);

  // Remove handlers
  cartItemsContainer.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-remove");
      if (name) removeFromCart(name);
    });
  });
}

// Attach add-to-cart listeners
$$("[data-add-to-cart]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.getAttribute("data-name") || "Item";
    const price = parseFloat(btn.getAttribute("data-price") || "0") || 0;
    addToCart({ name, price });
  });
});

/* ---------- PRODUCT FILTERS ---------- */
const filterButtons = $$(".filter-pill");
const productCards = $$(".product-card");

if (filterButtons.length && productCards.length) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";

      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      productCards.forEach((card) => {
        const category = card.getAttribute("data-category") || "";
        if (filter === "all") {
          card.style.display = "";
        } else {
          card.style.display = category.includes(filter) ? "" : "none";
        }
      });
    });
  });
}

/* ---------- CONTACT FORM (frontend only) ---------- */
const contactForm = $("#contact-form");
const contactFeedback = $("#contact-feedback");

if (contactForm && contactFeedback) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    contactFeedback.textContent = "Sending...";
    contactFeedback.className = "form-feedback";

    setTimeout(() => {
      contactFeedback.textContent =
        "Thank you for reaching out. We will respond as soon as possible.";
      contactFeedback.classList.add("success");
      contactForm.reset();
    }, 700);
  });
}
