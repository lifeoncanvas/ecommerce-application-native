// High-fidelity single source of truth mock dataset for E-commerce Application

export const categories = [
  {
    id: 'cat_food',
    name: 'Food & Dining',
    icon: '🍔',
    banner: 'Delicious meals & snacks delivered hot',
    subcategories: [
      { id: 'sub_bakeries', name: 'Bakeries', icon: '🥐' },
      { id: 'sub_pastries', name: 'Pastries', icon: '🍰' },
      { id: 'sub_fast_food', name: 'Fast Foods', icon: '🍟' },
      { id: 'sub_groceries', name: 'Groceries', icon: '🛒' }
    ]
  },
  {
    id: 'cat_fashion',
    name: 'Fashion & Apparel',
    icon: '👕',
    banner: 'Trendy boutiques, bridal wear & collections',
    subcategories: [
      { id: 'sub_womens_clothing', name: "Women's Clothing", icon: '👗' },
      { id: 'sub_mens_clothing', name: "Men's Clothing", icon: '👔' },
      { id: 'sub_kids', name: 'Kids', icon: '👶' }
    ]
  },
  {
    id: 'cat_electronics',
    name: 'Electronics & Gadgets',
    icon: '📱',
    banner: 'Smartphones, TV screens, smart appliances',
    subcategories: []
  },
  {
    id: 'cat_home',
    name: 'Home & Utensils',
    icon: '🏠',
    banner: 'Household accessories, decor & utensils',
    subcategories: []
  },
  {
    id: 'cat_beauty',
    name: 'Beauty & Grooming',
    icon: '💄',
    banner: 'Premium hair styling, perfumes & cosmetics',
    subcategories: []
  },
  {
    id: 'cat_services',
    name: 'Services & Fun',
    icon: '🎟️',
    banner: 'Arcades, laundries, cinemas & car spa',
    subcategories: [
      { id: 'sub_car_wash', name: 'Car Wash', icon: '🚿' },
      { id: 'sub_car_spa', name: 'Car Spa', icon: '🚗' },
      { id: 'sub_arcade_bowling', name: 'Arcade & Bowling', icon: '🎮' },
      { id: 'sub_restaurants', name: 'Restaurants', icon: '🍽️' }
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
  { id: 124, name: 'Kings carwash', location: 'PINNACLE MALL', emoji: '🚗', rating: 4.6 },
  { id: 126, name: 'Puredent', location: 'PINNACLE MALL', emoji: '🦷', rating: 4.8 },
  { id: 127, name: 'Kalaya Beauty', location: 'PINNACLE MALL', emoji: '💄', rating: 4.9 }
];

import { ALL_FEED_PRODUCTS } from './mockProductsData';

export const products = ALL_FEED_PRODUCTS;

