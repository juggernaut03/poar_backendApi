import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { config } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';
import { Content } from '../models/Content.js';

const SAMPLE_PRODUCTS = [
  {
    title: 'Stainless Steel Insulated Water Bottle 1L',
    shortDescription: 'Keeps drinks hot/cold for 24 hours.',
    description: 'Double-walled vacuum insulated bottle, leak-proof, BPA-free.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE1',
    price: 799, mrp: 1299, category: 'Kitchen', brand: 'Pawar',
    rating: 4.4, ratingCount: 1287,
    images: [], isFeatured: true, tags: ['bottle', 'steel', 'insulated'],
  },
  {
    title: 'Cotton Bedsheet King Size with 2 Pillow Covers',
    shortDescription: '100% cotton, 300 TC, fade resistant.',
    description: 'Soft breathable cotton bedsheet, machine washable.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE2',
    price: 1099, mrp: 1999, category: 'Home', brand: 'Pawar',
    rating: 4.2, ratingCount: 543,
    images: [], isFeatured: true, tags: ['bedsheet', 'cotton', 'king'],
  },
  {
    title: 'Wireless Bluetooth Earbuds with Charging Case',
    shortDescription: 'Up to 30 hours playtime, IPX4 water resistant.',
    description: 'Touch controls, noise isolation, fast pairing.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE3',
    price: 1499, mrp: 2999, category: 'Electronics', brand: 'Pawar',
    rating: 4.1, ratingCount: 2034,
    images: [], isFeatured: true, tags: ['earbuds', 'bluetooth', 'audio'],
  },
  {
    title: 'Non-Stick Cookware Set (5 Pieces)',
    shortDescription: 'Induction-friendly, scratch-resistant coating.',
    description: 'Durable non-stick set with heat-resistant handles. Dishwasher safe.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE4',
    price: 1899, mrp: 3499, category: 'Kitchen', brand: 'Pawar',
    rating: 4.5, ratingCount: 876,
    images: [], isFeatured: true, tags: ['cookware', 'non-stick', 'kitchen'],
  },
  {
    title: 'Microfibre Bath Towel Set (Pack of 4)',
    shortDescription: 'Ultra-absorbent, quick dry, soft on skin.',
    description: 'Lightweight microfibre towels, lint-free and fast drying.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE5',
    price: 649, mrp: 1199, category: 'Home', brand: 'Pawar',
    rating: 4.0, ratingCount: 312,
    images: [], tags: ['towel', 'bath', 'microfibre'],
  },
  {
    title: 'Smart LED Bulb 9W (Pack of 2)',
    shortDescription: '16M colours, app + voice control.',
    description: 'WiFi smart bulbs compatible with Alexa & Google Home.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE6',
    price: 899, mrp: 1799, category: 'Electronics', brand: 'Pawar',
    rating: 4.3, ratingCount: 1540,
    images: [], tags: ['smart', 'led', 'bulb'],
  },
  {
    title: 'Yoga Mat 6mm Anti-Slip with Carry Strap',
    shortDescription: 'Extra cushioning, eco-friendly TPE.',
    description: 'Non-slip textured surface for stability during workouts.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE7',
    price: 549, mrp: 1099, category: 'Fitness', brand: 'Pawar',
    rating: 4.6, ratingCount: 689,
    images: [], isFeatured: true, tags: ['yoga', 'mat', 'fitness'],
  },
  {
    title: 'Stainless Steel Lunch Box 3 Compartments',
    shortDescription: 'Leak-proof, keeps food warm.',
    description: 'Insulated steel tiffin with separate compartments.',
    amazonUrl: 'https://www.amazon.in/dp/EXAMPLE8',
    price: 749, mrp: 1399, category: 'Kitchen', brand: 'Pawar',
    rating: 4.2, ratingCount: 421,
    images: [], tags: ['lunchbox', 'steel', 'tiffin'],
  },
];

const CONTENT = [
  {
    key: 'home_hero',
    label: 'Home Hero',
    data: {
      title: 'Pawar Online Retail',
      subtitle: 'Quality everyday products, delivered by Amazon.',
      ctaText: 'Shop Now',
      ctaHref: '#products',
    },
  },
  {
    key: 'about',
    label: 'About Page',
    data: {
      heading: 'About Pawar Online Retail LLP',
      body: 'We curate quality everyday products and list them for purchase through Amazon, so you get trusted Amazon delivery, returns, and support.',
    },
  },
  {
    key: 'site',
    label: 'Site Settings',
    data: {
      brandName: 'Pawar Online Retail LLP',
      primaryColor: '#FF5A1F',
      email: 'support@pawaronline.in',
      phone: '',
      address: '',
    },
  },
];

async function run() {
  await connectDB();

  // Seed admin (idempotent).
  let admin = await Admin.findOne({ email: config.seed.email.toLowerCase() });
  if (!admin) {
    admin = new Admin({ name: config.seed.name, email: config.seed.email, role: 'superadmin' });
    await admin.setPassword(config.seed.password);
    await admin.save();
    console.log(`[seed] Created admin: ${admin.email}`);
  } else {
    console.log(`[seed] Admin already exists: ${admin.email}`);
  }

  // Seed content (upsert).
  for (const c of CONTENT) {
    await Content.findOneAndUpdate({ key: c.key }, { $set: c }, { upsert: true });
  }
  console.log(`[seed] Upserted ${CONTENT.length} content blocks`);

  // Seed sample products only if none exist yet.
  const count = await Product.countDocuments();
  if (count === 0) {
    for (const p of SAMPLE_PRODUCTS) await Product.create(p);
    console.log(`[seed] Created ${SAMPLE_PRODUCTS.length} sample products`);
  } else {
    console.log(`[seed] Products already exist (${count}), skipping samples`);
  }

  await mongoose.connection.close();
  console.log('[seed] Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
