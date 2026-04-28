import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.model.js';

interface ITokenPayload {
  id: string;
  role: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as ITokenPayload;
    const admin = await Admin.findById(payload.id).exec();

    if (!admin) {
      res.status(401).json({ message: 'Unauthorized: Admin not found' });
      return;
    }

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
