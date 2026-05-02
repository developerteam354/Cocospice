import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import addressReducer from './slices/addressSlice';
import userAuthReducer from './slices/userAuthSlice';
import orderReducer from './slices/orderSlice';
import { injectStore } from '../lib/api';

// ─── Persist config — only cart is persisted ─────────────────────────────────

const cartPersistConfig = {
  key: 'cocospice_cart',
  version: 1,
  storage,
  // Whitelist specific fields to keep the persisted payload lean
  whitelist: ['items', 'orderType', 'orderNote'],
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// ─── Root reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  products:   productReducer,
  categories: categoryReducer,
  cart:       persistedCartReducer,
  addresses:  addressReducer,
  userAuth:   userAuthReducer,
  order:      orderReducer,
});

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches non-serialisable actions internally — ignore them
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Inject store into API service for interceptor access
injectStore(store);

export const persistor = persistStore(store);

export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
