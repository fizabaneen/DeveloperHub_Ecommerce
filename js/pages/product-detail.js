/**
 * product-detail.js
 * Dynamic Product Details Page Controller
 */

import { PRODUCTS }      from '../products-data.js';
import { initDropdown }  from '../components/dropdown.js';
import { toast }         from '../components/toast.js';
import { cart, triggerOpenDrawer, triggerOpenCheckout } from '../cart.js';
import { clamp, formatCurrency } from '../utils.js';

// Wishlist Storage Helpers
const WISHLIST_KEY = 'shopvibe_wishlist';
function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch { return []; }
}
function toggleWishlist(id) {
  const list = getWishlist();
  const idx = list.indexOf(id);
  let added = false;
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(id);
    added = true;
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return added;
}

// Page State Variables
let product = null;
let selectedColor = '';
let selectedVariant = '';
let selectedPrice = 0;
let quantity = 1;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Parse URL ID
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'prod-headphones';
  
  product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    product = PRODUCTS[0]; // Fallback
  }

  // Set page tab title
  document.title = `${product.name} – ShopVibe`;

  // 2. Populate Breadcrumbs
  populateBreadcrumbs();

  // 3. Populate Product Header Info
  populateProductInfo();

  // 4. Render Gallery
  renderGallery();

  // 5. Render Color Selector
  renderColors();

  // 6. Render Variant Dropdown
  renderVariants();

  // 7. Setup Quantity Stepper
  setupQuantityStepper();

  // 8. Setup Wishlist
  setupWishlist();

  // 9. Render Reviews
  renderReviews();

  // 10. Bind Actions (Add to Cart / Buy Now)
  setupActionButtons();
});

/**
 * Populate page breadcrumbs dynamically based on product category
 */
function populateBreadcrumbs() {
  const breadcrumbList = document.querySelector('.breadcrumb');
  if (!breadcrumbList) return;

  const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
  
  breadcrumbList.innerHTML = `
    <li><a href="index.html" class="breadcrumb__link">Home</a></li>
    <li class="breadcrumb__sep" aria-hidden="true">/</li>
    <li><a href="products.html?cat=${product.category}" class="breadcrumb__link">${categoryLabel}</a></li>
    <li class="breadcrumb__sep" aria-hidden="true">/</li>
    <li class="breadcrumb__current" aria-current="page">${product.name}</li>
  `;
}

/**
 * Populate description, brand, name, price information
 */
function populateProductInfo() {
  const brandEl = document.querySelector('.product-info__brand');
  const nameEl = document.querySelector('.product-info__name');
  const descEl = document.querySelector('.product-info__desc');
  const ratingRowEl = document.querySelector('.product-info__rating-row');

  if (brandEl) brandEl.textContent = product.brand;
  if (nameEl) nameEl.textContent = product.name;
  if (descEl) descEl.textContent = product.description;

  // Star Ratings rendering
  if (ratingRowEl) {
    const fullStars = Math.floor(product.rating);
    const hasHalf = product.rating % 1 !== 0;
    const starString = '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(5 - Math.ceil(product.rating));
    
    ratingRowEl.innerHTML = `
      <span class="star-rating" aria-label="${product.rating} out of 5 stars" style="font-size:1.1rem">${starString}</span>
      <span class="product-info__review-count">
        <a href="#reviews" id="review-anchor">${product.reviewsCount} reviews</a>
      </span>
      <span class="badge badge--success">✓ Verified Brand</span>
    `;
  }

  // Prices and discount rendering
  updatePriceDisplay(product.price);
}

/**
 * Update displayed pricing panel
 */
function updatePriceDisplay(price) {
  const priceEl = document.getElementById('product-price');
  const originalPriceEl = document.getElementById('product-price-original');
  const discountEl = document.querySelector('.product-info__discount');

  selectedPrice = price;

  if (priceEl) {
    priceEl.textContent = formatCurrency(price);
  }

  // Display original price and discount if present in product data
  if (product.originalPrice && price === product.price) {
    if (originalPriceEl) {
      originalPriceEl.textContent = formatCurrency(product.originalPrice);
      originalPriceEl.style.display = '';
    }
    if (discountEl) {
      const discountPct = Math.round((1 - price / product.originalPrice) * 100);
      discountEl.textContent = `Save ${discountPct}%`;
      discountEl.style.display = '';
    }
  } else {
    // If selecting a custom variant with a price update, or if originalPrice doesn't exist
    if (originalPriceEl) originalPriceEl.style.display = 'none';
    if (discountEl) discountEl.style.display = 'none';
  }
}

/**
 * Render main product gallery image and interactive thumbnails
 */
