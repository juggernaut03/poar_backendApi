// Canonical category taxonomy for the Pawar catalog.
// Order here is the display order on the storefront and admin.
// Each subcategory carries the keywords used by the classifier
// (importListings / classifyProducts) to auto-assign products.
//
// Matching is case-insensitive substring on the product title (+ tags).
// Subcategories are tried in order; the first matching keyword wins.
// A category's `fallback` subcategory is used when the category matches
// but no specific subcategory does.

export const TAXONOMY = [
  {
    name: 'Cookware',
    keywords: ['cookware', 'kadai', 'kadhai', 'tope', 'pot', 'pan', 'tawa', 'saucepan', 'idli', 'appam', 'paniyaram', 'tadka', 'roasting', 'cake container', 'springform', 'cake'],
    fallback: 'Pots & Pans',
    subcategories: [
      { name: 'Tawa & Dosa', keywords: ['dosa pan', 'dosa tawa', 'tawa', 'dosa'] },
      { name: 'Kadhai', keywords: ['kadai', 'kadhai'] },
      { name: 'Pots & Tope', keywords: ['tope', 'tope pot', 'serving pot', 'copper pot', 'multi kadahi', 'pot'] },
      { name: 'Saucepan', keywords: ['saucepan'] },
      { name: 'Idli & Steamer', keywords: ['idli', 'steamer', 'idli maker', 'idli stand'] },
      { name: 'Appam & Paniyaram', keywords: ['appam', 'paniyaram'] },
      { name: 'Tadka & Specialty', keywords: ['tadka', 'tadka pan'] },
      { name: 'Bakeware', keywords: ['springform', 'cake container', 'cake', 'cheesecake', 'baking', 'roasting pan'] },
      { name: 'Pots & Pans', keywords: [] },
    ],
  },
  {
    name: 'Kitchen Tools',
    keywords: ['cutter', 'chopper', 'peeler', 'masher', 'grater', 'strainer', 'skimmer', 'tong', 'chimta', 'pakkad', 'spoon', 'ladle', 'whisk', 'blender', 'beater', 'squizzer', 'squeezer', 'garlic press', 'sev maker', 'sev sancha', 'chakali', 'chakla', 'belan', 'pizza cutter', 'tea strainer', 'infuser', 'roaster', 'papad jali', 'sev', 'khalbatta', 'mortar', 'pestle'],
    fallback: 'General Tools',
    subcategories: [
      { name: 'Cutters & Choppers', keywords: ['cutter', 'chopper', 'veg cutter', 'vegetable cutter', 'pizza cutter', 'apple peeler'] },
      { name: 'Peelers', keywords: ['peeler', 'potato peeler', 'vegetable peeler'] },
      { name: 'Mashers & Grinders', keywords: ['masher', 'chakla', 'belan', 'rolling pin', 'pav bhaji', 'khalbatta', 'mortar', 'pestle'] },
      { name: 'Strainers & Skimmers', keywords: ['strainer', 'skimmer', 'tea strainer', 'infuser', 'chalni'] },
      { name: 'Tongs & Pakkad', keywords: ['tong', 'chimta', 'chipya', 'pakkad'] },
      { name: 'Spoons & Ladles', keywords: ['spoon', 'ladle', 'spoon set'] },
      { name: 'Whisks & Blenders', keywords: ['whisk', 'blender', 'beater', 'froth', 'latte'] },
      { name: 'Squeezers & Presses', keywords: ['squizzer', 'squeezer', 'garlic press', 'lemon'] },
      { name: 'Sev & Chakli Makers', keywords: ['sev maker', 'sev sancha', 'chakali', 'chakli', 'murukulu', 'janthikulu'] },
      { name: 'Roasters', keywords: ['roaster', 'wire roaster', 'papad jali', 'roasting net'] },
      { name: 'General Tools', keywords: [] },
    ],
  },
  {
    name: 'Tableware & Serving',
    keywords: ['plate', 'thali', 'cup', 'tumbler', 'mug', 'bowl', 'glass', 'dinner plate'],
    fallback: 'Serving',
    subcategories: [
      { name: 'Plates & Thali', keywords: ['plate', 'thali', 'bhojan', 'mess tray', 'dinner plate'] },
      { name: 'Cups & Tumblers', keywords: ['cup', 'tumbler', 'pint cup', 'glass', 'drinking glass'] },
      { name: 'Mugs', keywords: ['mug'] },
      { name: 'Bowls', keywords: ['bowl', 'steel bowl'] },
      { name: 'Serving', keywords: [] },
    ],
  },
  {
    name: 'Kitchen Storage',
    keywords: ['spice box', 'spice container', 'masala', 'masala dabba', 'utensil holder', 'utensil container', 'utensil organizer', 'caddy', 'crock', 'teabox', 'tea box'],
    fallback: 'Storage',
    subcategories: [
      { name: 'Spice Boxes', keywords: ['spice box', 'spice container', 'masala', 'masala dabba'] },
      { name: 'Utensil Holders', keywords: ['utensil holder', 'utensil container', 'utensil organizer', 'caddy', 'crock', 'flatware', 'silverware'] },
      { name: 'Tea Boxes', keywords: ['teabox', 'tea box'] },
      { name: 'Storage', keywords: [] },
    ],
  },
  {
    name: 'Pooja & Spiritual',
    keywords: ['diya', 'pooja', 'puja', 'idol', 'statue', 'ganesha', 'incense', 'agarbati', 'agarbatti', 'dhoop', 'oil lamp', 'pyali', 'worshipping', 'puja diya'],
    fallback: 'Pooja Items',
    subcategories: [
      { name: 'Diyas & Lamps', keywords: ['diya', 'oil lamp', 'pyali', 'dhoop diya', 'brass lamp', 'puja diya'] },
      { name: 'Idols & Statues', keywords: ['idol', 'statue', 'ganesha'] },
      { name: 'Incense & Stands', keywords: ['incense', 'agarbati', 'agarbatti', 'dhoop stand'] },
      { name: 'Pooja Items', keywords: [] },
    ],
  },
  {
    name: 'Festive & Gifts',
    keywords: ['rakhi', 'rakhee', 'raksha bandhan', 'rakshabandhan'],
    fallback: 'Rakhi',
    subcategories: [
      { name: 'Rakhi', keywords: ['rakhi', 'rakhee', 'raksha bandhan', 'rakshabandhan'] },
    ],
  },
  {
    name: 'Bags & Accessories',
    keywords: ['handbag', 'hand bag', 'crossbody', 'shoulder bag', 'wallet'],
    fallback: 'Bags',
    subcategories: [
      { name: 'Handbags', keywords: ['handbag', 'hand bag', 'crossbody', 'shoulder bag'] },
      { name: 'Wallets', keywords: ['wallet', 'card case', 'money clip'] },
      { name: 'Bags', keywords: [] },
    ],
  },
  {
    name: 'Tools & Hardware',
    keywords: ['screwdriver', 'glue gun', 'scissor', 'paper punch', 'hole punch'],
    fallback: 'Hardware',
    subcategories: [
      { name: 'Hand Tools', keywords: ['screwdriver', 'glue gun'] },
      { name: 'Scissors & Cutters', keywords: ['scissor'] },
      { name: 'Stationery', keywords: ['paper punch', 'hole punch', 'puncher'] },
      { name: 'Hardware', keywords: [] },
    ],
  },
  {
    name: 'Home Essentials',
    keywords: ['dustpan', 'cleaning', 'sandwich toaster', 'sandwich maker', 'toaster'],
    fallback: 'Household',
    subcategories: [
      { name: 'Cleaning', keywords: ['dustpan', 'cleaning'] },
      { name: 'Appliances', keywords: ['sandwich toaster', 'sandwich maker', 'toaster'] },
      { name: 'Household', keywords: [] },
    ],
  },
];

