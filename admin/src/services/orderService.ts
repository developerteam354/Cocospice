import type { IOrder, IOrderStats } from '@/types/order';

// Mock data for development
const MOCK_ORDERS: IOrder[] = [
  {
    _id: '1',
    orderId: 'ORD-2026-001',
    user: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    item: 'Margherita Pizza',
    items: [
      {
        _id: 'item1',
        name: 'Margherita Pizza',
        thumbnail: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200',
        quantity: 1,
        price: 12.99,
        subtotal: 12.99,
      },
    ],
    price: 12.99,
    status: 'Delivered',
    paymentMethod: 'UPI',
    shippingAddress: {
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    expectedDelivery: '2026-04-30',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T10:30:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-28T10:31:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '2026-04-28T14:00:00Z', completed: true },
      { status: 'Delivered', timestamp: '2026-04-28T16:45:00Z', completed: true },
    ],
    date: '2026-04-28T10:30:00Z',
    createdAt: '2026-04-28T10:30:00Z',
  },
  {
    _id: '2',
    orderId: 'ORD-2026-002',
    user: {
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    item: 'Chicken Burger Combo',
    items: [
      {
        _id: 'item2',
        name: 'Chicken Burger',
        thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
        quantity: 2,
        price: 8.99,
        subtotal: 17.98,
      },
      {
        _id: 'item3',
        name: 'French Fries',
        thumbnail: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200',
        quantity: 2,
        price: 3.49,
        subtotal: 6.98,
      },
    ],
    price: 24.96,
    status: 'Pending',
    paymentMethod: 'Card',
    shippingAddress: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    expectedDelivery: '2026-04-29',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T11:15:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-28T11:16:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '', completed: false },
      { status: 'Delivered', timestamp: '', completed: false },
    ],
    date: '2026-04-28T11:15:00Z',
    createdAt: '2026-04-28T11:15:00Z',
  },
  {
    _id: '3',
    orderId: 'ORD-2026-003',
    user: {
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    item: 'Caesar Salad',
    items: [
      {
        _id: 'item4',
        name: 'Caesar Salad',
        thumbnail: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200',
        quantity: 1,
        price: 9.99,
        subtotal: 9.99,
      },
    ],
    price: 9.99,
    status: 'Delivered',
    paymentMethod: 'COD',
    shippingAddress: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    expectedDelivery: '2026-04-29',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T09:45:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-28T09:46:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '2026-04-28T12:00:00Z', completed: true },
      { status: 'Delivered', timestamp: '2026-04-28T14:30:00Z', completed: true },
    ],
    date: '2026-04-28T09:45:00Z',
    createdAt: '2026-04-28T09:45:00Z',
  },
  {
    _id: '4',
    orderId: 'ORD-2026-004',
    user: {
      name: 'David Kim',
      email: 'david.kim@example.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://i.pravatar.cc/150?img=13',
    },
    item: 'Spaghetti Carbonara',
    items: [
      {
        _id: 'item5',
        name: 'Spaghetti Carbonara',
        thumbnail: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200',
        quantity: 1,
        price: 14.99,
        subtotal: 14.99,
      },
    ],
    price: 14.99,
    status: 'Failed',
    paymentMethod: 'Net Banking',
    shippingAddress: {
      street: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
    },
    expectedDelivery: '2026-04-30',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T12:00:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '', completed: false },
      { status: 'Out for Delivery', timestamp: '', completed: false },
      { status: 'Delivered', timestamp: '', completed: false },
    ],
    date: '2026-04-28T12:00:00Z',
    createdAt: '2026-04-28T12:00:00Z',
  },
  {
    _id: '5',
    orderId: 'ORD-2026-005',
    user: {
      name: 'Jessica Martinez',
      email: 'jessica.m@example.com',
      phone: '+1 (555) 567-8901',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
    item: 'Grilled Salmon',
    items: [
      {
        _id: 'item6',
        name: 'Grilled Salmon',
        thumbnail: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200',
        quantity: 1,
        price: 22.99,
        subtotal: 22.99,
      },
    ],
    price: 22.99,
    status: 'Pending',
    paymentMethod: 'UPI',
    shippingAddress: {
      street: '654 Maple Drive',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA',
    },
    expectedDelivery: '2026-04-30',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T13:20:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-28T13:21:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '', completed: false },
      { status: 'Delivered', timestamp: '', completed: false },
    ],
    date: '2026-04-28T13:20:00Z',
    createdAt: '2026-04-28T13:20:00Z',
  },
  {
    _id: '6',
    orderId: 'ORD-2026-006',
    user: {
      name: 'Robert Taylor',
      email: 'robert.t@example.com',
      phone: '+1 (555) 678-9012',
      avatar: 'https://i.pravatar.cc/150?img=14',
    },
    item: 'Vegetable Stir Fry',
    items: [
      {
        _id: 'item7',
        name: 'Vegetable Stir Fry',
        thumbnail: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200',
        quantity: 1,
        price: 11.49,
        subtotal: 11.49,
      },
    ],
    price: 11.49,
    status: 'Delivered',
    paymentMethod: 'COD',
    shippingAddress: {
      street: '987 Cedar Lane',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19101',
      country: 'USA',
    },
    expectedDelivery: '2026-04-28',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-27T18:30:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-27T18:31:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '2026-04-28T10:00:00Z', completed: true },
      { status: 'Delivered', timestamp: '2026-04-28T12:15:00Z', completed: true },
    ],
    date: '2026-04-27T18:30:00Z',
    createdAt: '2026-04-27T18:30:00Z',
  },
  {
    _id: '7',
    orderId: 'ORD-2026-007',
    user: {
      name: 'Amanda White',
      email: 'amanda.w@example.com',
      phone: '+1 (555) 789-0123',
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
    item: 'BBQ Ribs Platter',
    items: [
      {
        _id: 'item8',
        name: 'BBQ Ribs Platter',
        thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
        quantity: 1,
        price: 24.99,
        subtotal: 24.99,
      },
    ],
    price: 24.99,
    status: 'Pending',
    paymentMethod: 'Card',
    shippingAddress: {
      street: '147 Birch Street',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78201',
      country: 'USA',
    },
    expectedDelivery: '2026-04-30',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T14:10:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-28T14:11:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '', completed: false },
      { status: 'Delivered', timestamp: '', completed: false },
    ],
    date: '2026-04-28T14:10:00Z',
    createdAt: '2026-04-28T14:10:00Z',
  },
  {
    _id: '8',
    orderId: 'ORD-2026-008',
    user: {
      name: 'James Wilson',
      email: 'james.w@example.com',
      phone: '+1 (555) 890-1234',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    item: 'Chocolate Lava Cake',
    items: [
      {
        _id: 'item9',
        name: 'Chocolate Lava Cake',
        thumbnail: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200',
        quantity: 2,
        price: 7.99,
        subtotal: 15.98,
      },
    ],
    price: 15.98,
    status: 'Failed',
    paymentMethod: 'UPI',
    shippingAddress: {
      street: '258 Willow Court',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      country: 'USA',
    },
    expectedDelivery: '2026-04-30',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T15:00:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '', completed: false },
      { status: 'Out for Delivery', timestamp: '', completed: false },
      { status: 'Delivered', timestamp: '', completed: false },
    ],
    date: '2026-04-28T15:00:00Z',
    createdAt: '2026-04-28T15:00:00Z',
  },
  {
    _id: '9',
    orderId: 'ORD-2026-009',
    user: {
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      phone: '+1 (555) 901-2345',
      avatar: 'https://i.pravatar.cc/150?img=20',
    },
    item: 'Thai Green Curry',
    items: [
      {
        _id: 'item10',
        name: 'Thai Green Curry',
        thumbnail: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200',
        quantity: 1,
        price: 16.99,
        subtotal: 16.99,
      },
    ],
    price: 16.99,
    status: 'Delivered',
    paymentMethod: 'Net Banking',
    shippingAddress: {
      street: '369 Spruce Avenue',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'USA',
    },
    expectedDelivery: '2026-04-28',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-27T20:15:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-27T20:16:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '2026-04-28T09:00:00Z', completed: true },
      { status: 'Delivered', timestamp: '2026-04-28T11:30:00Z', completed: true },
    ],
    date: '2026-04-27T20:15:00Z',
    createdAt: '2026-04-27T20:15:00Z',
  },
  {
    _id: '10',
    orderId: 'ORD-2026-010',
    user: {
      name: 'Christopher Lee',
      email: 'chris.lee@example.com',
      phone: '+1 (555) 012-3456',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    item: 'Fish and Chips',
    items: [
      {
        _id: 'item11',
        name: 'Fish and Chips',
        thumbnail: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=200',
        quantity: 1,
        price: 13.49,
        subtotal: 13.49,
      },
    ],
    price: 13.49,
    status: 'Pending',
    paymentMethod: 'COD',
    shippingAddress: {
      street: '741 Ash Boulevard',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95101',
      country: 'USA',
    },
    expectedDelivery: '2026-04-30',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-04-28T16:30:00Z', completed: true },
      { status: 'Payment Confirmed', timestamp: '2026-04-28T16:31:00Z', completed: true },
      { status: 'Out for Delivery', timestamp: '', completed: false },
      { status: 'Delivered', timestamp: '', completed: false },
    ],
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
