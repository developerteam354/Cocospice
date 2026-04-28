export interface MenuOption {
  name: string;
  choices: string[];
  required?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  ingredients?: string[];
  categoryId: string;
  options?: MenuOption[];
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  orderType: 'delivery' | 'collection';
  paymentMethod: string;
  address?: string;
  note?: string;
}
