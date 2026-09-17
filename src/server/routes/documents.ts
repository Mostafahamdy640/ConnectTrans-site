import { Router, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { documents, users, auditLogs, notifications } from '../../db/schema';
import { requireAuth, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();

// GET /api/documents - List documents for user (or all if admin)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let docs = [];

    if (user.role === 'admin') {
      docs = await db.select().from(documents).orderBy(desc(documents.createdAt));
    } else {
      docs = await db.select().from(documents).where(eq(documents.userId, user.uid)).orderBy(desc(documents.createdAt));
    }

    return res.json({ success: true, documents: docs });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return res.status(500).json({ error: 'فشل جلب المستندات' });
  }
});

// POST /api/documents - Upload / Register a new document
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { documentType, title, fileUrl } = req.body;

    if (!documentType || !title) {
      return res.status(400).json({ error: 'نوع المستند وعنوانه مطلوبان' });
    }

    const docId = `doc-${Date.now()}`;
    const [newDoc] = await db.insert(documents).values({
      id: docId,
      userId: user.uid,
      documentType,
      title,
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
      status: 'pending',
    }).returning();

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'UPLOAD_DOCUMENT',
      entity: 'document',
      entityId: docId,
      details: `رفع مستند جديد [${title}] للتحقق والاعتماد`,
    });

    return res.status(201).json({ success: true, document: newDoc });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({ error: 'فشل رفع المستند' });
  }
});

// PATCH /api/documents/:id/verify - Admin review document
router.patch('/:id/verify', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { status, note } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'حالة التحقق يجب أن تكون إما approved أو rejected' });
    }

    const [doc] = await db.select().from(documents).where(eq(documents.id, req.params.id));
    if (!doc) {
      return res.status(404).json({ error: 'المستند غير موجود' });
    }

    const [updatedDoc] = await db.update(documents).set({
      status,
      verifiedBy: admin.name,
      verifiedAt: new Date(),
    }).where(eq(documents.id, req.params.id)).returning();

    // If approved, update user's verifiedDocs flag
    if (status === 'approved') {
      await db.update(users).set({ verifiedDocs: true }).where(eq(users.uid, doc.userId));
    }

    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: doc.userId,
      title: status === 'approved' ? 'تم اعتماد وثائقك الرسمية بنجاح!' : 'تنبيه بشأن وثائقك',
      message: status === 'approved' 
        ? `تم التحقق من مستند [${doc.title}] وتوثيق حسابك رسمياً.`
        : `تم رفض مستند [${doc.title}]. السبب: ${note || 'المستند غير واضح أو منتهي الصلاحية'}`,
      type: 'system',
      link: '/documents',
    });

    return res.json({ success: true, document: updatedDoc });
  } catch (error) {
    console.error('Verify document error:', error);
    return res.status(500).json({ error: 'فشل اعتماد المستند' });
  }
});

export default router;
