import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import userService from '@/services/userService';
import type { IUser, IUserStats } from '@/types/user';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllUsers = createAsyncThunk<IUser[]>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserStats = createAsyncThunk<IUserStats>(
  'users/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface UserState {
  users: IUser[];
  totalUsers: number;
  isLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  totalUsers: 0,
  isLoading: false,
  statsLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchAllUsers ────────────────────────────────────────────────────────
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<IUser[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── fetchUserStats ───────────────────────────────────────────────────────
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<IUserStats>) => {
        state.statsLoading = false;
        state.totalUsers = action.payload.totalUsers;
      })
      .addCase(fetchUserStats.rejected, (state) => {
        state.statsLoading = false;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
