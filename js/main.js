/**
 * main.js
 * Entry point for global JavaScript functionality.
 * Initializes components shared across all pages.
 */

import { initHeader }  from './components/header.js';
import { initSearch }  from './components/search.js';
import { toast }       from './components/toast.js';
import './cart.js'; // auto-syncs header badge on every page

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initSearch();
  initNewsletter();
});

/**
 * Newsletter form — used on the home page.
 * Gracefully no-ops on pages where the form doesn't exist.
 */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email  = document.getElementById('newsletter-email')?.value.trim();
    const btn    = document.getElementById('newsletter-submit');
    if (!email) return;

    // Simulate async subscription
    if (btn) { btn.textContent = 'Subscribing…'; btn.disabled = true; }

    setTimeout(() => {
      toast.show(`🎉 You're subscribed with ${email}! Check your inbox for your 10% off code.`, 'success', 5000);
      form.reset();
      if (btn) { btn.textContent = 'Subscribe'; btn.disabled = false; }
    }, 1000);
  });
}


