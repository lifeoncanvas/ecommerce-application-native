// High-fidelity structured mock data for the E-commerce project
// Features all requested vendors, categories, subcategories, and products

export const categories = [
  {
    id: 'cat_food',
    name: 'Food & Dining',
    icon: '🍔',
    banner: 'Delicious meals & snacks delivered hot',
    subcategories: [
      { id: 'sub_rest', name: 'Restaurants', icon: '🍽️' },
      { id: 'sub_fries', name: 'Fries & Fast Food', icon: '🍟' },
      { id: 'sub_bake', name: 'Bakeries & Pastries', icon: '🥐' },
      { id: 'sub_snack', name: 'Healthy Snacks', icon: '🥤' }
    ]
  },
  {
    id: 'cat_fashion',
    name: 'Fashion & Apparel',
    icon: '👕',
    banner: 'Trendy boutiques, bridal wear & collections',
    subcategories: [
      { id: 'sub_boutique', name: 'Boutiques', icon: '👗' },
      { id: 'sub_kids', name: 'Kiddies Corner', icon: '👶' },
      { id: 'sub_bridal', name: 'Bridal Wear', icon: '👰' },
      { id: 'sub_souvenir', name: 'Souvenirs & Gifts', icon: '🎁' }
    ]
  },
  {
    id: 'cat_electronics',
    name: 'Electronics & Gadgets',
    icon: '📱',
    banner: 'Smartphones, TV screens, smart appliances',
    subcategories: [
      { id: 'sub_phone', name: 'Smartphones', icon: '📱' },
      { id: 'sub_acc', name: 'Phone Accessories', icon: '🔌' },
      { id: 'sub_smarthome', name: 'Smart Home Solutions', icon: '📺' }
    ]
  },
  {
    id: 'cat_home',
    name: 'Home & Utensils',
    icon: '🏠',
    banner: 'Household accessories, beauty items & utensils',
    subcategories: [
      { id: 'sub_utensil', name: 'Kitchen & Utensils', icon: '🍳' },
      { id: 'sub_household', name: 'Household Accessories', icon: '🧹' },
      { id: 'sub_lifestyle', name: 'Lifestyle Products', icon: '🛋️' }
    ]
  },
  {
    id: 'cat_beauty',
    name: 'Beauty & Grooming',
    icon: '💄',
    banner: 'Premium hair styling, salons & cosmetics',
    subcategories: [
      { id: 'sub_salon_m_f', name: 'Hair Salons', icon: '💇' },
      { id: 'sub_makeup', name: 'Make-up Studio', icon: '🎨' },
      { id: 'sub_cosmetics', name: 'Beauty Parlor', icon: '🧴' }
    ]
  },
  {
    id: 'cat_health',
    name: 'Health & Pharmacy',
    icon: '💊',
    banner: 'Eye clinics, pharmaceuticals & personal care',
    subcategories: [
      { id: 'sub_pharmacy', name: 'Pharmaceutics', icon: '💊' },
      { id: 'sub_eye', name: 'Eye Clinic', icon: '👓' },
      { id: 'sub_personal', name: 'Personal Care', icon: '🧼' }
    ]
  },
  {
    id: 'cat_groceries',
    name: 'Groceries & Essentials',
    icon: '🛒',
    banner: 'Fresh foods, noodles and daily items',
    subcategories: [
      { id: 'sub_noodles', name: 'Noodles & Seasoning', icon: '🍜' },
      { id: 'sub_general_g', name: 'General Groceries', icon: '🛒' }
    ]
  },
  {
    id: 'cat_services',
    name: 'Services & Fun',
    icon: '🎟️',
    banner: 'Arcades, laundries, cinemas & bank branch',
    subcategories: [
      { id: 'sub_laundry', name: 'Laundry Services', icon: '🧺' },
      { id: 'sub_arcade', name: 'Arcade & Games', icon: '🎮' },
      { id: 'sub_cinema', name: 'Cinema Tickets', icon: '🎬' },
      { id: 'sub_carwash', name: 'Car Wash Services', icon: '🚿' },
      { id: 'sub_banking', name: 'Banking Services', icon: '🏦' }
    ]
  }
];

