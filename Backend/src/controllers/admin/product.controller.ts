import type { Request, Response, NextFunction } from 'express';
import { productService } from '../../services/admin/product.service.js';
import type { IImageAsset, IExtraOption } from '../../models/Product.model.js';

interface ICreateProductBody {
  name: string;
  description: string;
  price: number;
  offerPercentage?: number;
  stock?: number;
  isAvailable?: boolean;
  category: string;
  isVeg?: boolean;
  ingredients?: string[];
  extraOptions?: IExtraOption[];
  thumbnail: IImageAsset;
  gallery?: IImageAsset[];
}

export const productController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ICreateProductBody;

      if (!body.thumbnail?.url || !body.thumbnail?.key) {
        res.status(400).json({ message: 'Thumbnail is required' });
        return;
      }

      const product = await productService.create({
        name:            body.name,
        description:     body.description,
        ingredients:     body.ingredients ?? [],
        isVeg:           body.isVeg ?? true,
        price:           Number(body.price),
        offerPercentage: Number(body.offerPercentage ?? 0),
        stock:           Number(body.stock ?? 0),
        isAvailable:     body.isAvailable ?? true,
        category:        body.category,
        extraOptions:    body.extraOptions ?? [],
        thumbnail:       body.thumbnail,
        gallery:         body.gallery ?? [],
      });

      res.status(201).json({ product, message: 'Product created successfully' });
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, category, minPrice, maxPrice, search } =
        req.query as Record<string, string>;

      const filter: Record<string, unknown> = {};
      if (status === 'available')   filter.isAvailable = true;
      if (status === 'unavailable') filter.isAvailable = false;
      if (status === 'outofstock')  { filter.isAvailable = true; filter.stock = 0; }
      if (category)  filter.category = category;
      if (minPrice || maxPrice) {
        filter.finalPrice = {
          ...(minPrice ? { $gte: Number(minPrice) } : {}),
          ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
        };
      }
      if (search) filter.$text = { $search: search };

      const products = await productService.getAll(filter);
      res.status(200).json({ products, total: products.length });
    } catch (err) {
      next(err);
    }
  },

  getStats: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await productService.getStats());
    } catch (err) {
      next(err);
    }
  },

  toggleAvailability: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body as { isAvailable: boolean };
      const product = await productService.toggleAvailability(id, isAvailable);
      if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
      res.status(200).json({ product, message: 'Visibility updated' });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await productService.delete(req.params.id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
