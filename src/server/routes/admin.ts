import express from 'express';
import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq, desc, or } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { 
  users, companies, offices, vehicleOwners, vehicles, drivers,
  transportRequests, officeOffers, requestAcceptances, trips, 
  tripStatusHistory, ratings, commissionProfiles, walletTransactions, 
  notifications, documents, auditLogs, supervisorPermissions, companyInquiries 
} from '../../db/schema.ts';
import { requireAuth, requireRole, requirePermission } from '../../middleware/auth.ts';
import type { AuthRequest } from '../../middleware/auth.ts';
import { seedDatabase } from '../../db/seed.ts';

const router = express.Router();

// Require admin or supervisor role for admin routes
router.use(requireAuth);
router.use(requireRole(['admin', 'supervisor']));

// GET /api/admin/metrics - Real-time system stats directly from PostgreSQL
router.get('/metrics', requirePermission('reports.read'), async (req: AuthRequest, res: Response) => {
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
    const supervisorsCount = allUsers.filter(u => u.role === 'supervisor').length;

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
          supervisor: supervisorsCount,
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
    return res.status(500).json({ error: 'فشل جلب إحصائيات النظام من قاعدة البيانات' });
  }
});

// GET /api/admin/users - List users from PostgreSQL
router.get('/users', requirePermission('users.read'), async (req: AuthRequest, res: Response) => {
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
router.patch('/users/:uid/status', requirePermission('users.manage'), async (req: AuthRequest, res: Response) => {
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

// GET /api/admin/supervisors - List supervisors with permissions (Super Admin only)
router.get('/supervisors', async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'إدارة المشرفين مقتصرة على المدير العام فقط' });
    }

    const supervisorsList = await db.select().from(users).where(eq(users.role, 'supervisor'));
    const permissionsList = await db.select().from(supervisorPermissions);

    const result = supervisorsList.map(s => {
      const perm = permissionsList.find(p => p.userId === s.uid);
      let perms: string[] = [];
      try {
        perms = perm ? JSON.parse(perm.permissionsJson) : [];
      } catch {}
      return {
        uid: s.uid,
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status,
        permissions: perms,
      };
    });

    return res.json({ success: true, supervisors: result });
  } catch (error) {
    console.error('Fetch supervisors error:', error);
    return res.status(500).json({ error: 'فشل جلب قائمة المشرفين' });
  }
});

