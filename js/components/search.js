/**
 * search.js
 * Handles live search bar interaction with autocomplete suggestions.
 * Shows a dropdown of matching products as the user types.
 * On Enter, redirects to the products page with the search query.
 */

/** Sample product catalogue for client-side suggestion matching */
const PRODUCT_CATALOGUE = [
  { name: 'Premium Wireless Headphones', category: 'Electronics', href: 'product-detail.html' },
  { name: 'Slim Fit Casual Jacket', category: 'Fashion', href: 'product-detail.html' },
  { name: 'Smart Running Sneakers', category: 'Sports', href: 'product-detail.html' },
  { name: 'Minimalist Watch', category: 'Electronics', href: 'product-detail.html' },
  { name: 'Leather Crossbody Bag', category: 'Fashion', href: 'product-detail.html' },
  { name: '4K Action Camera', category: 'Electronics', href: 'product-detail.html' },
  { name: 'Classic Oxford Shirt', category: 'Fashion', href: 'products.html' },
  { name: 'Gaming Earbuds Pro', category: 'Electronics', href: 'product-detail.html' },
  { name: 'Smart Fitness Band', category: 'Electronics', href: 'product-detail.html' },
  { name: 'Urban Backpack Pro', category: 'Fashion', href: 'product-detail.html' },
  { name: 'Carbon Sport Watch', category: 'Electronics', href: 'product-detail.html' },
  { name: 'Linen Summer Shirt', category: 'Fashion', href: 'products.html' },
  { name: 'Classic Canvas Shoes', category: 'Sports', href: 'products.html' },
  { name: 'Premium Bomber Jacket', category: 'Fashion', href: 'products.html' },
];

/** SVG icon for search suggestions */
const SUGGESTION_ICON = `
  <svg class="search__suggestion-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>`;

export function initSearch() {
  const searchInput   = document.getElementById('search-input');
  const suggestionsEl = document.getElementById('search-suggestions');
  if (!searchInput || !suggestionsEl) return;

  let activeIndex = -1; // Keyboard navigation index

  /**
   * Show or hide the suggestions dropdown.
   * @param {string} query - Current search input value
   */
  function showSuggestions(query) {
    if (!query || query.length < 2) {
      hideSuggestions();
      return;
    }

    const lower   = query.toLowerCase();
    const matches = PRODUCT_CATALOGUE.filter(p =>
      p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower)
    ).slice(0, 6); // Max 6 suggestions

    if (matches.length === 0) {
      suggestionsEl.innerHTML = `<p class="search__no-results">No results for "<strong>${escapeHTML(query)}</strong>"</p>`;
      suggestionsEl.removeAttribute('hidden');
      return;
    }

    suggestionsEl.innerHTML = matches.map((product, i) => {
      const highlighted = product.name.replace(
        new RegExp(`(${escapeRegExp(query)})`, 'gi'),
        '<strong>$1</strong>'
      );
      return `<div class="search__suggestion-item"
        role="option"
        aria-selected="false"
        data-index="${i}"
        data-href="${product.href}"
        id="suggestion-${i}">
        ${SUGGESTION_ICON}
        <div>
          <div class="search__suggestion-text">${highlighted}</div>
          <div style="font-size:.72rem;color:var(--color-text-muted);margin-top:.1rem">${product.category}</div>
        </div>
      </div>`;
    }).join('');

    // Bind click events to each suggestion
    suggestionsEl.querySelectorAll('.search__suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const href = item.dataset.href;
        const text = item.querySelector('.search__suggestion-text').textContent;
        searchInput.value = text;
        hideSuggestions();
        if (href) window.location.href = href;
      });
    });

    suggestionsEl.removeAttribute('hidden');
    activeIndex = -1;
  }

  /** Hide and clear the suggestions dropdown */
  function hideSuggestions() {
    suggestionsEl.setAttribute('hidden', '');
    suggestionsEl.innerHTML = '';
    activeIndex = -1;
  }

  /** Update keyboard-active suggestion */
  function updateActiveItem(items) {
    items.forEach((item, i) => {
      const isActive = i === activeIndex;
      item.classList.toggle('search__suggestion-item--active', isActive);
      item.setAttribute('aria-selected', String(isActive));
    });
  }

  // ── Event Listeners ──────────────────────────────────────────

  // Input: show live suggestions
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    showSuggestions(query);

    // On products page, also fire a custom event for product filtering
    if (window.location.pathname.endsWith('products.html')) {
      document.dispatchEvent(new CustomEvent('search:query', { detail: { query: query.toLowerCase() } }));
    }
  });

  // Keyboard navigation within suggestions
  searchInput.addEventListener('keydown', (e) => {
    const items = [...suggestionsEl.querySelectorAll('.search__suggestion-item')];
    const isVisible = !suggestionsEl.hasAttribute('hidden');

    if (e.key === 'ArrowDown' && isVisible) {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp' && isVisible) {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      updateActiveItem(items);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].click();
      } else {
        const query = searchInput.value.trim();
        if (query && !window.location.pathname.endsWith('products.html')) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
      }
      hideSuggestions();
    } else if (e.key === 'Escape') {
      hideSuggestions();
      searchInput.blur();
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-wrapper')) {
      hideSuggestions();
    }
  });

  // ── Utility Helpers ──────────────────────────────────────────

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