function renderGallery() {
  const mainImg = document.getElementById('gallery-main-img');
  const thumbsContainer = document.getElementById('gallery-thumbs');
  if (!thumbsContainer) return;

  if (mainImg && product.gallery && product.gallery.length > 0) {
    mainImg.src = product.gallery[0];
    mainImg.alt = `${product.name} – main view`;
  }

  thumbsContainer.innerHTML = '';
  
  if (product.gallery && product.gallery.length > 0) {
    product.gallery.forEach((imgSrc, index) => {
      const btn = document.createElement('button');
      btn.className = `gallery__thumb ${index === 0 ? 'gallery__thumb--active' : ''}`;
      btn.id = `thumb-${index + 1}`;
      btn.setAttribute('aria-label', `View image ${index + 1}`);
      btn.setAttribute('role', 'listitem');
      
      btn.innerHTML = `<img src="${imgSrc}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' fill=\\'%23cbd5e1\\'></svg>'"/>`;
      
      // Thumbnail Click handler with transition
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gallery__thumb').forEach(t => t.classList.remove('gallery__thumb--active'));
        btn.classList.add('gallery__thumb--active');

        if (mainImg) {
          mainImg.style.opacity = '0';
          mainImg.style.transition = 'opacity 0.22s ease';
          setTimeout(() => {
            mainImg.src = imgSrc;
            mainImg.style.opacity = '1';
          }, 200);
        }
      });

      thumbsContainer.appendChild(btn);
    });
  }
}

/**
 * Render clickable color selectors
 */
function renderColors() {
  const selectorContainer = document.querySelector('#color-selector .size-selector__options');
  const selectedLabel = document.getElementById('selected-color');
  if (!selectorContainer) return;

  selectorContainer.innerHTML = '';

  if (product.colors && product.colors.length > 0) {
    selectedColor = product.colors[0];
    if (selectedLabel) selectedLabel.textContent = selectedColor;

    // Define some background styling matches for typical color tokens
    const colorBgMap = {
      'Midnight Black': '#0f172a',
      'Pearl White': '#f8fafc',
      'Ocean Blue': '#2563eb',
      'Crimson Red': '#ef4444',
      'Olive Green': '#556b2f',
      'Classic Navy': '#000080',
      'Charcoal': '#36454f',
      'Neon Green': '#39ff14',
      'Stealth Black': '#1a1a1a',
      'Pure White': '#ffffff',
      'Steel Silver': '#c0c0c0',
      'Rose Gold': '#b76e79',
      'Active Black': '#000000',
      'Tan Brown': '#d2b48c',
      'Chestnut': '#954535',
      'Slate Gray': '#708090',
      'Pitch Black': '#0b0c10',
      'Titanium Gray': '#8e8e93',
      'Titanium Black': '#1c1c1e',
      'Deep Blue': '#004080',
      'Matte Black': '#212121',
      'Arctic White': '#e9f0f8',
      'Royal Blue': '#4169e1',
      'Emerald Green': '#50c878',
      'Dusty Rose': '#dcae96',
      'Iron Black': '#2a2a2a',
      'Lime Green': '#32cd32',
      'Coral Pink': '#f88379'
    };

    product.colors.forEach((color, index) => {
      const btn = document.createElement('button');
      btn.className = `size-btn ${index === 0 ? 'size-btn--active' : ''}`;
      btn.setAttribute('data-color', color);
      btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      
      // Look up background color from map, otherwise use simple text representation
      const hex = colorBgMap[color] || '#cbd5e1';
      btn.style.background = hex;
      btn.style.color = (hex === '#ffffff' || hex === '#f8fafc' || hex === '#e9f0f8') ? '#0f172a' : '#ffffff';
      btn.style.borderColor = (hex === '#ffffff' || hex === '#f8fafc') ? '#cbd5e1' : hex;
      btn.textContent = '●';
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('#color-selector .size-btn').forEach(b => {
          b.classList.remove('size-btn--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('size-btn--active');
        btn.setAttribute('aria-pressed', 'true');
        
        selectedColor = color;
        if (selectedLabel) selectedLabel.textContent = color;
      });

      selectorContainer.appendChild(btn);
    });
  } else {
    // Hide color selector if no colors exist
    const parent = document.getElementById('color-selector');
    if (parent) parent.style.display = 'none';
  }
}

/**
 * Render variants dropdown options dynamically
 */
function renderVariants() {
  const toggleBtn = document.getElementById('variant-toggle');
  const menuContainer = document.getElementById('variant-menu');
  const wrapper = document.getElementById('variant-dropdown');
  if (!menuContainer) return;

  menuContainer.innerHTML = '';

  if (product.variants && product.variants.length > 0) {
    selectedVariant = product.variants[0].name;
    if (toggleBtn) {
      toggleBtn.innerHTML = `${selectedVariant} <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
    }

    product.variants.forEach((v, index) => {
      const li = document.createElement('li');
      li.className = 'dropdown__item';
      li.setAttribute('data-value', v.name);
      li.setAttribute('data-price', v.price);
      li.setAttribute('role', 'option');
      li.textContent = `${v.name} – ${formatCurrency(v.price)}`;
      menuContainer.appendChild(li);
    });

    if (wrapper) {
      initDropdown(wrapper);
      
      // Listen for custom event dispatched by dropdown component
      wrapper.addEventListener('dropdown:change', (e) => {
        selectedVariant = e.detail.value;
        
        // Find matching variant details
        const variantObj = product.variants.find(v => v.name === selectedVariant);
        if (variantObj) {
          updatePriceDisplay(variantObj.price);
        }
        
        // Custom svg arrow retention in toggle HTML
        if (toggleBtn) {
          toggleBtn.innerHTML = `${selectedVariant} <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
        }
      });
    }
  } else {
    // Hide variant selector if not applicable
    const parent = document.getElementById('variant-selector');
    if (parent) parent.style.display = 'none';
  }
}

