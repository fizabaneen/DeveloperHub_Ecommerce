/**
 * products-data.js
 * Catalog of products containing 12 items.
 * Acts as the client-side data layer for the entire eCommerce application.
 */

export const PRODUCTS = [
  {
    id: 'prod-headphones',
    name: 'Premium Wireless Headphones Pro X',
    brand: 'Sony',
    category: 'electronics',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.5,
    reviewsCount: 128,
    image: 'assets/Image/tech/image 86.png',
    gallery: [
      'assets/Image/tech/image 86.png',
      'assets/Image/tech/image 85.png',
      'assets/Image/tech/image 34.png',
      'assets/Image/tech/image 23.png'
    ],
    description: 'Experience immersive sound with our Pro X headphones. Featuring active noise cancellation, a 30-hour battery life, and premium memory foam ear cups — engineered for audiophiles who refuse to compromise.',
    colors: ['Midnight Black', 'Pearl White', 'Ocean Blue', 'Crimson Red'],
    variants: [
      { name: 'Standard Edition', price: 79.99 },
      { name: 'Pro Edition', price: 109.99 },
      { name: 'Ultimate Bundle', price: 139.99 }
    ],
    stock: 43,
    date: '2025-05-10'
  },
  {
    id: 'prod-jacket',
    name: 'Slim Fit Casual Jacket',
    brand: 'Adidas',
    category: 'fashion',
    price: 54.99,
    rating: 4.0,
    reviewsCount: 74,
    image: 'assets/Layout/alibaba/Image/cloth/Bitmap.png',
    gallery: [
      'assets/Layout/alibaba/Image/cloth/Bitmap.png',
      'assets/Layout/alibaba/Image/cloth/Bitmap (2).png',
      'assets/Layout/alibaba/Image/cloth/2 1.png'
    ],
    description: 'Add a smart touch to your daily wear. Made with premium lightweight materials, it features double-stitch seams, side zip pockets, and a tailored slim fit.',
    colors: ['Olive Green', 'Classic Navy', 'Charcoal'],
    variants: [{ name: 'Standard Fit', price: 54.99 }],
    stock: 15,
    date: '2025-06-01'
  },
  {
    id: 'prod-sneakers',
    name: 'Smart Running Sneakers',
    brand: 'Nike',
    category: 'sports',
    price: 119.00,
    rating: 5.0,
    reviewsCount: 312,
    image: 'assets/Layout/alibaba/Image/cloth/image 26.png',
    gallery: [
      'assets/Layout/alibaba/Image/cloth/image 26.png',
      'assets/Layout/alibaba/Image/cloth/image 24.png'
    ],
    description: 'Run further, bounce higher. Engineered with reactive foam soles and breathable mesh fabric, these sneakers are designed for long-distance training and comfort.',
    colors: ['Neon Green', 'Stealth Black', 'Pure White'],
    variants: [{ name: 'Standard Nike Fit', price: 119.00 }],
    stock: 8,
    date: '2025-05-20'
  },
  {
    id: 'prod-watch',
    name: 'Minimalist Smart Watch',
    brand: 'Samsung',
    category: 'electronics',
    price: 64.99,
    originalPrice: 99.99,
    rating: 4.5,
    reviewsCount: 89,
    image: 'assets/Image/tech/image 85.png',
    gallery: [
      'assets/Image/tech/image 85.png',
      'assets/Image/tech/image 86.png'
    ],
    description: 'Track your health and stay connected in style. Features a 1.4-inch AMOLED display, sleep tracking, heart rate monitor, and up to 7 days of battery life.',
    colors: ['Steel Silver', 'Rose Gold', 'Active Black'],
    variants: [
      { name: '40mm Bluetooth', price: 64.99 },
      { name: '44mm LTE', price: 94.99 }
    ],
    stock: 22,
    date: '2025-04-18'
  },
  {
    id: 'prod-bag',
    name: 'Leather Crossbody Bag',
    brand: 'Nike',
    category: 'fashion',
    price: 89.00,
    rating: 4.0,
    reviewsCount: 57,
    image: 'assets/Layout/alibaba/Image/cloth/image 30.png',
    gallery: [
      'assets/Layout/alibaba/Image/cloth/image 30.png',
      'assets/Layout/alibaba/Image/cloth/image 24.png'
    ],
    description: 'Crafted from genuine full-grain leather, this crossbody bag offers timeless styling and functional compartments to secure your essentials on the go.',
    colors: ['Tan Brown', 'Classic Black', 'Chestnut'],
    variants: [{ name: 'Standard Size', price: 89.00 }],
    stock: 14,
    date: '2025-03-25'
  },
  {
    id: 'prod-camera',
    name: '4K Waterproof Action Camera',
    brand: 'Sony',
    category: 'electronics',
    price: 249.99,
    rating: 5.0,
    reviewsCount: 201,
    image: 'assets/Image/tech/6.png',
    gallery: [
      'assets/Image/tech/6.png',
      'assets/Image/tech/image 34.png'
    ],
    description: 'Capture your adventures in stunning detail. Features 4K video recording at 60FPS, advanced electronic image stabilization, and waterproof casing up to 30 meters.',
    colors: ['Stealth Black'],
    variants: [
      { name: 'Standard Kit', price: 249.99 },
      { name: 'Adventure Bundle', price: 299.99 }
    ],
    stock: 11,
    date: '2025-06-10'
  },
  {
    id: 'prod-chair',
    name: 'Ergonomic Office Chair',
    brand: 'Samsung',
    category: 'home',
    price: 189.99,
    rating: 4.5,
    reviewsCount: 142,
    image: 'assets/Image/interior/image 89.png',
    gallery: [
      'assets/Image/interior/image 89.png',
      'assets/Image/interior/1.png'
    ],
    description: 'Comfortable ergonomic office chair with breathable high-back mesh, adjustable 3D armrests, dynamic lumbar support, and smooth nylon casters.',
    colors: ['Slate Gray', 'Pitch Black'],
    variants: [
      { name: 'Nylon Base', price: 189.99 },
      { name: 'Aluminium Base', price: 219.99 }
    ],
    stock: 18,
    date: '2025-02-15'
  },
  {
    id: 'prod-phone',
    name: 'VibePhone 15 Pro Max',
    brand: 'Apple',
    category: 'electronics',
    price: 499.00,
    rating: 5.0,
    reviewsCount: 456,
    image: 'assets/Image/tech/image 34.png',
    gallery: [
      'assets/Image/tech/image 34.png',
      'assets/Image/tech/image 23.png'
    ],
    description: 'Experience the next level of smart phone performance. Featuring a super retina XDR display, pro camera system with 5x optical zoom, and the powerful A17 Bionic chip.',
    colors: ['Titanium Gray', 'Titanium Black', 'Deep Blue'],
    variants: [
      { name: '128GB Storage', price: 499.00 },
      { name: '256GB Storage', price: 549.00 },
      { name: '512GB Storage', price: 649.00 }
    ],
    stock: 6,
    date: '2025-06-15'
  },
  {
    id: 'prod-keyboard',
    name: 'Mechanical Wireless Keyboard',
    brand: 'Sony',
    category: 'electronics',
    price: 129.99,
    originalPrice: 149.99,
    rating: 4.0,
    reviewsCount: 63,
    image: 'assets/Image/tech/image 32.png',
    gallery: [
      'assets/Image/tech/image 32.png',
      'assets/Image/tech/image 33.png'
    ],
    description: 'Premium mechanical gaming keyboard with hot-swappable tactile brown switches, customizable per-key RGB backlighting, and a multi-device wireless connection.',
    colors: ['Matte Black', 'Arctic White'],
    variants: [
      { name: 'Brown Switches', price: 129.99 },
      { name: 'Red Switches (Linear)', price: 129.99 }
    ],
    stock: 25,
    date: '2025-05-28'
  },
  {
    id: 'prod-sofa',
    name: 'Designer Velvet Sofa',
    brand: 'Samsung',
    category: 'home',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.5,
    reviewsCount: 39,
    image: 'assets/Layout/alibaba/Image/interior/image 90.png',
    gallery: [
      'assets/Layout/alibaba/Image/interior/image 90.png',
      'assets/Image/interior/image 89.png'
    ],
    description: 'A luxurious statement piece for your living room. Wrapped in ultra-soft velvet upholstery with solid oak tapered legs and high-density foam cushions.',
    colors: ['Royal Blue', 'Emerald Green', 'Dusty Rose'],
    variants: [{ name: '3-Seater Sofa', price: 349.99 }],
    stock: 4,
    date: '2025-01-20'
  },
  {
    id: 'prod-dumbbells',
    name: 'Adjustable Smart Dumbbell',
    brand: 'Adidas',
    category: 'sports',
    price: 159.00,
    rating: 5.0,
    reviewsCount: 198,
    image: 'assets/Image/tech/8.png',
    gallery: [
      'assets/Image/tech/8.png',
      'assets/Image/tech/6.png'
    ],
    description: 'All-in-one adjustable dumbbell set. Simply turn the dial to adjust weight from 5 lbs up to 52.5 lbs instantly, replacing 15 individual dumbbells.',
    colors: ['Iron Black'],
    variants: [
      { name: 'Single Dumbbell', price: 159.00 },
      { name: 'Pair Set', price: 299.00 }
    ],
    stock: 10,
    date: '2025-05-05'
  },
  {
    id: 'prod-tracker',
    name: 'Active Fitness Tracker',
    brand: 'Apple',
    category: 'sports',
    price: 89.99,
    rating: 4.0,
    reviewsCount: 82,
    image: 'assets/Image/tech/image 29.png',
    gallery: [
      'assets/Image/tech/image 29.png',
      'assets/Image/tech/image 85.png'
    ],
    description: 'Achieve your fitness goals with automatic exercise tracking, calorie monitoring, sleep analysis, and connected GPS for real-time running stats.',
    colors: ['Slate Gray', 'Lime Green', 'Coral Pink'],
    variants: [{ name: 'Standard Edition', price: 89.99 }],
    stock: 30,
    date: '2025-03-10'
  }
];
