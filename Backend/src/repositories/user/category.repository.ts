import { Category } from '../../models/Category.model.js';

export const userCategoryRepository = {
  /**
   * Find all active categories
   */
  findAll: async () => {
    return Category.find().sort({ name: 1 }).lean();
  },

  /**
   * Find a single category by ID
   */
  findById: async (id: string) => {
    return Category.findById(id).lean();
  },

  /**
   * Find categories with product count
   */
  findWithProductCount: async () => {
    return Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $project: {
          name: 1,
          productCount: {
            $size: {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $eq: ['$$product.isAvailable', true] },
              },
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);
  },
};
