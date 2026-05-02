import { Order, type IOrder, type IOrderItem, type IShippingAddress } from '../../models/Order.model.js';
import { User } from '../../models/User.model.js';
import type { Types } from 'mongoose';

interface CreateOrderData {
  userId: string;
  items: IOrderItem[];
  orderType: 'delivery' | 'collection';
  orderNote?: string;
  subtotal: number;
  codCharge: number;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Online';
  shippingAddress?: IShippingAddress;
}

export const orderService = {
  /**
   * Create a new order
   */
  createOrder: async (data: CreateOrderData): Promise<IOrder> => {
    // Verify user exists
    const user = await User.findById(data.userId);
    if (!user) throw new Error('User not found');

    // Generate unique order ID
    const orderId = await (Order as any).generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      userId: data.userId,
      items: data.items,
      orderType: data.orderType,
      orderNote: data.orderNote || '',
      subtotal: data.subtotal,
      codCharge: data.codCharge,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Pending',
      shippingAddress: data.shippingAddress,
    });

    return order;
  },

  /**
   * Get all orders for a specific user
   */
  getUserOrders: async (userId: string): Promise<IOrder[]> => {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name thumbnail')
      .exec();

    return orders;
  },

  /**
   * Get a single order by ID (user must own it)
   */
  getOrderById: async (orderId: string, userId: string): Promise<IOrder> => {
    const order = await Order.findOne({ _id: orderId, userId })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name thumbnail')
      .exec();

    if (!order) throw new Error('Order not found');
    return order;
  },
};
