/**
 * products.js
 * Product Listing Page Controller
 */

import { PRODUCTS }      from '../products-data.js';
import { initDropdown }  from '../components/dropdown.js';
import { toast }         from '../components/toast.js';
import { cart, triggerOpenDrawer } from '../cart.js';
import { debounce, formatCurrency } from '../utils.js';

// Wishlist LocalStorage Helpers
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

// Page State
let currentPage = 1;
const itemsPerPage = 6;
let activeSort = 'featured';
let searchQuery = '';

// Active Filters State
const activeFilters = {
  categories: [],
  maxPrice: 500,
  ratings: [],
  brands: []
};

document.addEventListener('DOMContentLoaded', () => {
  // Read initial search query from URL parameter e.g. ?search=sneakers
  const urlParams = new URLSearchParams(window.location.search);
  const urlSearch = urlParams.get('search');
  const searchInput = document.getElementById('search-input');
  
  if (urlSearch) {
    searchQuery = urlSearch.trim().toLowerCase();
    if (searchInput) {
      searchInput.value = urlSearch;
    }
  }

  // Initialize Price Range slider
  const priceRange = document.getElementById('price-range');
  const priceVal = document.getElementById('price-range-val');
  if (priceRange && priceVal) {
    activeFilters.maxPrice = parseFloat(priceRange.value);
    priceVal.textContent = `$${priceRange.value}`;
    
    priceRange.addEventListener('input', () => {
      priceVal.textContent = `$${priceRange.value}`;
      activeFilters.maxPrice = parseFloat(priceRange.value);
    });
  }

  // Initialize Sort Dropdown
  const sortDropdownEl = document.getElementById('sort-dropdown');
  if (sortDropdownEl) {
    initDropdown(sortDropdownEl);
    sortDropdownEl.addEventListener('dropdown:change', (e) => {
      activeSort = e.detail.value;
      currentPage = 1;
      renderProducts();
      toast.show(`Sorted by: ${e.detail.label}`, 'info', 1500);
    });
  }

  // Read Checkbox Filters on load
  readFiltersFromDOM();

  // Initial Product Render
  renderProducts();

  // Apply Filters Click Handler
  document.getElementById('apply-filters')?.addEventListener('click', () => {
    readFiltersFromDOM();
    currentPage = 1;
    renderProducts();
    toast.show('Filters applied!', 'success', 1500);
  });

  // Clear Filters Click Handler
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    // Reset Checkboxes
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    
    // Reset Price range
    if (priceRange && priceVal) {
      priceRange.value = 500;
      priceVal.textContent = '$500';
      activeFilters.maxPrice = 500;
    }

    // Reset URL Search param if any
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (searchInput) {
      searchInput.value = '';
    }
    searchQuery = '';
    
    readFiltersFromDOM();
    currentPage = 1;
    renderProducts();
    toast.show('All filters cleared.', 'info', 1500);
  });

  // Global Search integration (live filtering on products page)
  document.addEventListener('search:query', (e) => {
    searchQuery = e.detail.query;
    currentPage = 1;
    renderProducts();
  });

  // View Layout Toggle (Grid / List)
  const gridBtn = document.getElementById('view-grid');
  const listBtn = document.getElementById('view-list');
  const productsGrid = document.getElementById('products-grid');

  if (gridBtn && listBtn && productsGrid) {
    function setView(mode) {
      const isGrid = mode === 'grid';
      productsGrid.classList.toggle('products-grid--list', !isGrid);
      gridBtn.classList.toggle('view-toggle__btn--active', isGrid);
      listBtn.classList.toggle('view-toggle__btn--active', !isGrid);
      gridBtn.setAttribute('aria-pressed', String(isGrid));
      listBtn.setAttribute('aria-pressed', String(!isGrid));
    }
    gridBtn.addEventListener('click', () => setView('grid'));
    listBtn.addEventListener('click', () => setView('list'));
  }
});

/**
 * Read the checked filters from DOM and save to activeFilters state
 */
