/**
 * cart.js
 * Lightweight cart manager persisted in localStorage,
 * coupled with a dynamic Cart Drawer and Checkout Modal.
 */

import { storage, bus, formatCurrency } from './utils.js';

const CART_KEY = 'shopvibe_cart';

function load() { return storage.get(CART_KEY, []); }
function save(items) { storage.set(CART_KEY, items); }

export const cart = {
  /** Return a fresh copy of the cart array. */
  items() { return load(); },

  /** Total number of individual units in the cart. */
  count() { return load().reduce((sum, item) => sum + item.qty, 0); },

  /** Total price of all items. */
  subtotal() { return load().reduce((sum, item) => sum + item.price * item.qty, 0); },

  /**
   * Add a product to the cart.
   * If it already exists with the same ID, variant, and color, increments qty.
   * @param {{ id:string, name:string, price:number, image:string, qty?:number, variant?:string, color?:string }} product
   */
  add(product) {
    const items = load();
    const variant = product.variant || 'Standard';
    const color = product.color || 'Default';
    
    // Check if matching id, variant, and color
    const idx = items.findIndex(i => i.id === product.id && (i.variant || 'Standard') === variant && (i.color || 'Default') === color);
    
    if (idx > -1) {
      items[idx].qty += (product.qty ?? 1);
    } else {
      items.push({
        ...product,
        variant,
        color,
        qty: product.qty ?? 1
      });
    }
    save(items);
    bus.emit('cart:updated', { items, count: this.count(), subtotal: this.subtotal() });
  },

  /**
   * Remove an item entirely by index or matching properties.
   */
  remove(id, variant, color) {
    const items = load().filter(i => !(i.id === id && (i.variant || 'Standard') === (variant || 'Standard') && (i.color || 'Default') === (color || 'Default')));
    save(items);
    bus.emit('cart:updated', { items, count: this.count(), subtotal: this.subtotal() });
  },

  /**
   * Update the quantity of an existing item.
   * Setting qty to 0 removes it.
   */
  updateQty(id, variant, color, qty) {
    if (qty <= 0) { this.remove(id, variant, color); return; }
    const items = load();
    const idx = items.findIndex(i => i.id === id && (i.variant || 'Standard') === (variant || 'Standard') && (i.color || 'Default') === (color || 'Default'));
    if (idx > -1) { items[idx].qty = qty; save(items); }
    bus.emit('cart:updated', { items, count: this.count(), subtotal: this.subtotal() });
  },

  /** Empty the cart. */
  clear() {
    save([]);
    bus.emit('cart:updated', { items: [], count: 0, subtotal: 0 });
  },

  /** Human-readable subtotal string e.g. "$149.97" */
  subtotalFormatted() { return formatCurrency(this.subtotal()); },
};

// Compatibility wrapper
export function addToCart(product) {
  cart.add(product);
}

/* ── UI INJECTION & EVENT HANDLERS ────────────────────────────────────────── */

// Inject styles directly or wait for stylesheet. Let's create DOM structures on load.
document.addEventListener('DOMContentLoaded', () => {
  createCartDrawer();
  createCheckoutModal();
  syncBadge();
  renderDrawerItems();
  
  // Wire header cart button click
  const btnCart = document.getElementById('btn-cart');
  if (btnCart) {
    btnCart.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });
  }
});

function syncBadge() {
  const badge = document.querySelector('.header__badge');
  if (!badge) return;
  const count = cart.count();
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
  
  const drawerBadge = document.querySelector('.cart-drawer__count-badge');
  if (drawerBadge) {
    drawerBadge.textContent = count;
  }
}

bus.on('cart:updated', () => {
  syncBadge();
  renderDrawerItems();
});

/* ── CART DRAWER FUNCTIONS ───────────────────────────────────────────────── */

function createCartDrawer() {
  if (document.getElementById('cart-drawer')) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'cart-drawer-overlay';
  overlay.className = 'cart-drawer-overlay';
  document.body.appendChild(overlay);

  // Create drawer
  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer';
  drawer.className = 'cart-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Shopping Cart');
  
  drawer.innerHTML = `
    <div class="cart-drawer__header">
      <h2 class="cart-drawer__title">Shopping Cart (<span class="cart-drawer__count-badge">0</span>)</h2>
      <button class="cart-drawer__close" id="cart-drawer-close" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-drawer__content" id="cart-drawer-items">
      <!-- Dynamic Items -->
    </div>
    <div class="cart-drawer__footer">
      <div class="cart-drawer__subtotal-row">
        <span>Subtotal</span>
        <strong id="cart-drawer-subtotal">$0.00</strong>
      </div>
      <p class="cart-drawer__shipping-note">Shipping & taxes calculated at checkout.</p>
      <button class="btn btn--primary btn--full" id="cart-drawer-checkout">Proceed to Checkout</button>
      <button class="btn btn--outline btn--full" id="cart-drawer-continue" style="margin-top:var(--space-2)">Continue Shopping</button>
    </div>
  `;
  document.body.appendChild(drawer);

  // Event Listeners for drawer closing
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('cart-drawer-close')?.addEventListener('click', closeDrawer);
  document.getElementById('cart-drawer-continue')?.addEventListener('click', closeDrawer);

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('cart-drawer--open')) {
      closeDrawer();
    }
  });

  // Proceed to Checkout
  document.getElementById('cart-drawer-checkout')?.addEventListener('click', () => {
    if (cart.items().length === 0) {
      alert('Your cart is empty. Add some products before checking out!');
      return;
    }
    closeDrawer();
    openCheckout();
  });
}

