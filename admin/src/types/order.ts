export type OrderStatus = 'Pending' | 'Delivered' | 'Failed';

export interface IOrderUser {
  name: string;
  email: string;
  avatar: string;
}

export interface IOrder {
  _id: string;
  orderId: string;
  user: IOrderUser;
  item: string;
  price: number;
  status: OrderStatus;
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