function readFiltersFromDOM() {
  // Categories
  activeFilters.categories = Array.from(
    document.querySelectorAll('#filter-category input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  // Ratings
  activeFilters.ratings = Array.from(
    document.querySelectorAll('#filter-rating input[type="checkbox"]:checked')
  ).map(cb => parseInt(cb.value));

  // Brands
  activeFilters.brands = Array.from(
    document.querySelectorAll('#filter-brand input[type="checkbox"]:checked')
  ).map(cb => cb.value.toLowerCase());
}

/**
 * Render the filtered, sorted, paginated list of products
 */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('product-count');
  if (!grid) return;

  // 1. Filter
  let filtered = PRODUCTS.filter(product => {
    // Search query filter
    if (searchQuery) {
      const name = product.name.toLowerCase();
      const desc = product.description.toLowerCase();
      const brand = product.brand.toLowerCase();
      if (!name.includes(searchQuery) && !desc.includes(searchQuery) && !brand.includes(searchQuery)) {
        return false;
      }
    }

    // Category filter (if any checked, must match one of them)
    if (activeFilters.categories.length > 0) {
      if (!activeFilters.categories.includes(product.category)) {
        return false;
      }
    }

    // Price range filter
    if (product.price > activeFilters.maxPrice) {
      return false;
    }

    // Rating filter (minimum checked rating)
    if (activeFilters.ratings.length > 0) {
      // Find minimum required rating based on checkboxes e.g. 4+ means >= 4
      const minRating = Math.min(...activeFilters.ratings);
      if (product.rating < minRating) {
        return false;
      }
    }

    // Brand filter
    if (activeFilters.brands.length > 0) {
      if (!activeFilters.brands.includes(product.brand.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // 2. Sort
  if (activeSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (activeSort === 'newest') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  // 'featured' keeps database order.

  const totalCount = filtered.length;

  // 3. Paginate
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const pageItems = filtered.slice(startIndex, endIndex);

  // 4. Update Header Count Text
  if (countEl) {
    countEl.innerHTML = `Showing <strong>${totalCount > 0 ? startIndex + 1 : 0}-${endIndex}</strong> of <strong>${totalCount}</strong> products`;
  }

  // 5. Render Grid Cards
  if (pageItems.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-12) var(--space-4); background: var(--color-white); border-radius: var(--radius-lg); border: 1px dashed var(--color-border)">
        <span style="font-size: 2.5rem;">🔍</span>
        <h3 style="margin-top: var(--space-4); font-weight: 700;">No Products Found</h3>
        <p style="color: var(--color-text-secondary); margin-top: var(--space-2)">Try clearing filters or search terms to see all available products.</p>
      </div>
    `;
    renderPagination(totalPages);
    return;
  }

  grid.innerHTML = '';
  const wishlist = getWishlist();

  pageItems.forEach(item => {
    const isWishlisted = wishlist.includes(item.id);
    const card = document.createElement('article');
    card.className = 'card';
    card.id = `card-${item.id}`;

    // Calculate rating stars
    const fullStars = Math.floor(item.rating);
    const hasHalf = item.rating % 1 !== 0;
    const starString = '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(5 - Math.ceil(item.rating));

    card.innerHTML = `
      <div class="card__image-wrap">
        ${item.originalPrice ? `<span class="card__badge"><span class="badge badge--danger">-${Math.round((1 - item.price/item.originalPrice)*100)}%</span></span>` : ''}
        <button class="card__wishlist" aria-label="Add to wishlist" data-wishlisted="${isWishlisted}">
          ${isWishlisted ? '♥' : '♡'}
        </button>
        <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.parentElement.style.background='linear-gradient(135deg,#e2e8f0,#cbd5e1)'" />
      </div>
      <div class="card__body">
        <div class="card__rating">
          <span class="star-rating" aria-label="${item.rating} out of 5 stars">${starString}</span>
          <span class="card__rating-count">(${item.reviewsCount})</span>
        </div>
        <h3 class="card__title">${item.name}</h3>
        <p class="card__price">
          ${formatCurrency(item.price)}
          ${item.originalPrice ? `<span class="card__price--original">${formatCurrency(item.originalPrice)}</span>` : ''}
        </p>
        <button class="btn btn--primary btn--full add-to-cart-card" data-id="${item.id}">Add to Cart</button>
      </div>
    `;

    // Make entire card clickable for detail navigation
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-card') || e.target.closest('.card__wishlist')) {
        return;
      }
      window.location.href = `product-detail.html?id=${item.id}`;
    });

    // Wire Add to Cart inside the card
    card.querySelector('.add-to-cart-card').addEventListener('click', (e) => {
      e.stopPropagation();
      cart.add({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: 1
      });
      toast.show(`🛒 "${item.name}" added to cart!`, 'success');
      triggerOpenDrawer();
    });

    // Wire Wishlist Toggle
    const wishlistBtn = card.querySelector('.card__wishlist');
    wishlistBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = toggleWishlist(item.id);
      wishlistBtn.setAttribute('data-wishlisted', String(added));
      wishlistBtn.textContent = added ? '♥' : '♡';
      toast.show(
        added ? `❤️ "${item.name}" saved to wishlist!` : `Removed from wishlist`,
        added ? 'success' : 'info',
        2000
      );
    });

    grid.appendChild(card);
  });

  // 6. Update Pagination UI
  renderPagination(totalPages);
}

/**
 * Render pagination buttons dynamically
 */
function renderPagination(totalPages) {
  const container = document.querySelector('.pagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '';

  // Previous Page Button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination__btn';
  prevBtn.id = 'page-prev';
  prevBtn.innerHTML = '‹';
  prevBtn.disabled = currentPage === 1;
  prevBtn.setAttribute('aria-label', 'Previous page');
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  container.appendChild(prevBtn);

  // Numbered Page Buttons
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `pagination__btn ${currentPage === i ? 'pagination__btn--active' : ''}`;
    if (currentPage === i) btn.setAttribute('aria-current', 'page');
    btn.textContent = i;
    btn.setAttribute('aria-label', `Page ${i}`);
    
    btn.addEventListener('click', () => {
      currentPage = i;
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    container.appendChild(btn);
  }

  // Next Page Button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination__btn';
  nextBtn.id = 'page-next';
  nextBtn.innerHTML = '›';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.setAttribute('aria-label', 'Next page');
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  container.appendChild(nextBtn);
}