function openDrawer() {
  document.getElementById('cart-drawer')?.classList.add('cart-drawer--open');
  document.getElementById('cart-drawer-overlay')?.classList.add('cart-drawer-overlay--visible');
  document.body.style.overflow = 'hidden'; // lock scroll
}

function closeDrawer() {
  document.getElementById('cart-drawer')?.classList.remove('cart-drawer--open');
  document.getElementById('cart-drawer-overlay')?.classList.remove('cart-drawer-overlay--visible');
  document.body.style.overflow = ''; // unlock scroll
}

// Dynamically expose openDrawer so detail page can trigger it on Add to Cart
export function triggerOpenDrawer() {
  openDrawer();
}

function renderDrawerItems() {
  const container = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  if (!container) return;

  const items = cart.items();
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="cart-drawer__empty" style="text-align:center;padding:var(--space-12) var(--space-4);color:var(--color-text-secondary);">
        <div style="font-size:3rem;margin-bottom:var(--space-4)">🛒</div>
        <p style="font-weight:600">Your cart is empty</p>
        <p style="font-size:var(--font-size-sm);margin-top:var(--space-2)">Looks like you haven't added anything to your cart yet.</p>
        <button class="btn btn--primary btn--sm" id="cart-drawer-empty-shop" style="margin-top:var(--space-6)">Shop Now</button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
    
    // Bind click to shop now
    document.getElementById('cart-drawer-empty-shop')?.addEventListener('click', () => {
      closeDrawer();
      window.location.href = 'products.html';
    });
    return;
  }

  container.innerHTML = '';
  items.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img class="cart-item__image" src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'80\\' height=\\'80\\' fill=\\'%23e2e8f0\\'></svg>'"/>
      <div class="cart-item__details">
        <h4 class="cart-item__name"><a href="product-detail.html?id=${item.id}">${item.name}</a></h4>
        <p class="cart-item__meta">Variant: <span>${item.variant}</span> | Color: <span>${item.color}</span></p>
        <div class="cart-item__price-qty">
          <span class="cart-item__price">${formatCurrency(item.price)}</span>
          <div class="cart-item__qty-controls">
            <button class="cart-item__qty-btn qty-dec-btn" aria-label="Decrease quantity">−</button>
            <span class="cart-item__qty-val">${item.qty}</span>
            <button class="cart-item__qty-btn qty-inc-btn" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
      <button class="cart-item__remove" aria-label="Remove item">&times;</button>
    `;

    // Bind event listeners for quantity buttons
    itemEl.querySelector('.qty-dec-btn').addEventListener('click', () => {
      cart.updateQty(item.id, item.variant, item.color, item.qty - 1);
    });
    itemEl.querySelector('.qty-inc-btn').addEventListener('click', () => {
      cart.updateQty(item.id, item.variant, item.color, item.qty + 1);
    });
    itemEl.querySelector('.cart-item__remove').addEventListener('click', () => {
      cart.remove(item.id, item.variant, item.color);
    });

    container.appendChild(itemEl);
  });

  if (subtotalEl) {
    subtotalEl.textContent = cart.subtotalFormatted();
  }
}

/* ── CHECKOUT MODAL FUNCTIONS ────────────────────────────────────────────── */

function createCheckoutModal() {
  if (document.getElementById('checkout-modal')) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'checkout-modal-overlay';
  overlay.className = 'checkout-modal-overlay';
  document.body.appendChild(overlay);

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'checkout-modal';
  modal.className = 'checkout-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Checkout');
  
  modal.innerHTML = `
    <button class="checkout-modal__close" id="checkout-modal-close" aria-label="Close checkout">&times;</button>
    <div class="checkout-modal__body">
      <div class="checkout-modal__step" id="checkout-step-form">
        <h2 class="checkout-modal__title">Checkout Details</h2>
        <form id="checkout-form" style="margin-top:var(--space-4)">
          <div class="form-group">
            <label class="form-label" for="checkout-name">Full Name</label>
            <input class="form-input" id="checkout-name" type="text" required placeholder="John Doe" autocomplete="name" />
          </div>
          <div class="form-group" style="margin-top:var(--space-3)">
            <label class="form-label" for="checkout-email">Email Address</label>
            <input class="form-input" id="checkout-email" type="email" required placeholder="john@example.com" autocomplete="email" />
          </div>
          <div class="form-group" style="margin-top:var(--space-3)">
            <label class="form-label" for="checkout-address">Shipping Address</label>
            <input class="form-input" id="checkout-address" type="text" required placeholder="123 Main St, City, Country" autocomplete="shipping street-address" />
          </div>
          <div class="form-row" style="display:flex;gap:var(--space-3);margin-top:var(--space-3)">
            <div class="form-group" style="flex:1">
              <label class="form-label" for="checkout-card">Card Number</label>
              <input class="form-input" id="checkout-card" type="text" required placeholder="1234 5678 1234 5678" pattern="[0-9 ]{12,19}" inputmode="numeric" />
            </div>
            <div class="form-group" style="width:110px">
              <label class="form-label" for="checkout-expiry">Expiry</label>
              <input class="form-input" id="checkout-expiry" type="text" required placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\\/[0-9]{2}" />
            </div>
          </div>
          <div class="checkout-modal__summary" style="margin-top:var(--space-6);background:var(--color-neutral-100);padding:var(--space-4);border-radius:var(--radius-md)">
            <div class="flex-between">
              <span style="font-weight:500;color:var(--color-text-secondary);">Total Amount</span>
              <strong id="checkout-modal-total" style="font-size:1.2rem;color:var(--color-primary);">$0.00</strong>
            </div>
          </div>
          <button class="btn btn--primary btn--full" type="submit" style="margin-top:var(--space-6)" id="checkout-submit-btn">Place Order</button>
        </form>
      </div>
      <div class="checkout-modal__step" id="checkout-step-success" style="display:none;text-align:center;padding:var(--space-8) var(--space-4)">
        <div class="checkout-success-icon" style="font-size:4rem;color:var(--color-success);margin-bottom:var(--space-4)">✓</div>
        <h2 class="checkout-modal__title">Order Confirmed!</h2>
        <p style="color:var(--color-text-secondary);margin-top:var(--space-3);line-height:1.6;">
          Thank you for your purchase! Your order has been placed successfully.<br/>
          Order number: <strong id="checkout-order-number" style="color:var(--color-neutral-900)">#SV-123456</strong>
        </p>
        <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-top:var(--space-2)">
          We have sent a confirmation email with tracking details to your inbox.
        </p>
        <button class="btn btn--primary" id="checkout-success-close" style="margin-top:var(--space-8);padding-inline:var(--space-8);">Continue Shopping</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Wire close buttons
  overlay.addEventListener('click', closeCheckout);
  document.getElementById('checkout-modal-close')?.addEventListener('click', closeCheckout);
  document.getElementById('checkout-success-close')?.addEventListener('click', () => {
    closeCheckout();
    window.location.href = 'products.html';
  });

  // Card formatting spaces helper
  const cardInput = document.getElementById('checkout-card');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formatted = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
      }
      e.target.value = formatted.substring(0, 19); // 16 digits + 3 spaces
    });
  }

  // Expiry MM/YY forward slash auto-insert
  const expiryInput = document.getElementById('checkout-expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (value.length > 2) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
      } else {
        e.target.value = value;
      }
    });
  }

  // Form submit handler
  document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('checkout-submit-btn');
    if (btn) {
      btn.textContent = 'Processing Payment…';
      btn.disabled = true;
    }

    setTimeout(() => {
      // Set random order number
      const orderNum = 'SV-' + Math.floor(100000 + Math.random() * 900000);
      const orderNumEl = document.getElementById('checkout-order-number');
      if (orderNumEl) orderNumEl.textContent = '#' + orderNum;

      // Swap views
      document.getElementById('checkout-step-form').style.display = 'none';
      document.getElementById('checkout-step-success').style.display = 'block';

      // Clear the cart
      cart.clear();

      // Reset submit button
      if (btn) {
        btn.textContent = 'Place Order';
        btn.disabled = false;
      }
    }, 1500);
  });
}

function openCheckout() {
  document.getElementById('checkout-modal-total').textContent = cart.subtotalFormatted();
  document.getElementById('checkout-step-form').style.display = 'block';
  document.getElementById('checkout-step-success').style.display = 'none';
  document.getElementById('checkout-form').reset();

  document.getElementById('checkout-modal')?.classList.add('checkout-modal--open');
  document.getElementById('checkout-modal-overlay')?.classList.add('checkout-modal-overlay--visible');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkout-modal')?.classList.remove('checkout-modal--open');
  document.getElementById('checkout-modal-overlay')?.classList.remove('checkout-modal-overlay--visible');
  document.body.style.overflow = '';
}

// Dynamically expose openCheckout so product details can buy now
export function triggerOpenCheckout() {
  openCheckout();
}