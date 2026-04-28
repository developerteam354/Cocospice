import type { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/admin/auth.service.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,   // 'strict' blocks cross-port requests on localhost
  path:     '/',               // must be '/' so all routes receive the cookie
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[Auth] Login attempt:', (req.body as { email?: string }).email);
      const { email, password } = req.body as { email: string; password: string };
      const { admin, accessToken, refreshToken, message } =
        await authService.login(email, password);

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ admin, accessToken, message });
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[Auth] Refresh — cookies received:', Object.keys(req.cookies));
      const token = req.cookies?.refreshToken as string | undefined;

      if (!token) {
        res.status(401).json({ message: 'No refresh token' });
        return;
      }

      const { accessToken, admin, refreshToken: newRefreshToken } =
        await authService.refresh(token);

      // Rotate the refreshToken — always re-set with same options
      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken, admin });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.admin) {
        await authService.logout(req.admin._id.toString());
      }
      // path must match exactly what was used when setting the cookie
      res.clearCookie('refreshToken', { path: '/' });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[Auth] getMe — cookies received:', Object.keys(req.cookies));
      const { password: _, refreshToken: __, ...adminData } =
        (req.admin as any).toObject();
      res.status(200).json({ admin: adminData });
    } catch (err) {
      next(err);
    }
  },
};
