/**
 * header.js
 * Handles header scroll effects, active nav link highlighting,
 * and wishlist button interactions.
 */

export function initHeader() {
  const header    = document.getElementById('site-header');
  const navLinks  = document.querySelectorAll('.nav__link');

  // ── Active Nav Link Highlighting ──────────────────────────
  // Determines which nav link matches the current page and marks it active.
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    // Remove any pre-existing active class from HTML (in case of stale state)
    link.classList.remove('nav__link--active');

    const href = link.getAttribute('href');
    if (!href) return;

    // Match current page to nav link href
    const linkPage = href.split('?')[0]; // Strip query params for comparison
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });

  // ── Scroll Effect ─────────────────────────────────────────
  // Adds a shadow to the header when the user scrolls down.
  if (header) {
    const onScroll = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run once on load
  }

  // ── Cart Button ───────────────────────────────────────────
  const cartBtn = document.getElementById('btn-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      // Dispatch event for cart drawer (handled by cart.js)
      document.dispatchEvent(new CustomEvent('cart:open'));
    });
  }

  // ── Wishlist Button ───────────────────────────────────────
  // Handles wishlist icon buttons on product cards
  document.addEventListener('click', (e) => {
    const wishlistBtn = e.target.closest('.card__wishlist');
    if (!wishlistBtn) return;

    const isWishlisted = wishlistBtn.dataset.wishlisted === 'true';
    wishlistBtn.dataset.wishlisted = isWishlisted ? 'false' : 'true';
    wishlistBtn.setAttribute('aria-label', isWishlisted ? 'Add to wishlist' : 'Remove from wishlist');

    // Visual feedback
    wishlistBtn.style.transform = 'scale(1.2)';
    setTimeout(() => { wishlistBtn.style.transform = ''; }, 200);
  });
}