/**
 * Setup quantity stepper constraints
 */
function setupQuantityStepper() {
  const qtyValue = document.getElementById('qty-value');
  const qtyDecrease = document.getElementById('qty-decrease');
  const qtyIncrease = document.getElementById('qty-increase');
  const stockInfoEl = document.querySelector('.quantity-selector > span:last-child');

  if (stockInfoEl) {
    stockInfoEl.textContent = `✓ In Stock – ${product.stock} left`;
    stockInfoEl.style.color = product.stock <= 5 ? 'var(--color-danger)' : 'var(--color-success)';
  }

  function updateQty(newVal) {
    quantity = clamp(newVal, 1, product.stock);
    if (qtyValue) qtyValue.textContent = quantity;
    if (qtyDecrease) qtyDecrease.disabled = quantity <= 1;
    if (qtyIncrease) qtyIncrease.disabled = quantity >= product.stock;
  }

  qtyDecrease?.addEventListener('click', () => updateQty(quantity - 1));
  qtyIncrease?.addEventListener('click', () => updateQty(quantity + 1));
  updateQty(1);
}

/**
 * Setup wishlist toggle and persistent storage
 */
function setupWishlist() {
  const wishlistBtn = document.getElementById('btn-wishlist-detail');
  if (!wishlistBtn) return;

  const heartFilled = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const heartEmpty  = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  let wishlisted = getWishlist().includes(product.id);
  wishlistBtn.innerHTML = wishlisted ? heartFilled : heartEmpty;
  wishlistBtn.style.color = wishlisted ? 'var(--color-danger)' : '';
  wishlistBtn.setAttribute('aria-label', wishlisted ? 'Remove from wishlist' : 'Add to wishlist');

  wishlistBtn.addEventListener('click', () => {
    const added = toggleWishlist(product.id);
    wishlistBtn.innerHTML = added ? heartFilled : heartEmpty;
    wishlistBtn.style.color = added ? 'var(--color-danger)' : '';
    wishlistBtn.setAttribute('aria-label', added ? 'Remove from wishlist' : 'Add to wishlist');
    toast.show(
      added ? `❤️ Saved to your wishlist!` : `Removed from wishlist`,
      added ? 'success' : 'info',
      2000
    );
  });
}

/**
 * Generate and render realistic category-specific reviews
 */
