export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
