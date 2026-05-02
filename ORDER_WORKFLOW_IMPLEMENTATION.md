# Complete Order Workflow Implementation

## Overview
This document outlines the complete order workflow implementation including COD charges, dual-sided status updates, and restructured Admin Order Management.

## Backend Implementation ✅ COMPLETED

### 1. Order Model (`Backend/src/models/Order.model.ts`)
- **Fields**:
  - `orderId`: Unique order ID (auto-generated: ORD-YYYYMM-0001)
  - `userId`: Reference to User
  - `items`: Array of order items with extras
  - `orderType`: 'delivery' | 'collection'
  - `orderNote`: Optional note
  - `subtotal`: Items total
  - `codCharge`: £20.00 for COD orders
  - `totalAmount`: Final total
  - `paymentMethod`: 'Cash on Delivery' | 'Card' | 'Online'
  - `paymentStatus`: 'Pending' | 'Paid' | 'Failed'
  - `orderStatus`: 'Pending' | 'Confirmed' | 'On the Way' | 'Delivered' | 'Cancelled'
  - `shippingAddress`: Required for delivery orders
  - Timestamps

### 2. Services Created
- **User Service** (`Backend/src/services/user/order.service.ts`):
  - `createOrder()`: Create new order
  - `getUserOrders()`: Get user's orders
  - `getOrderById()`: Get specific order

- **Admin Service** (`Backend/src/services/admin/order.service.ts`):
  - `getAllOrders()`: Get all orders (with optional status filter)
  - `getActiveOrders()`: Get non-delivered orders
  - `getDeliveredOrders()`: Get delivered orders only
  - `getOrderById()`: Get order details
  - `updateOrderStatus()`: Update order status
  - `getOrderStats()`: Get statistics

### 3. Controllers Created
- **User Controller** (`Backend/src/controllers/user/order.controller.ts`):
  - POST `/api/user/orders` - Create order
  - GET `/api/user/orders` - Get user orders
  - GET `/api/user/orders/:id` - Get order details

- **Admin Controller** (`Backend/src/controllers/admin/order.controller.ts`):
  - GET `/api/admin/orders` - Get all orders
  - GET `/api/admin/orders/active` - Get active orders
  - GET `/api/admin/orders/delivered` - Get delivered orders
  - GET `/api/admin/orders/:id` - Get order details
  - PATCH `/api/admin/orders/:id/status` - Update status
  - GET `/api/admin/orders/stats` - Get statistics

### 4. Routes Configured
- User routes: `/api/user/orders/*`
- Admin routes: `/api/admin/orders/*`
- Authentication middleware added for user routes

## Frontend Implementation (TO DO)

### 1. User-Side Order Slice (`frontend/store/slices/orderSlice.ts`)
```typescript
// Thunks needed:
- placeOrder(orderData) - Create new order
- fetchUserOrders() - Get user's orders
- fetchOrderById(id) - Get order details

// State:
- orders: Order[]
- currentOrder: Order | null
- loading: boolean
- error: string | null
```

### 2. Checkout Payment Page Updates
**File**: `frontend/app/checkout/payment/page.tsx`

**Changes needed**:
1. Add COD charge constant: `const COD_CHARGE = 20.00`
2. When "Cash on Delivery" is selected:
   - Display: "COD Charge: £20.00"
   - Add to total: `totalAmount = subtotal + COD_CHARGE`
3. On "Place Order" click:
   - Collect all order data (items, address, payment method, totals)
   - Dispatch `placeOrder` thunk
   - Navigate to success page

### 3. Admin Order Pages (TO DO)

#### A. New Orders Page (`admin/src/app/(admin)/admin/orders/new/page.tsx`)
- List orders with status: Pending, Confirmed, On the Way
- Table/Card layout with:
  - Order ID
  - Customer name
  - Items summary
  - Total amount
  - Status badge
  - Action buttons
- Click order → Navigate to details page

#### B. Delivered Orders Page (`admin/src/app/(admin)/admin/orders/delivered/page.tsx`)
- List orders with status: Delivered
- Similar layout to New Orders
- Read-only (no status update buttons)

#### C. Order Details Page (`admin/src/app/(admin)/admin/orders/[id]/page.tsx`)
- Full order information:
  - Order ID, Date, Status
  - Customer details
  - Items with extras
  - Pricing breakdown (subtotal, COD charge, total)
  - Shipping address (if delivery)
  - Payment method and status
- Action buttons:
  - Confirm Order
  - Mark as On the Way
  - Mark as Delivered
  - Cancel Order
- Status updates via PATCH `/api/admin/orders/:id/status`

### 4. Admin Order Slice Updates (`admin/src/store/slices/orderSlice.ts`)
**Remove**: All mock data

**Add thunks**:
```typescript
- fetchActiveOrders() - GET /api/admin/orders/active
- fetchDeliveredOrders() - GET /api/admin/orders/delivered
- fetchOrderById(id) - GET /api/admin/orders/:id
- updateOrderStatus(id, status) - PATCH /api/admin/orders/:id/status
- fetchOrderStats() - GET /api/admin/orders/stats
```

**Update types**:
```typescript
type OrderStatus = 'Pending' | 'Confirmed' | 'On the Way' | 'Delivered' | 'Cancelled'
type PaymentMethod = 'Cash on Delivery' | 'Card' | 'Online'
```

### 5. User "My Orders" Page Updates
**File**: `frontend/app/orders/page.tsx` (or similar)