function renderReviews() {
  const container = document.getElementById('review-list');
  const summaryScore = document.querySelector('.reviews__score-number');
  const summaryTotal = document.querySelector('.reviews__score-total');
  if (!container) return;

  // Render mock summary stats matching product
  if (summaryScore) summaryScore.textContent = product.rating.toFixed(1);
  if (summaryTotal) summaryTotal.textContent = `Based on ${product.reviewsCount} reviews`;

  // Render star ratings in summary
  const summaryStars = document.querySelector('.reviews__score .star-rating');
  if (summaryStars) {
    const fullStars = Math.floor(product.rating);
    const hasHalf = product.rating % 1 !== 0;
    summaryStars.textContent = '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(5 - Math.ceil(product.rating));
  }

  // Generate realistic reviews based on the category
  const reviewDb = {
    electronics: [
      { author: 'James D.', date: 'November 12, 2024', rating: 5, title: 'Incredible performance, worth every penny!', text: `The quality of this tech item is absolutely incredible. It operates exactly as described and has surpassed my expectations. Battery life and durability are top-notch. Highly recommend!` },
      { author: 'Sarah C.', date: 'October 28, 2024', rating: 4, title: 'Great quality, but minor setup issues', text: `Really impressed with the design and responsiveness. The material feels premium. It took me a few minutes to connect to the Bluetooth app but once set up, it was seamless.` },
      { author: 'Marcus K.', date: 'September 15, 2024', rating: 5, title: 'Outstanding! The best in class.', text: `Super clean look, very premium feeling, and exceptional build quality. This brand continues to deliver excellence.` }
    ],
    fashion: [
      { author: 'Emma L.', date: 'December 05, 2024', rating: 5, title: 'Extremely comfortable and stylish!', text: `I absolutely love the fabric and fit! It feels extremely premium and goes well with almost anything. True to size and holds up well after multiple washes.` },
      { author: 'Robert T.', date: 'November 22, 2024', rating: 4, title: 'Tailored fit, high quality material', text: `Fits exactly as expected and the style is very modern. The stitching is robust. The color was a tiny bit darker than the photo, but actually looks better.` },
      { author: 'Jessica V.', date: 'October 10, 2024', rating: 5, title: 'Gorgeous piece, highly recommend', text: `Such a sleek addition to my wardrobe. I get compliments every time I wear it. Beautiful tailoring.` }
    ],
    sports: [
      { author: 'David W.', date: 'January 14, 2025', rating: 5, title: 'Superb support and comfort!', text: `Perfect for my training sessions. The cushion support is amazing and absorbs impacts perfectly. Very breathable design, keeping my feet cool.` },
      { author: 'Alex H.', date: 'December 18, 2024', rating: 4, title: 'Great grip and feel, slightly narrow', text: `Excellent materials and build quality. The traction is top notch. It is just a little snug around the middle, so consider sizing up if you have wider feet.` },
      { author: 'Rachel M.', date: 'November 30, 2024', rating: 5, title: 'Fantastic purchase', text: `Best athletic gear I've bought this year. It stands up to heavy daily use and still looks brand new. Very satisfied.` }
    ],
    home: [
      { author: 'Linda G.', date: 'February 10, 2025', rating: 5, title: 'Beautiful design, very functional', text: `Looks stunning in my room! The build is solid and the assembly was incredibly easy. Highly recommend if you want to elevate your home styling.` },
      { author: 'Chris R.', date: 'January 25, 2025', rating: 4, title: 'Comfy and stylish', text: `Very pleased with the aesthetic. The padding is firm but comfortable. The package was heavy, but it was packaged securely.` },
      { author: 'Sophia J.', date: 'December 11, 2024', rating: 5, title: 'Elegant and durable', text: `Outstanding quality. The wood/finish looks very premium. Fits perfectly in my design setup.` }
    ]
  };

  const reviews = reviewDb[product.category] || reviewDb.electronics;

  container.innerHTML = '';
  reviews.forEach((rev, idx) => {
    const card = document.createElement('article');
    card.className = 'review-card';
    card.id = `review-${idx + 1}`;
    
    const initials = rev.author.split(' ').map(n => n[0]).join('');

    card.innerHTML = `
      <div class="review-card__header">
        <div class="review-card__author">
          <div class="review-card__avatar" aria-hidden="true">${initials}</div>
          <div>
            <p class="review-card__name">${rev.author}</p>
            <p class="review-card__date">${rev.date}</p>
          </div>
        </div>
        <span class="review-card__verified">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Verified Purchase
        </span>
      </div>
      <div class="star-rating" style="margin-bottom:var(--space-2)">${'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}</div>
      <h3 class="review-card__title">${rev.title}</h3>
      <p class="review-card__body">${rev.text}</p>
    `;
    container.appendChild(card);
  });
}

/**
 * Setup Add to Cart and Buy Now click actions
 */
function setupActionButtons() {
  const addToCartBtn = document.getElementById('btn-add-to-cart');
  const buyNowBtn = document.getElementById('btn-buy-now');

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      cart.add({
        id: product.id,
        name: product.name,
        price: selectedPrice,
        image: product.image,
        qty: quantity,
        variant: selectedVariant,
        color: selectedColor
      });

      // Show success animation state on button
      const originalHtml = addToCartBtn.innerHTML;
      addToCartBtn.innerHTML = '✓ Added to Cart!';
      addToCartBtn.disabled = true;
      addToCartBtn.style.background = 'var(--color-success)';
      addToCartBtn.style.borderColor = 'var(--color-success)';

      setTimeout(() => {
        addToCartBtn.innerHTML = originalHtml;
        addToCartBtn.style.background = '';
        addToCartBtn.style.borderColor = '';
        addToCartBtn.disabled = false;
      }, 2000);

      toast.show(`🛒 Added ${quantity} × ${product.name} to cart!`, 'success');
      
      // Auto-slide open the drawer
      setTimeout(() => {
        triggerOpenDrawer();
      }, 300);
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      // Add to cart first
      cart.add({
        id: product.id,
        name: product.name,
        price: selectedPrice,
        image: product.image,
        qty: quantity,
        variant: selectedVariant,
        color: selectedColor
      });

      toast.show('Opening checkout…', 'info', 1000);

      // Open checkout modal immediately
      setTimeout(() => {
        triggerOpenCheckout();
      }, 300);
    });
  }
}
