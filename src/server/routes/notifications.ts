import express from 'express';
import type { Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { notifications } from '../../db/schema.ts';
import { requireAuth } from '../../middleware/auth.ts';
import type { AuthRequest } from '../../middleware/auth.ts';

const router = express.Router();

// GET /api/notifications - List user notifications
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const userNotifs = await db.select().from(notifications).where(eq(notifications.userId, user.uid)).orderBy(desc(notifications.createdAt));
    const unreadCount = userNotifs.filter(n => !n.read).length;

    return res.json({
      success: true,
      notifications: userNotifs,
      unreadCount,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ error: 'فشل جلب الإشعارات' });
  }
});

// PATCH /api/notifications/:id/read - Mark one as read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, req.params.id));
    return res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ error: 'فشل تحديث حالة الإشعار' });
  }
});

// POST /api/notifications/read-all - Mark all user notifications as read
router.post('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.uid));
    return res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ error: 'فشل تحديث الإشعارات' });
  }
});

export default router;
