/**
 * dropdown.js
 * Reusable accessible dropdown (size selector, sort, etc.)
 * Usage: pass a wrapper element containing a <button> and a <ul>.
 */

export function initDropdown(wrapperEl) {
  if (!wrapperEl) return;

  const toggle = wrapperEl.querySelector('.dropdown__toggle');
  const menu   = wrapperEl.querySelector('.dropdown__menu');
  const items  = wrapperEl.querySelectorAll('.dropdown__item');

  toggle.setAttribute('aria-haspopup', 'listbox');
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('dropdown__menu--open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      toggle.textContent = item.textContent;
      menu.classList.remove('dropdown__menu--open');
      toggle.setAttribute('aria-expanded', 'false');
      // Dispatch change event for parent pages to listen to
      wrapperEl.dispatchEvent(new CustomEvent('dropdown:change', {
        bubbles: true,
        detail: { value: item.dataset.value, label: item.textContent }
      }));
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapperEl.contains(e.target)) {
      menu.classList.remove('dropdown__menu--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}