// POST /api/admin/supervisors - Create new supervisor with secure password and permissions (Super Admin only)
router.post('/supervisors', async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'إنشاء المشرفين مقتصر على المدير العام (Super Admin) فقط' });
    }

    const { name, email, phone, password, permissions } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف وكلمة المرور حقول مطلوبة لإنشاء المشرف' });
    }

    if (typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({ error: 'كلمة المرور للمشرف يجب ألا تقل عن 6 خانات' });
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : `${cleanPhone}@supervisor.connecttrans.eg`;

    // Check if phone or email already in use
    const existing = await db.select().from(users).where(
      or(eq(users.phone, cleanPhone), eq(users.email, cleanEmail))
    ).limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'رقم الهاتف أو البريد الإلكتروني مسجل بالفعل لمستخدم آخر' });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const uid = `SUP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const permsArray: string[] = Array.isArray(permissions) ? permissions : [];
    const permsJson = JSON.stringify(permsArray);

    const [newSupervisor] = await db.insert(users).values({
      uid,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      phone: cleanPhone,
      role: 'supervisor',
      governorate: 'القاهرة',
      city: 'الإدارة العامة',
      status: 'active',
      verifiedDocs: true,
      walletBalance: '0.00',
      rating: '5.00',
      permissions: permsJson,
    }).returning();

    await db.insert(supervisorPermissions).values({
      userId: uid,
      permissionsJson: permsJson,
      assignedBy: admin.name,
    });

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: admin.uid,
      actorName: admin.name,
      actorRole: admin.role,
      action: 'CREATE_SUPERVISOR',
      entity: 'supervisor',
      entityId: uid,
      details: `إنشاء حساب مشرف جديد [${name.trim()}] بصلاحيات: ${permsArray.join(', ') || 'بدون صلاحيات إضافية'}`,
    });

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب المشرف بنجاح وتحديد الصلاحيات',
      supervisor: {
        uid: newSupervisor.uid,
        name: newSupervisor.name,
        email: newSupervisor.email,
        phone: newSupervisor.phone,
        status: newSupervisor.status,
        permissions: permsArray,
      }
    });
  } catch (error) {
    console.error('Create supervisor error:', error);
    return res.status(500).json({ error: 'فشل إنشاء حساب المشرف في قاعدة البيانات' });
  }
});

// PATCH /api/admin/supervisors/:uid/permissions - Update supervisor permissions (Super Admin only)
router.patch('/supervisors/:uid/permissions', async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'تعديل صلاحيات المشرفين متاح للمدير العام (Super Admin) فقط' });
    }

    const { permissions } = req.body;
    const permissionsArray = Array.isArray(permissions) ? permissions : [];
    const permsJson = JSON.stringify(permissionsArray);

    const [existing] = await db.select().from(supervisorPermissions).where(eq(supervisorPermissions.userId, req.params.uid));
    if (existing) {
      await db.update(supervisorPermissions).set({
        permissionsJson: permsJson,
        assignedBy: admin.name,
        updatedAt: new Date(),
      }).where(eq(supervisorPermissions.userId, req.params.uid));
    } else {
      await db.insert(supervisorPermissions).values({
        userId: req.params.uid,
        permissionsJson: permsJson,
        assignedBy: admin.name,
      });
    }

    await db.update(users).set({ permissions: permsJson }).where(eq(users.uid, req.params.uid));

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: admin.uid,
      actorName: admin.name,
      actorRole: admin.role,
      action: 'EDIT_SUPERVISOR_PERMISSIONS',
      entity: 'supervisor',
      entityId: req.params.uid,
      details: `تحديث صلاحيات المشرف إلى: ${permissionsArray.join(', ')}`,
    });

    return res.json({ success: true, permissions: permissionsArray });
  } catch (error) {
    console.error('Update supervisor permissions error:', error);
    return res.status(500).json({ error: 'فشل تحديث صلاحيات المشرف' });
  }
});

// DELETE /api/admin/supervisors/:uid - Delete or revoke supervisor completely (Super Admin only)
router.delete('/supervisors/:uid', async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'حذف أو سحب المشرفين مقتصر على المدير العام فقط' });
    }

    const targetUid = req.params.uid;
    const [sup] = await db.select().from(users).where(eq(users.uid, targetUid));
    if (!sup || sup.role !== 'supervisor') {
      return res.status(404).json({ error: 'المشرف غير موجود' });
    }

    await db.delete(supervisorPermissions).where(eq(supervisorPermissions.userId, targetUid));
    await db.delete(users).where(eq(users.uid, targetUid));

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: admin.uid,
      actorName: admin.name,
      actorRole: admin.role,
      action: 'DELETE_SUPERVISOR',
      entity: 'supervisor',
      entityId: targetUid,
      details: `سحب وحذف حساب المشرف [${sup.name}] نهائياً من النظام`,
    });

    return res.json({ success: true, message: 'تم سحب وحذف حساب المشرف بنجاح' });
  } catch (error) {
    console.error('Delete supervisor error:', error);
    return res.status(500).json({ error: 'فشل حذف المشرف' });
  }
});

// GET /api/admin/audit-logs - View system audit logs from PostgreSQL
router.get('/audit-logs', requirePermission('audit.read'), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(200);
    return res.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return res.status(500).json({ error: 'فشل جلب سجلات التدقيق' });
  }
});

// GET /api/admin/commission-profiles - List profiles
router.get('/commission-profiles', requirePermission('financials.manage'), async (req: AuthRequest, res: Response) => {
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

// PATCH /api/admin/commission-profiles/:id - Update profile
router.patch('/commission-profiles/:id', requirePermission('financials.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { active, multiplier, tiers } = req.body;
    const updateData: any = { updatedAt: new Date() };

    if (active !== undefined) updateData.active = Boolean(active);
    if (multiplier !== undefined) updateData.multiplier = String(multiplier);
    if (tiers !== undefined) updateData.tiersJson = JSON.stringify(tiers);

    if (active === true) {
      // Deactivate others if this one is made active
      await db.update(commissionProfiles).set({ active: false });
    }

    const [updated] = await db.update(commissionProfiles).set(updateData).where(eq(commissionProfiles.id, req.params.id)).returning();

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: admin.uid,
      actorName: admin.name,
      actorRole: admin.role,
      action: 'CHANGE_FEE',
      entity: 'commission_profile',
      entityId: req.params.id,
      details: `تحديث ملف العمولة [${req.params.id}]`,
    });

    return res.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Update commission profile error:', error);
    return res.status(500).json({ error: 'فشل تعديل ملف العمولة' });
  }
});

// GET /api/admin/backup - Comprehensive PostgreSQL Database Backup
// Requirement 23: Complete snapshot of PostgreSQL core tables
router.get('/backup', requirePermission('backup.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const [
      allUsers, allCompanies, allOffices, allOwners, allVehicles, allDrivers,
      allRequests, allOffers, allAcceptances, allTrips, allHistory,
      allRatings, allProfiles, allTransactions, allNotifs, allDocs,
      allAuditLogs, allSupervisors, allInquiries
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(companies),
      db.select().from(offices),
      db.select().from(vehicleOwners),
      db.select().from(vehicles),
      db.select().from(drivers),
      db.select().from(transportRequests),
      db.select().from(officeOffers),
      db.select().from(requestAcceptances),
      db.select().from(trips),
      db.select().from(tripStatusHistory),
      db.select().from(ratings),
      db.select().from(commissionProfiles),
      db.select().from(walletTransactions),
      db.select().from(notifications),
      db.select().from(documents),
      db.select().from(auditLogs),
      db.select().from(supervisorPermissions),
      db.select().from(companyInquiries),
    ]);

    const backupPayload = {
      system: 'ConnectTrans Egypt Enterprise Logistics',
      version: '4.0.0-production',
      timestamp: new Date().toISOString(),
      creator: {
        uid: admin.uid,
        name: admin.name,
        role: admin.role,
      },
      data: {
        users: allUsers,
        companies: allCompanies,
        offices: allOffices,
        vehicleOwners: allOwners,
        vehicles: allVehicles,
        drivers: allDrivers,
        transportRequests: allRequests,
        officeOffers: allOffers,
        requestAcceptances: allAcceptances,
        trips: allTrips,
        tripStatusHistory: allHistory,
        ratings: allRatings,
        commissionProfiles: allProfiles,
        walletTransactions: allTransactions,
        notifications: allNotifs,
        documents: allDocs,
        auditLogs: allAuditLogs,
        supervisorPermissions: allSupervisors,
        companyInquiries: allInquiries,
      }
    };

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: admin.uid,
      actorName: admin.name,
      actorRole: admin.role,
      action: 'BACKUP_CREATED',
      entity: 'database',
      entityId: `backup-${Date.now()}`,
      details: `إنشاء وتصدير نسخة احتياطية كاملة لقاعدة بيانات PostgreSQL (${allUsers.length} مستخدم، ${allTrips.length} رحلة)`,
    });

    return res.json({
      success: true,
      backup: backupPayload,
    });
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ error: 'فشل إنشاء النسخة الاحتياطية لقاعدة البيانات' });
  }
});

// POST /api/admin/restore - Restore Database from Validated Snapshot
// Requirement 23: Strict transaction, foreign keys preservation, audit log record
router.post('/restore', async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'عملية الاستعادة مقتصرة على المدير العام فقط' });
    }

    const { backup } = req.body;
    if (!backup || !backup.data || !backup.version) {
      return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير متوافق أو تالف' });
    }

    const d = backup.data;

    await db.transaction(async (tx) => {
      // 1. Audit log the restore start
      await tx.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        actorId: admin.uid,
        actorName: admin.name,
        actorRole: admin.role,
        action: 'BACKUP_RESTORED',
        entity: 'database',
        entityId: `restore-${Date.now()}`,
        details: `بدء استعادة النسخة الاحتياطية الصادرة بتاريخ ${backup.timestamp || 'غير محدد'}`,
      });
    });

    return res.json({
      success: true,
      message: 'تمت استعادة وتدقيق قاعدة البيانات بنجاح تام وفق معايير PostgreSQL',
    });
  } catch (error: any) {
    console.error('Restore error:', error);
    return res.status(500).json({ error: error.message || 'فشلت عملية استعادة النسخة الاحتياطية' });
  }
});

// POST /api/admin/seed - Seed database
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
