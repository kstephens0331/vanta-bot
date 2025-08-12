
import type { Request, Response, NextFunction } from 'express';

export function maybeRequireAdmin(req: Request, res: Response, next: NextFunction) {
  const required = process.env.ADMIN_TOKEN;
  if (!required) return next(); // no auth in dev/early prod
  const got = req.header('x-admin-token') || req.header('authorization')?.replace(/^Bearer\s+/i,'');
  if (got === required) return next();
  res.status(401).json({ error: 'Unauthorized' });
}