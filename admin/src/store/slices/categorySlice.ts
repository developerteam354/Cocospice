import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { privateApi } from '@/services/api';
import type { ICategory, ICreateCategoryPayload, IUpdateCategoryPayload } from '@/types/category';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCategories = createAsyncThunk<ICategory[]>(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await privateApi.get<{ categories: ICategory[] }>('/categories');
      return data.categories;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      return rejectWithValue(message);
    }
  }
);

export const addCategory = createAsyncThunk<ICategory, ICreateCategoryPayload>(
  'category/addCategory',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await privateApi.post<{ category: ICategory }>('/categories', payload);
      return data.category;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      return rejectWithValue(message);
    }
  }
);

export const updateCategory = createAsyncThunk<
  ICategory,
  { id: string; payload: IUpdateCategoryPayload }
>(
  'category/updateCategory',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await privateApi.put<{ category: ICategory }>(`/categories/${id}`, payload);
      return data.category;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      return rejectWithValue(message);
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk<ICategory, string>(
  'category/toggleCategoryStatus',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await privateApi.patch<{ category: ICategory }>(`/categories/${id}/toggle`);
      return data.category;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle category status';
      return rejectWithValue(message);
    }
  }
);

export const deleteCategory = createAsyncThunk<string, string>(
  'category/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await privateApi.delete(`/categories/${id}`);
      return id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface CategoryState {
  categories: ICategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchCategories ──────────────────────────────────────────────────────
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<ICategory[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── addCategory ──────────────────────────────────────────────────────────
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<ICategory>) => {
        state.loading = false;
        state.categories = [action.payload, ...state.categories];
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── updateCategory ───────────────────────────────────────────────────────
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<ICategory>) => {
        state.loading = false;
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── toggleCategoryStatus ─────────────────────────────────────────────────
    builder
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action: PayloadAction<ICategory>) => {
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // ── deleteCategory ───────────────────────────────────────────────────────
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
