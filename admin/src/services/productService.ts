import { privateApi } from './api';
import type {
  IProductsResponse,
  IProductStats,
  IProductFilters,
  IProduct,
  IImageAsset,
  IExtraOption,
} from '@/types/product';
import type { IProductCategory } from '@/types/product';

export interface ICreateProductPayload {
  name: string;
  description: string;
  ingredients: string[];
  isVeg: boolean;
  price: number;
  offerPercentage: number;
  stock: number;
  isAvailable: boolean;
  category: string;
  extraOptions: IExtraOption[];
  thumbnail: IImageAsset;
  gallery: IImageAsset[];
}

const productService = {
  // Upload a single image to S3 — returns { url, key } immediately
  uploadImage: async (file: File, folder: string = 'products'): Promise<IImageAsset> => {
    const fd = new FormData();
    fd.append('image', file);
    // Do NOT set Content-Type manually — browser must set it with the correct multipart boundary
    const { data } = await privateApi.post<IImageAsset>(
      `/upload?folder=${encodeURIComponent(folder)}`,
      fd
    );
    return data;
  },

  // Delete an image from S3 by key
  deleteImage: async (key: string): Promise<void> => {
    await privateApi.delete('/upload', { data: { key } });
  },

  // Create product with pre-uploaded S3 assets — JSON body
  create: async (payload: ICreateProductPayload): Promise<{ product: IProduct; message: string }> => {
    const { data } = await privateApi.post<{ product: IProduct; message: string }>(
      '/products',
      payload
    );
    return data;
  },

  getAll: async (filters: IProductFilters = {}): Promise<IProductsResponse> => {
    const params = new URLSearchParams();
    if (filters.search)    params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.category)  params.set('category', filters.category);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.sortBy)    params.set('sortBy', filters.sortBy);
    if (filters.page)      params.set('page', String(filters.page));
    if (filters.limit)     params.set('limit', String(filters.limit));

    const { data } = await privateApi.get<IProductsResponse>(
      `/products?${params.toString()}`
    );
    return data;
  },

  getStats: async (): Promise<IProductStats> => {
    const { data } = await privateApi.get<IProductStats>('/products/stats');
    return data;
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<void> => {
    await privateApi.patch(`/products/${id}/availability`, { isAvailable });
  },

  delete: async (id: string): Promise<void> => {
    await privateApi.delete(`/products/${id}`);
  },

  getCategories: async (): Promise<IProductCategory[]> => {
    const { data } = await privateApi.get<{ categories: IProductCategory[] }>('/categories');
    return data.categories;
  },
};

export default productService;
