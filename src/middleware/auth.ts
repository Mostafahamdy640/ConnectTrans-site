import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'ct-prod-secret-2026-auth-token-verified-signature';

export interface AuthenticatedUserPayload {
  id: number | string;
  uid: string;
  email: string;
  phone: string;
  role: 'admin' | 'supervisor' | 'company' | 'office' | 'vehicle_owner' | 'driver';
  name: string;
  permissions?: string[];
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export const generateAuthToken = (user: AuthenticatedUserPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      uid: user.uid,
      email: user.email,
      phone: user.phone,
      role: user.role,
      name: user.name,
      permissions: user.permissions || [],
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح: يرجى إرسال رمز المصادقة (Token)' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'رمز الدخول غير صالح أو منتهي الصلاحية' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول أولاً' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `غير مصرح: هذا الإجراء مخصص لـ [${allowedRoles.join(', ')}] فقط` 
      });
    }
    next();
  };
};

/**
 * Requirement 9 & 10: Granular Supervisor Permissions.
 * Super Admin has all permissions.
 * Supervisor must have explicit permission (e.g. 'users.read', 'requests.write', etc.).
 */
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول أولاً' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role === 'supervisor') {
      const perms = req.user.permissions || [];
      if (perms.includes('*') || perms.includes(permission)) {
        return next();
      }
      return res.status(403).json({
        error: `غير مصرح للمشرف: يتطلب تنفيذ هذا الإجراء صلاحية [${permission}]`
      });
    }

    return res.status(403).json({ 
      error: 'غير مصرح: يتطلب هذا الإجراء صلاحيات الإدارة أو إذن إشراف معتمد' 
    });
  };
};
