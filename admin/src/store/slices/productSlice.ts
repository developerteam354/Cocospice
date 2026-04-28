import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import productService from '@/services/productService';
import type {
  IProduct,
  IProductFilters,
  IProductsResponse,
  IProductStats,
} from '@/types/product';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllProducts = createAsyncThunk<IProductsResponse, IProductFilters>(
  'products/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await productService.getAll(filters);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  }
);

export const fetchProductStats = createAsyncThunk<IProductStats>(
  'products/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getStats();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  }
);

export const toggleProductAvailability = createAsyncThunk<
  { id: string; isAvailable: boolean },
  { id: string; isAvailable: boolean }
>(
  'products/toggleAvailability',
  async ({ id, isAvailable }, { rejectWithValue }) => {
    try {
      await productService.toggleAvailability(id, isAvailable);
      return { id, isAvailable };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update');
    }
  }
);

export const deleteProduct = createAsyncThunk<string, string>(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await productService.delete(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete');
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface ProductState {
  products: IProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
  stats: IProductStats;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  stats: { total: 0, available: 0, outOfStock: 0, unlisted: 0 },
  loading: false,
  statsLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action: PayloadAction<IProductsResponse>) => {
        state.loading = false;
        state.products = action.payload.products;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchProductStats.pending, (state) => { state.statsLoading = true; })
      .addCase(fetchProductStats.fulfilled, (state, action: PayloadAction<IProductStats>) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProductStats.rejected, (state) => { state.statsLoading = false; });

    builder.addCase(toggleProductAvailability.fulfilled, (state, action) => {
      const product = state.products.find((p) => p._id === action.payload.id);
      if (product) product.isAvailable = action.payload.isAvailable;
    });

    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload);
      state.total -= 1;
    });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
