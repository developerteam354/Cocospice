import { categoryRepository } from '../../repositories/admin/category.repository.js';
import type { ICategory } from '../../models/Category.model.js';
import type { ICreateCategoryInput, IUpdateCategoryInput } from '../../repositories/admin/category.repository.js';

export const categoryService = {
  getAll: (): Promise<ICategory[]> =>
    categoryRepository.findAll(),

  create: async (input: ICreateCategoryInput): Promise<ICategory> => {
    const exists = await categoryRepository.findByName(input.name);
    if (exists) throw Object.assign(new Error('Category name already exists'), { statusCode: 409 });
    return categoryRepository.createCategory(input);
  },

  update: (id: string, input: IUpdateCategoryInput): Promise<ICategory | null> =>
    categoryRepository.updateCategory(id, input),

  toggle: (id: string): Promise<ICategory | null> =>
    categoryRepository.toggleListed(id),

  delete: (id: string): Promise<void> =>
    categoryRepository.deleteCategory(id),
};