// Default bucket when nothing matches at all.
export const DEFAULT_CATEGORY = 'General';
export const DEFAULT_SUBCATEGORY = 'Other';

// Classify a product (title + optional tags array) into {category, subcategory}.
export function classify(title, tags = []) {
  const hay = `${title} ${tags.join(' ')}`.toLowerCase();

  // Rakhi is an unambiguous signal — classify it first so keyword-stuffed
  // rakhi titles (which often mention cups/beads/etc.) don't get mis-bucketed.
  if (/\brakh(i|ee)\b|raksha\s?bandhan|rakshabandhan/.test(hay)) {
    return { category: 'Festive & Gifts', subcategory: 'Rakhi' };
  }
  // OM/swastik prayer beads → Pooja (only when not a rakhi).
  if (/\bom\b|swastik/.test(hay) && /bead|beed|rudraksh/.test(hay)) {
    return { category: 'Pooja & Spiritual', subcategory: 'Pooja Items' };
  }
  // Mashers/potato/pav-bhaji → Kitchen Tools (guard against "pot" in "potato").
  if (/\bmasher\b|potato mash|pav bhaji|khalbatta|\bmortar\b|\bpestle\b/.test(hay)) {
    return { category: 'Kitchen Tools', subcategory: 'Mashers & Grinders' };
  }

  // Word-boundary match so short keywords (pot, pan, cup, om) don't match
  // inside larger words (potato, paniyaram, cupboard).
  const has = (k) => {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${esc}`).test(hay);
  };

  for (const cat of TAXONOMY) {
    if (!cat.keywords.some(has)) continue;

    for (const sub of cat.subcategories) {
      if (sub.keywords.length && sub.keywords.some(has)) {
        return { category: cat.name, subcategory: sub.name };
      }
    }
    return { category: cat.name, subcategory: cat.fallback };
  }
  return { category: DEFAULT_CATEGORY, subcategory: DEFAULT_SUBCATEGORY };
}
