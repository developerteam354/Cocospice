import { Category, MenuItem } from '../types';

export const categories: Category[] = [
  { id: 'c1', name: 'Poppadom & Chutneys' },
  { id: 'c2', name: 'Starters' },
  { id: 'c3', name: 'Balti Specialities' },
  { id: 'c4', name: 'Biryani Dishes' },
];

export const menuItems: MenuItem[] = [
  { id: 'm1', name: 'Plain Poppadom', description: 'Crispy lentil cracker', price: 0.90, image: '/images/poppadom.png', images: ['/images/poppadom.png', '/images/bg-food.png'], ingredients: ['Lentil Flour', 'Salt', 'Vegetable Oil'], categoryId: 'c1' },
  { id: 'm2', name: 'Spicy Poppadom', description: 'Spicy lentil cracker', price: 1.00, image: '/images/poppadom.png', images: ['/images/poppadom.png', '/images/bg-food.png'], ingredients: ['Lentil Flour', 'Chili Flakes', 'Black Pepper', 'Vegetable Oil'], categoryId: 'c1' },
  { id: 'm3', name: 'Mango Chutney', description: 'Sweet mango dip', price: 0.80, image: '/images/poppadom.png', images: ['/images/poppadom.png'], ingredients: ['Mango', 'Sugar', 'Vinegar', 'Spices'], categoryId: 'c1' },
  
  { id: 'm4', name: 'Chicken Tikka', description: 'Marinated chicken pieces cooked in tandoor', price: 4.50, image: '/images/starters.png', images: ['/images/starters.png', '/images/bg-food.png'], ingredients: ['Chicken Breast', 'Yogurt', 'Tikka Masala', 'Lemon Juice', 'Garlic', 'Ginger'], categoryId: 'c2' },
  { id: 'm5', name: 'Onion Bhaji', description: 'Deep fried onion fritters', price: 3.50, image: '/images/starters.png', images: ['/images/starters.png'], ingredients: ['Onion', 'Gram Flour', 'Spices', 'Vegetable Oil'], categoryId: 'c2' },

  { id: 'm6', name: 'Chicken Balti', description: 'Cooked with fresh tomatoes, garlic and coriander', price: 8.90, image: '/images/balti.png', images: ['/images/balti.png', '/images/starters.png'], ingredients: ['Chicken', 'Tomatoes', 'Garlic', 'Coriander', 'Balti Paste', 'Onions'], categoryId: 'c3' },
  { id: 'm7', name: 'Lamb Balti', description: 'Tender lamb cooked in balti sauce', price: 9.90, image: '/images/balti.png', images: ['/images/balti.png', '/images/starters.png'], ingredients: ['Lamb', 'Tomatoes', 'Garlic', 'Coriander', 'Balti Paste', 'Onions'], categoryId: 'c3' },

  { id: 'm8', name: 'Chicken Biryani', description: 'Spiced rice dish served with vegetable curry', price: 10.50, image: '/images/biryani.png', images: ['/images/biryani.png', '/images/balti.png'], ingredients: ['Basmati Rice', 'Chicken', 'Biryani Spices', 'Saffron', 'Onions', 'Ghee'], categoryId: 'c4' },
];

export const getCategories = async (): Promise<Category[]> => {
  return categories;
};

export const getMenuItems = async (): Promise<MenuItem[]> => {
  return menuItems;
};
