import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import orderService from '@/services/orderService';
import type { IOrder, IOrderStats } from '@/types/order';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchOrders = createAsyncThunk<IOrder[]>(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderStats = createAsyncThunk<IOrderStats>(
  'orders/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface OrderState {
  orders: IOrder[];
  stats: IOrderStats;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  stats: { total: 0, pending: 0, failed: 0 },
  loading: false,
  statsLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchOrders ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<IOrder[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── fetchOrderStats ──────────────────────────────────────────────────────
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action: PayloadAction<IOrderStats>) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOrderStats.rejected, (state) => {
        state.statsLoading = false;
      });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;
