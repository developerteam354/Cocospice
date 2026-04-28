import type { IOrder, IOrderStats } from '@/types/order';

// Mock data for development
const MOCK_ORDERS: IOrder[] = [
  {
    _id: '1',
    orderId: 'ORD-2026-001',
    user: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    item: 'Margherita Pizza',
    price: 12.99,
    status: 'Delivered',
    date: '2026-04-28T10:30:00Z',
    createdAt: '2026-04-28T10:30:00Z',
  },
  {
    _id: '2',
    orderId: 'ORD-2026-002',
    user: {
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    item: 'Chicken Burger Combo',
    price: 15.49,
    status: 'Pending',
    date: '2026-04-28T11:15:00Z',
    createdAt: '2026-04-28T11:15:00Z',
  },
  {
    _id: '3',
    orderId: 'ORD-2026-003',
    user: {
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    item: 'Caesar Salad',
    price: 9.99,
    status: 'Delivered',
    date: '2026-04-28T09:45:00Z',
    createdAt: '2026-04-28T09:45:00Z',
  },
  {
    _id: '4',
    orderId: 'ORD-2026-004',
    user: {
      name: 'David Kim',
      email: 'david.kim@example.com',
      avatar: 'https://i.pravatar.cc/150?img=13',
    },
    item: 'Spaghetti Carbonara',
    price: 14.99,
    status: 'Failed',
    date: '2026-04-28T12:00:00Z',
    createdAt: '2026-04-28T12:00:00Z',
  },
  {
    _id: '5',
    orderId: 'ORD-2026-005',
    user: {
      name: 'Jessica Martinez',
      email: 'jessica.m@example.com',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
    item: 'Grilled Salmon',
    price: 22.99,
    status: 'Pending',
    date: '2026-04-28T13:20:00Z',
    createdAt: '2026-04-28T13:20:00Z',
  },
  {
    _id: '6',
    orderId: 'ORD-2026-006',
    user: {
      name: 'Robert Taylor',
      email: 'robert.t@example.com',
      avatar: 'https://i.pravatar.cc/150?img=14',
    },
    item: 'Vegetable Stir Fry',
    price: 11.49,
    status: 'Delivered',
    date: '2026-04-27T18:30:00Z',
    createdAt: '2026-04-27T18:30:00Z',
  },
  {
    _id: '7',
    orderId: 'ORD-2026-007',
    user: {
      name: 'Amanda White',
      email: 'amanda.w@example.com',
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
    item: 'BBQ Ribs Platter',
    price: 24.99,
    status: 'Pending',
    date: '2026-04-28T14:10:00Z',
    createdAt: '2026-04-28T14:10:00Z',
  },
  {
    _id: '8',
    orderId: 'ORD-2026-008',
    user: {
      name: 'James Wilson',
      email: 'james.w@example.com',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    item: 'Chocolate Lava Cake',
    price: 7.99,
    status: 'Failed',
    date: '2026-04-28T15:00:00Z',
    createdAt: '2026-04-28T15:00:00Z',
  },
  {
    _id: '9',
    orderId: 'ORD-2026-009',
    user: {
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      avatar: 'https://i.pravatar.cc/150?img=20',
    },
    item: 'Thai Green Curry',
    price: 16.99,
    status: 'Delivered',
    date: '2026-04-27T20:15:00Z',
    createdAt: '2026-04-27T20:15:00Z',
  },
  {
    _id: '10',
    orderId: 'ORD-2026-010',
    user: {
      name: 'Christopher Lee',
      email: 'chris.lee@example.com',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    item: 'Fish and Chips',
    price: 13.49,
    status: 'Pending',
    date: '2026-04-28T16:30:00Z',
    createdAt: '2026-04-28T16:30:00Z',
  },
];

const orderService = {
  // Simulate API call with delay
  getAll: async (): Promise<IOrder[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_ORDERS]), 500);
    });
  },

  getStats: async (): Promise<IOrderStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats: IOrderStats = {
          total: MOCK_ORDERS.length,
          pending: MOCK_ORDERS.filter((o) => o.status === 'Pending').length,
          failed: MOCK_ORDERS.filter((o) => o.status === 'Failed').length,
        };
        resolve(stats);
      }, 300);
    });
  },

  // Ready for future API integration
  // getAll: async (): Promise<IOrder[]> => {
  //   const { data } = await privateApi.get<{ orders: IOrder[] }>('/orders');
  //   return data.orders;
  // },

  // getStats: async (): Promise<IOrderStats> => {
  //   const { data } = await privateApi.get<IOrderStats>('/orders/stats');
  //   return data;
  // },
};

export default orderService;
