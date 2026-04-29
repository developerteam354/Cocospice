export type OrderStatus = 'Pending' | 'Delivered' | 'Failed';
export type PaymentMethod = 'UPI' | 'COD' | 'Card' | 'Net Banking';

export interface IOrderUser {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface IOrderItem {
  _id: string;
  name: string;
  thumbnail: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrderTimeline {
  status: string;
  timestamp: string;
  completed: boolean;
}

export interface IOrder {
  _id: string;
  orderId: string;
  user: IOrderUser;
  item: string; // For backward compatibility with list view
  items?: IOrderItem[]; // Detailed items for details page
  price: number; // Total price
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  shippingAddress?: IShippingAddress;
  expectedDelivery?: string;
  timeline?: IOrderTimeline[];
  date: string;
  createdAt: string;
}

export interface IOrderStats {
  total: number;
  pending: number;
  failed: number;
}

export interface IOrderFilters {
  search?: string;
  status?: OrderStatus | 'All';
}
