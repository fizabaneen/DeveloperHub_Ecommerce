# ShopVibe — eCommerce Frontend

A pixel-perfect, desktop-optimised eCommerce site built with **HTML5, CSS3, and Vanilla JavaScript**.

---

## 📁 Project Structure

```
E commerce/
├── index.html              ← Home page
├── products.html           ← Product Listing page
├── product-detail.html     ← Product Details page
│
├── css/
│   ├── base.css            ← Design tokens, reset, reusable components
│   ├── header.css          ← Sticky header, logo, search, nav
│   ├── footer.css          ← Dark footer styles
│   ├── home.css            ← Hero, categories, featured products
│   ├── products.css        ← Filters sidebar, toolbar, product grid
│   └── product-detail.css  ← Gallery, info panel, reviews
│
├── js/
│   ├── main.js             ← Global entry point (runs on every page)
│   ├── components/
│   │   ├── header.js       ← Active nav link highlighting
│   │   ├── search.js       ← Search input + custom event
│   │   └── dropdown.js     ← Reusable accessible dropdown
│   └── pages/
│       ├── products.js     ← Listing page logic
│       └── product-detail.js ← Detail page logic
│
└── assets/
    ├── images/             ← Product photos, hero image, categories
    ├── icons/              ← SVG icon files
    └── fonts/              ← Self-hosted font files (optional)
```

---

## 🎨 Design System (`base.css`)

| Token type     | Example variable             |
| -------------- | ---------------------------- |
| Brand colors   | `--color-primary: #2563EB`   |
| Neutrals       | `--color-neutral-900…50`     |
| Typography     | `--font-size-xs` → `5xl`     |
| Spacing (8pt)  | `--space-1` → `space-24`     |
| Border radius  | `--radius-sm` → `radius-full`|
| Shadows        | `--shadow-xs` → `shadow-2xl` |
| Transitions    | `--transition-fast/base/slow`|

---

## 🚀 Getting Started

Simply open `index.html` in your browser — no build step required.

For a proper dev server with hot-reload:

```bash
# Using VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server

# Or with npx
npx serve .
```

---

## 📋 Week-by-Week Plan

| Week | Tasks |
|------|-------|
| **Week 1** | ✅ Folder structure, `base.css`, Header & Footer |
| **Week 2** | ✅ Home page (Hero, Categories, Featured Products), Products Listing page |
| **Week 3** | ✅ Product Details page, JS Dropdowns, Search bar functionality |

---

## 🔌 Figma → Code Mapping

1. **Export assets** from Figma → drop into `assets/images/` and `assets/icons/`
2. **Match CSS variables** — override color/spacing tokens in `base.css `:root` to match your Figma design tokens
3. **Replace placeholder `onerror` backgrounds** with real images once exported
