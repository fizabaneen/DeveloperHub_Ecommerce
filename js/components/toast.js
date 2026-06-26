/**
 * toast.js
 * Lightweight toast notification system.
 * No dependencies beyond the DOM.
 *
 * Usage:
 *   import { toast } from './toast.js';
 *   toast.show('Added to cart!', 'success');        // success | error | info | warning
 *   toast.show('Out of stock', 'error', 5000);      // custom duration ms
 */

const CONTAINER_ID = 'toast-container';

function getContainer() {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = CONTAINER_ID;
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    Object.assign(el.style, {
      position:       'fixed',
      bottom:         '24px',
      right:          '24px',
      display:        'flex',
      flexDirection:  'column',
      gap:            '10px',
      zIndex:         '9999',
      pointerEvents:  'none',
    });
    document.body.appendChild(el);
  }
  return el;
}

const icons = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const colours = {
  success: { bg: '#22c55e', border: '#16a34a' },
  error:   { bg: '#ef4444', border: '#dc2626' },
  warning: { bg: '#f59e0b', border: '#d97706' },
  info:    { bg: '#2563eb', border: '#1d4ed8' },
};

export const toast = {
  /**
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {number} duration  ms before auto-dismiss (default 3000)
   */
  show(message, type = 'info', duration = 3000) {
    const container = getContainer();
    const { bg, border } = colours[type] ?? colours.info;

    const el = document.createElement('div');
    el.setAttribute('role', 'alert');
    Object.assign(el.style, {
      display:       'flex',
      alignItems:    'center',
      gap:           '10px',
      padding:       '12px 18px',
      background:    bg,
      border:        `1px solid ${border}`,
      borderRadius:  '10px',
      color:         '#fff',
      fontFamily:    'Inter, system-ui, sans-serif',
      fontSize:      '14px',
      fontWeight:    '500',
      boxShadow:     '0 10px 24px rgba(0,0,0,0.18)',
      pointerEvents: 'all',
      cursor:        'pointer',
      transform:     'translateX(120%)',
      transition:    'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      opacity:       '0',
      maxWidth:      '320px',
      lineHeight:    '1.4',
    });

    el.innerHTML = `
      <span style="font-size:16px;flex-shrink:0">${icons[type] ?? icons.info}</span>
      <span>${message}</span>
    `;

    // Dismiss on click
    el.addEventListener('click', () => dismiss(el));

    container.appendChild(el);

    // Animate in (next tick)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateX(0)';
        el.style.opacity   = '1';
      });
    });

    // Auto dismiss
    const timer = setTimeout(() => dismiss(el), duration);
    el._dismissTimer = timer;

    function dismiss(node) {
      clearTimeout(node._dismissTimer);
      node.style.transform = 'translateX(120%)';
      node.style.opacity   = '0';
      setTimeout(() => node.remove(), 350);
    }
  },
};