**Changes needed**:
1. Fetch orders via `fetchUserOrders()` thunk
2. Display orders with status stepper:
   - Pending → Confirmed → On the Way → Delivered
3. Map backend status to stepper progress
4. "View Details" button → Show full order with:
   - Items with selected extras
   - Pricing breakdown including COD charge
   - Delivery address
   - Real-time status

## COD Charge Implementation

### Constant
```typescript
export const COD_CHARGE = 20.00; // £20.00
```

### Calculation Flow
1. User selects items → `subtotal` calculated
2. User selects "Cash on Delivery" → Add `COD_CHARGE`
3. `totalAmount = subtotal + codCharge`
4. Display breakdown:
   ```
   Subtotal:    £45.00
   COD Charge:  £20.00
   ─────────────────────
   Total:       £65.00
   ```

## Status Flow

### Order Lifecycle
```
Pending → Confirmed → On the Way → Delivered
                ↓
            Cancelled
```

### Admin Actions
- **Confirm**: Pending → Confirmed
- **On the Way**: Confirmed → On the Way
- **Delivered**: On the Way → Delivered (auto-moves to Delivered Orders page)
- **Cancel**: Any status → Cancelled

### User View
- Status displayed as progress stepper
- Real-time updates when admin changes status

## API Endpoints Summary

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/orders` | Create new order |
| GET | `/api/user/orders` | Get user's orders |
| GET | `/api/user/orders/:id` | Get order details |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | Get all orders |
| GET | `/api/admin/orders/active` | Get active orders |
| GET | `/api/admin/orders/delivered` | Get delivered orders |
| GET | `/api/admin/orders/:id` | Get order details |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/orders/stats` | Get statistics |

## Database Schema

### Order Collection
```javascript
{
  orderId: "ORD-202605-0001",
  userId: ObjectId("..."),
  items: [
    {
      productId: ObjectId("..."),
      name: "Chicken Tikka Masala",
      price: 12.99,
      quantity: 2,
      selectedExtraOptions: [
        { name: "Extra Spicy", price: 0.50 },
        { name: "Naan Bread", price: 2.00 }
      ],
      subtotal: 30.98
    }
  ],
  orderType: "delivery",
  orderNote: "Please ring doorbell",
  subtotal: 30.98,
  codCharge: 20.00,
  totalAmount: 50.98,
  paymentMethod: "Cash on Delivery",
  paymentStatus: "Pending",
  orderStatus: "Pending",
  shippingAddress: {
    fullName: "John Doe",
    line1: "123 Main St",
    city: "London",
    postcode: "SW1A 1AA",
    phone: "07123456789"
  },
  createdAt: ISODate("2026-05-02T10:30:00Z"),
  updatedAt: ISODate("2026-05-02T10:30:00Z")
}
```

## Next Steps

1. ✅ Backend implementation complete
2. ⏳ Create frontend order slice
3. ⏳ Update checkout payment page with COD logic
4. ⏳ Create admin New Orders page
5. ⏳ Create admin Delivered Orders page
6. ⏳ Create admin Order Details page
7. ⏳ Update admin order slice (remove mocks)
8. ⏳ Update user My Orders page
9. ⏳ Test complete workflow
10. ⏳ Add order confirmation emails (optional)

## Testing Checklist

### User Flow
- [ ] User can place order with COD (£20 charge applied)
- [ ] User can place order with Card (no COD charge)
- [ ] User can view order history
- [ ] User can view order details with extras
- [ ] Status updates reflect in real-time

### Admin Flow
- [ ] Admin sees new orders in "New Orders" page
- [ ] Admin can view order details
- [ ] Admin can update order status
- [ ] Order moves to "Delivered Orders" when marked delivered
- [ ] Statistics update correctly

### Edge Cases
- [ ] Delivery order requires address
- [ ] Collection order doesn't require address
- [ ] COD charge only for Cash on Delivery
- [ ] Payment status updates when delivered (COD)
- [ ] Order ID generation is unique

## Files Created/Modified

### Backend (✅ Complete)
- ✅ `Backend/src/models/Order.model.ts`
- ✅ `Backend/src/services/user/order.service.ts`
- ✅ `Backend/src/services/admin/order.service.ts`
- ✅ `Backend/src/controllers/user/order.controller.ts`
- ✅ `Backend/src/controllers/admin/order.controller.ts`
- ✅ `Backend/src/routes/user/order.routes.ts`
- ✅ `Backend/src/routes/admin/order.routes.ts`
- ✅ `Backend/src/routes/user/index.ts` (updated)
- ✅ `Backend/src/routes/admin/index.ts` (updated)
- ✅ `Backend/src/middlewares/auth.middleware.ts` (updated)

### Frontend (⏳ To Do)
- ⏳ `frontend/store/slices/orderSlice.ts` (create)
- ⏳ `frontend/app/checkout/payment/page.tsx` (update)
- ⏳ `frontend/app/orders/page.tsx` (update)
- ⏳ `admin/src/app/(admin)/admin/orders/new/page.tsx` (create)
- ⏳ `admin/src/app/(admin)/admin/orders/delivered/page.tsx` (create)
- ⏳ `admin/src/app/(admin)/admin/orders/[id]/page.tsx` (create)
- ⏳ `admin/src/store/slices/orderSlice.ts` (update - remove mocks)
- ⏳ `admin/src/services/orderService.ts` (update - add real API calls)
- ⏳ `admin/src/types/order.ts` (update types)