export const vendors = [
  { id: 101, name: 'Jazari', location: 'PINNACLE MALL', emoji: '🥘', rating: 4.8 },
  { id: 102, name: 'Finger licking Akara', location: 'PINNACLE MALL', emoji: '🍟', rating: 4.5 },
  { id: 103, name: 'Fashion Redemption', location: 'PINNACLE MALL', emoji: '🛍️', rating: 4.7 },
  { id: 104, name: 'Home world', location: 'PINNACLE MALL', emoji: '🏺', rating: 4.4 },
  { id: 105, name: 'Sharers', location: 'PINNACLE MALL', emoji: '🏢', rating: 4.9 },
  { id: 106, name: 'The Play Arena', location: 'PINNACLE MALL', emoji: '🕹️', rating: 4.6 },
  { id: 107, name: 'The Wash Spot', location: 'PINNACLE MALL', emoji: '🧺', rating: 4.7 },
  { id: 108, name: 'Azers cinema', location: 'PINNACLE MALL', emoji: '🎥', rating: 4.5 },
  { id: 109, name: 'Mini Sou', location: 'PINNACLE MALL', emoji: '🎁', rating: 4.6 },
  { id: 110, name: 'Smart home solutions', location: 'PINNACLE MALL', emoji: '⚡', rating: 4.8 },
  { id: 111, name: 'Omnia Tech World', location: 'PINNACLE MALL', emoji: '💻', rating: 4.7 },
  { id: 112, name: 'Loveworld Store', location: 'PINNACLE MALL', emoji: '❤️', rating: 4.9 },
  { id: 113, name: 'Omnia Eye Clinic', location: 'PINNACLE MALL', emoji: '👁️', rating: 4.8 },
  { id: 114, name: 'All Natural', location: 'PINNACLE MALL', emoji: '🍏', rating: 4.6 },
  { id: 115, name: 'Capelli Salon & Parlor', location: 'PINNACLE MALL', emoji: '💇', rating: 4.7 },
  { id: 116, name: 'Omnia health & lifestyle', location: 'PINNACLE MALL', emoji: '🏥', rating: 4.8 },
  { id: 117, name: 'Beverly Meals & Bakeries', location: 'PINNACLE MALL', emoji: '🎂', rating: 4.8 },
  { id: 118, name: 'Auxano', location: 'PINNACLE MALL', emoji: '🍛', rating: 4.6 },
  { id: 119, name: 'CWE Bistro', location: 'PINNACLE MALL', emoji: '🍷', rating: 4.7 },
  { id: 120, name: 'Pointek', location: 'PINNACLE MALL', emoji: '🔌', rating: 4.5 },
  { id: 121, name: 'Parallex Bank', location: 'PINNACLE MALL', emoji: '🏦', rating: 4.7 },
  { id: 122, name: 'Lady Lili', location: 'PINNACLE MALL', emoji: '🌸', rating: 4.9 },
  { id: 123, name: 'Dixons Foods', location: 'PINNACLE MALL', emoji: '📦', rating: 4.4 },
  { id: 124, name: 'Kings carwash', location: 'PINNACLE MALL', emoji: '🚗', rating: 4.6 },
  { id: 125, name: 'Carlos Pharmaceutics', location: 'PINNACLE MALL', emoji: '💊', rating: 4.5 },
  { id: 126, name: 'Puredent', location: 'PINNACLE MALL', emoji: '🦷', rating: 4.8 }
];

