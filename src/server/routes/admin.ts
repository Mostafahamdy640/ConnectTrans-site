import { Router, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { 
  users, transportRequests, trips, walletTransactions, 
  auditLogs, commissionProfiles, documents 
} from '../../db/schema';
import { requireAuth, requireRole, AuthRequest } from '../../middleware/auth';
import { seedDatabase } from '../../db/seed';

const router = Router();

// Require admin role for all routes in this file
router.use(requireAuth);
router.use(requireRole(['admin']));

// GET /api/admin/metrics - Real-time system stats
router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    const allRequests = await db.select().from(transportRequests);
    const allTrips = await db.select().from(trips);
    const allTransactions = await db.select().from(walletTransactions);
    const allDocs = await db.select().from(documents);

    const companiesCount = allUsers.filter(u => u.role === 'company').length;
    const officesCount = allUsers.filter(u => u.role === 'office').length;
    const ownersCount = allUsers.filter(u => u.role === 'vehicle_owner').length;
    const driversCount = allUsers.filter(u => u.role === 'driver').length;

    const activeRequests = allRequests.filter(r => r.status === 'open' || r.status === 'has_offers' || r.status === 'partially_accepted').length;
    const closedRequests = allRequests.filter(r => r.status === 'closed').length;

    const activeTrips = allTrips.filter(t => t.status === 'in_progress' || t.status === 'loading' || t.status === 'assigned').length;
    const completedTrips = allTrips.filter(t => t.status === 'completed' || t.status === 'delivered').length;

    // Financial totals
    let totalPlatformCommissions = 0;
    let totalVolumeTraded = 0;

    allTrips.forEach(t => {
      totalVolumeTraded += Number(t.price || 0);
      totalPlatformCommissions += Number(t.commission || 0);
    });

    const pendingDocsCount = allDocs.filter(d => d.status === 'pending').length;

    return res.json({
      success: true,
      metrics: {
        totalUsers: allUsers.length,
        usersByRole: {
          company: companiesCount,
          office: officesCount,
          vehicle_owner: ownersCount,
          driver: driversCount,
          admin: allUsers.filter(u => u.role === 'admin').length,
        },
        requests: {
          total: allRequests.length,
          active: activeRequests,
          closed: closedRequests,
        },
        trips: {
          total: allTrips.length,
          active: activeTrips,
          completed: completedTrips,
        },
        financials: {
          totalVolumeTraded,
          totalPlatformCommissions,
          currency: 'EGP',
        },
        pendingDocsCount,
      }
    });
  } catch (error) {
    console.error('Fetch admin metrics error:', error);
    return res.status(500).json({ error: 'فشل جلب إحصائيات النظام' });
  }
});

// GET /api/admin/users - List users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.query;
    let list = await db.select().from(users).orderBy(desc(users.createdAt));

    if (role && typeof role === 'string' && role !== 'all') {
      list = list.filter(u => u.role === role);
    }
    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter(u => u.status === status);
    }

    return res.json({
      success: true,
      users: list.map(u => ({
        id: u.id,
        uid: u.uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        governorate: u.governorate,
        city: u.city,
        status: u.status,
        verifiedDocs: u.verifiedDocs,
        walletBalance: Number(u.walletBalance || 0),
        rating: Number(u.rating || 5),
        createdAt: u.createdAt,
      }))
    });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    return res.status(500).json({ error: 'فشل جلب المستخدمين' });
  }
});

// PATCH /api/admin/users/:uid/status - Suspend or activate user
router.patch('/users/:uid/status', async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { status, verifiedDocs } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (verifiedDocs !== undefined) updateData.verifiedDocs = verifiedDocs;

    const [updated] = await db.update(users).set(updateData).where(eq(users.uid, req.params.uid)).returning();
    if (!updated) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: admin.uid,
      actorName: admin.name,
      actorRole: admin.role,
      action: 'UPDATE_USER_STATUS',
      entity: 'user',
      entityId: req.params.uid,
      details: `تعديل حالة المستخدم إلى [${status || updated.status}] والتوثيق إلى [${verifiedDocs}]`,
    });

    return res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ error: 'فشل تحديث حالة الحساب' });
  }
});

// GET /api/admin/audit-logs - View system audit logs
router.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(100);
    return res.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return res.status(500).json({ error: 'فشل جلب سجلات التدقيق' });
  }
});

// GET /api/admin/commission-profiles - List profiles
router.get('/commission-profiles', async (req: AuthRequest, res: Response) => {
  try {
    const profiles = await db.select().from(commissionProfiles);
    return res.json({
      success: true,
      profiles: profiles.map(p => ({
        ...p,
        multiplier: Number(p.multiplier || 1),
        tiers: JSON.parse(p.tiersJson || '[]'),
      }))
    });
  } catch (error) {
    console.error('Fetch commission profiles error:', error);
    return res.status(500).json({ error: 'فشل جلب شرائح العمولات' });
  }
});

// POST /api/admin/seed - Re-run database seed
router.post('/seed', async (req: AuthRequest, res: Response) => {
  try {
    await seedDatabase();
    return res.json({ success: true, message: 'تم تهيئة وتحديث قاعدة البيانات بنجاح' });
  } catch (error) {
    console.error('Seed database error:', error);
    return res.status(500).json({ error: 'فشل تشغيل عملية البذر (Seed)' });
  }
});

export default router;
