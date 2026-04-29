import { privateApi } from './api';
import type { ICategory, ICreateCategoryPayload, IUpdateCategoryPayload } from '@/types/category';

const categoryService = {
  getAll: async (): Promise<ICategory[]> => {
    const { data } = await privateApi.get<{ categories: ICategory[] }>('/categories');
    return data.categories;
  },

  create: async (payload: ICreateCategoryPayload): Promise<ICategory> => {
    const { data } = await privateApi.post<{ category: ICategory }>('/categories', payload);
    return data.category;
  },

  update: async (id: string, payload: IUpdateCategoryPayload): Promise<ICategory> => {
    const { data } = await privateApi.put<{ category: ICategory }>(`/categories/${id}`, payload);
    return data.category;
  },

  toggle: async (id: string): Promise<ICategory> => {
    const { data } = await privateApi.patch<{ category: ICategory }>(`/categories/${id}/toggle`);
    return data.category;
  },

  delete: async (id: string): Promise<void> => {
    await privateApi.delete(`/categories/${id}`);
  },
};

export default categoryService;