export const products = [
  // FOOD & DINING
  {
    id: 1,
    name: 'Gourmet Jollof Rice platter',
    categoryId: 'cat_food',
    subcategoryId: 'sub_rest',
    vendorId: 101,
    price: 18.5,
    oldPrice: 22.0,
    rating: 4.8,
    reviewsCount: 142,
    tag: 'Bestseller',
    emoji: '🍛',
    description: 'Flavor-rich Nigerian Jollof rice served with grilled chicken, plantain, and crisp salad.'
  },
  {
    id: 2,
    name: 'Crispy Akara & French Fries',
    categoryId: 'cat_food',
    subcategoryId: 'sub_fries',
    vendorId: 102,
    price: 8.0,
    oldPrice: 10.0,
    rating: 4.6,
    reviewsCount: 89,
    tag: 'Flash Sale',
    claimed: 78,
    emoji: '🍟',
    description: 'Hot bean fritters (Akara) fried to perfect golden crisp, paired with home-cut potato fries.'
  },
  {
    id: 3,
    name: 'Red Velvet Celebration Cake',
    categoryId: 'cat_food',
    subcategoryId: 'sub_bake',
    vendorId: 117,
    price: 35.0,
    rating: 4.9,
    reviewsCount: 65,
    tag: 'Featured',
    emoji: '🎂',
    description: 'Rich, moist double-layer red velvet cake topped with smooth cream cheese frosting.'
  },
  {
    id: 4,
    name: 'Fresh Butter Croissant (4 Pack)',
    categoryId: 'cat_food',
    subcategoryId: 'sub_bake',
    vendorId: 117,
    price: 6.5,
    oldPrice: 8.0,
    rating: 4.7,
    reviewsCount: 110,
    tag: 'Popular',
    emoji: '🥐',
    description: 'Flaky, buttery French pastries baked fresh daily, perfect for breakfast.'
  },
  {
    id: 5,
    name: 'Cold-Pressed Green Juice',
    categoryId: 'cat_food',
    subcategoryId: 'sub_snack',
    vendorId: 114,
    price: 4.5,
    rating: 4.5,
    reviewsCount: 52,
    tag: 'New',
    emoji: '🥤',
    description: 'Organic cucumber, celery, green apple, kale, and lemon juice blended fresh.'
  },
  {
    id: 6,
    name: 'Stir-Fry Noodles & Grilled Turkey',
    categoryId: 'cat_food',
    subcategoryId: 'sub_rest',
    vendorId: 118,
    price: 15.0,
    rating: 4.6,
    reviewsCount: 43,
    tag: 'Popular',
    emoji: '🍝',
    description: 'Spicy noodles stir-fried with mixed vegetables, served with a succulent grilled turkey leg.'
  },
  {
    id: 7,
    name: 'Bistro Grilled Beef Burger',
    categoryId: 'cat_food',
    subcategoryId: 'sub_rest',
    vendorId: 119,
    price: 12.99,
    oldPrice: 15.99,
    rating: 4.7,
    reviewsCount: 97,
    tag: 'Flash Sale',
    claimed: 45,
    emoji: '🍔',
    description: 'Premium flame-grilled beef patty, melted cheddar, house sauce, brioche bun, and side salad.'
  },

  // FASHION & APPAREL
  {
    id: 8,
    name: 'Premium Velvet Dinner Suit',
    categoryId: 'cat_fashion',
    subcategoryId: 'sub_boutique',
    vendorId: 103,
    price: 180.0,
    oldPrice: 240.0,
    rating: 4.9,
    reviewsCount: 38,
    tag: 'Featured',
    emoji: '👔',
    description: 'Elegant slim-fit double-breasted velvet jacket and matching trousers for formal events.'
  },
  {
    id: 9,
    name: 'Classic Bridal A-Line Gown',
    categoryId: 'cat_fashion',
    subcategoryId: 'sub_bridal',
    vendorId: 105,
    price: 750.0,
    rating: 4.9,
    reviewsCount: 15,
    tag: 'Featured',
    emoji: '👰',
    description: 'Stunning tulle and lace off-shoulder bridal gown with a chapel train.'
  },
  {
    id: 10,
    name: 'Kids Organic Cotton Dungarees',
    categoryId: 'cat_fashion',
    subcategoryId: 'sub_kids',
    vendorId: 105,
    price: 25.0,
    oldPrice: 35.0,
    rating: 4.6,
    reviewsCount: 42,
    tag: 'Popular',
    emoji: '👶',
    description: 'Super-soft and breathable cotton overall dungarees for infants and toddlers.'
  },
  {
    id: 11,
    name: 'Commemorative Golden Shield Souvenir',
    categoryId: 'cat_fashion',
    subcategoryId: 'sub_souvenir',
    vendorId: 112,
    price: 30.0,
    rating: 4.9,
    reviewsCount: 120,
    tag: 'Bestseller',
    emoji: '🏆',
    description: 'Elegant custom metal shield emblem souvenir for partnership celebrations.'
  },

  // ELECTRONICS & GADGETS
  {
    id: 12,
    name: 'Omnia 5G Smartphone 256GB',
    categoryId: 'cat_electronics',
    subcategoryId: 'sub_phone',
    vendorId: 111,
    price: 899.0,
    oldPrice: 999.0,
    rating: 4.8,
    reviewsCount: 150,
    tag: 'Featured',
    emoji: '📱',
    description: 'Super Amoled screen, 108MP quad-camera, ultra battery life, unlocked global 5G.'
  },
  {
    id: 13,
    name: 'SuperBass ANC Earbuds',
    categoryId: 'cat_electronics',
    subcategoryId: 'sub_acc',
    vendorId: 120,
    price: 45.0,
    oldPrice: 65.0,
    rating: 4.5,
    reviewsCount: 221,
    tag: 'Flash Sale',
    claimed: 91,
    emoji: '🎧',
    description: 'Active noise cancellation earbuds with 40-hour deep bass playback and fast charging case.'
  },
  {
    id: 14,
    name: '65" Ultra HD Smart TV',
    categoryId: 'cat_electronics',
    subcategoryId: 'sub_smarthome',
    vendorId: 110,
    price: 580.0,
    rating: 4.7,
    reviewsCount: 38,
    tag: 'Popular',
    emoji: '📺',
    description: '4K Quantum display smart TV with hands-free voice control and built-in streaming apps.'
  },

  // HOME & UTENSILS
  {
    id: 15,
    name: '12-Piece Ceramic Cookware Set',
    categoryId: 'cat_home',
    subcategoryId: 'sub_utensil',
    vendorId: 104,
    price: 110.0,
    oldPrice: 140.0,
    rating: 4.7,
    reviewsCount: 62,
    tag: 'Bestseller',
    emoji: '🍳',
    description: 'Non-toxic, non-stick ceramic pots and pans set with heat-resistant handles.'
  },
  {
    id: 16,
    name: 'Minimalist USB Aromatherapy Humidifier',
    categoryId: 'cat_home',
    subcategoryId: 'sub_lifestyle',
    vendorId: 109,
    price: 18.0,
    rating: 4.4,
    reviewsCount: 145,
    tag: 'Popular',
    emoji: '🕯️',
    description: 'Cool mist ultrasonic humidifier with multicolor LED nightlights for bedside tables.'
  },

  // BEAUTY & GROOMING
  {
    id: 17,
    name: 'Argan Oil Nourishing Shampoo',
    categoryId: 'cat_beauty',
    subcategoryId: 'sub_cosmetics',
    vendorId: 115,
    price: 15.0,
    oldPrice: 19.5,
    rating: 4.8,
    reviewsCount: 180,
    tag: 'Bestseller',
    emoji: '🧴',
    description: 'Deep hair hydration and scalp therapy infused with pure Moroccan Argan oil.'
  },
  {
    id: 18,
    name: 'Premium Make-up Session Voucher',
    categoryId: 'cat_beauty',
    subcategoryId: 'sub_makeup',
    vendorId: 105,
    price: 50.0,
    rating: 4.9,
    reviewsCount: 31,
    tag: 'Featured',
    emoji: '🎨',
    description: 'Redeemable voucher for a full-face bridal/glam makeup session at Sharers studio.'
  },

  // HEALTH & PHARMACY
  {
    id: 19,
    name: 'Anti-Blue Light Reading Glasses',
    categoryId: 'cat_health',
    subcategoryId: 'sub_eye',
    vendorId: 113,
    price: 25.0,
    rating: 4.6,
    reviewsCount: 94,
    tag: 'Popular',
    emoji: '👓',
    description: 'Protective glasses designed to filter harmful blue light emitted from phone/TV screens.'
  },
  {
    id: 20,
    name: 'Lady Lili Cotton Soft Sanitary Pads',
    categoryId: 'cat_health',
    subcategoryId: 'sub_personal',
    vendorId: 122,
    price: 4.2,
    oldPrice: 5.5,
    rating: 4.9,
    reviewsCount: 310,
    tag: 'Bestseller',
    emoji: '🌸',
    description: 'Extra long, wings-enabled ultra thin cotton sanitary pads for comfort and safety. Pack of 24.'
  },
  {
    id: 21,
    name: 'Carlos Vitamin C Immune Boost (60 Tab)',
    categoryId: 'cat_health',
    subcategoryId: 'sub_pharmacy',
    vendorId: 125,
    price: 12.0,
    rating: 4.7,
    reviewsCount: 78,
    emoji: '💊',
    description: 'Chewable tablets offering high strength daily support for optimal immune system function.'
  },
  {
    id: 22,
    name: 'Puredent Herbal Whitening Toothpaste',
    categoryId: 'cat_health',
    subcategoryId: 'sub_personal',
    vendorId: 126,
    price: 3.5,
    rating: 4.8,
    reviewsCount: 198,
    tag: 'Popular',
    emoji: '🦷',
    description: 'Natural peppermint extracts for fresh breath, combined with safe enamel whitening properties.'
  },

  // GROCERIES & ESSENTIALS
  {
    id: 23,
    name: 'Dixons Chicken Noodles Box (40 Pack)',
    categoryId: 'cat_groceries',
    subcategoryId: 'sub_noodles',
    vendorId: 123,
    price: 14.5,
    oldPrice: 18.0,
    rating: 4.5,
    reviewsCount: 242,
    tag: 'Flash Sale',
    claimed: 86,
    emoji: '🍜',
    description: 'Quick-cooking delicious noodles with aromatic seasoning packs. Family box size.'
  },
  {
    id: 24,
    name: 'Dixons Seasoning Cubes (Pack of 100)',
    categoryId: 'cat_groceries',
    subcategoryId: 'sub_noodles',
    vendorId: 123,
    price: 3.0,
    rating: 4.6,
    reviewsCount: 165,
    emoji: '🧂',
    description: 'Classic seasoning cubes for flavoring standard local soups, stews, and meals.'
  },

  // SERVICES & FUN
  {
    id: 25,
    name: 'VR Arcade Unlimited Pass (2 Hours)',
    categoryId: 'cat_services',
    subcategoryId: 'sub_arcade',
    vendorId: 106,
    price: 20.0,
    rating: 4.7,
    reviewsCount: 88,
    tag: 'Popular',
    emoji: '🎮',
    description: 'Access ticket to all virtual reality simulator capsules and arcade machines at Play Arena.'
  },
  {
    id: 26,
    name: 'Express Suit Dry Cleaning',
    categoryId: 'cat_services',
    subcategoryId: 'sub_laundry',
    vendorId: 107,
    price: 10.0,
    oldPrice: 15.0,
    rating: 4.8,
    reviewsCount: 76,
    tag: 'Flash Sale',
    claimed: 34,
    emoji: '🧺',
    description: 'Quick 24-hour wash, stain-removal, press, and hanger delivery for two-piece suits.'
  },
  {
    id: 27,
    name: 'Azers Cinema VIP Movie Ticket',
    categoryId: 'cat_services',
    subcategoryId: 'sub_cinema',
    vendorId: 108,
    price: 9.99,
    rating: 4.5,
    reviewsCount: 154,
    emoji: '🎬',
    description: 'Standard VIP recliner ticket valid for any current blockbusters with free drink.'
  },
  {
    id: 28,
    name: 'Kings Premium Foam Exterior Car Wash',
    categoryId: 'cat_services',
    subcategoryId: 'sub_carwash',
    vendorId: 124,
    price: 15.0,
    rating: 4.6,
    reviewsCount: 50,
    emoji: '🚿',
    description: 'Pressure clean, active wax coating, tire dressing, and dashboard wiping.'
  },
  {
    id: 29,
    name: 'Parallex Premium Metal Card Setup',
    categoryId: 'cat_services',
    subcategoryId: 'sub_banking',
    vendorId: 121,
    price: 5.0,
    rating: 4.7,
    reviewsCount: 220,
    emoji: '💳',
    description: 'Instant customized heavy-metal contact-less debit card linked to your active checking account.'
  }
];
