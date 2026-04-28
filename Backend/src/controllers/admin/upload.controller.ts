import type { Request, Response, NextFunction } from 'express';
import { uploadRepository } from '../../repositories/admin/upload.repository.js';

export const uploadController = {
  uploadImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const folder = (req.query.folder as string) ?? 'products';
      const result = await uploadRepository.uploadImage(file, folder);

      res.status(200).json(result);
    } catch (err) {
      console.error('[UploadController] uploadImage error:', err);
      next(err);
    }
  },

  deleteImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.body as { key: string };
      if (!key) {
        res.status(400).json({ message: 'S3 key is required' });
        return;
      }
      await uploadRepository.deleteImage(key);
      res.status(200).json({ message: 'Image deleted' });
    } catch (err) {
      next(err);
    }
  },
};
