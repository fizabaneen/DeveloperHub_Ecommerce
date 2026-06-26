/**
 * utils.js
 * Shared utility functions used across all pages.
 */

/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} currency
 * @returns {string}  e.g. "$79.99"
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number}   delay  ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get / set a value from localStorage with JSON serialisation.
 */
export const storage = {
  get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* quota exceeded */ }
  },
  remove(key) { localStorage.removeItem(key); },
};

/**
 * Simple EventBus for cross-component communication.
 * Usage:
 *   import { bus } from './utils.js';
 *   bus.on('cart:updated', handler);
 *   bus.emit('cart:updated', { count: 3 });
 */
export const bus = {
  _listeners: {},
  on(event, fn) {
    (this._listeners[event] ??= []).push(fn);
    return () => this.off(event, fn);
  },
  off(event, fn) {
    this._listeners[event] = (this._listeners[event] ?? []).filter(h => h !== fn);
  },
  emit(event, data) {
    (this._listeners[event] ?? []).forEach(fn => fn(data));
  },
};


export function filterProducts(query) {
    const products = document.querySelectorAll('.card');
    products.forEach(card => {
        const title = card.querySelector('.card__title').textContent.toLowerCase();
        card.style.display = title.includes(query.toLowerCase()) ? 'block' : 'none';
    });
}