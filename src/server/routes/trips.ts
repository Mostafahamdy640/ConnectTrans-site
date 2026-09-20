import express from 'express';
import type { Response } from 'express';
import { eq, desc, or, and } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { 
  trips, tripStatusHistory, notifications, auditLogs, 
  walletTransactions, users, commissionProfiles 
} from '../../db/schema.ts';
import { requireAuth } from '../../middleware/auth.ts';
import type { AuthRequest } from '../../middleware/auth.ts';
import { calculateTripCommission, DEFAULT_COMMISSION_PROFILES } from '../../data/egyptLocations.ts';

const router = express.Router();

// GET /api/trips - List trips for current user or all for admin
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status } = req.query;

    let userTrips = [];
    if (user.role === 'admin' || user.role === 'supervisor') {
      userTrips = await db.select().from(trips).orderBy(desc(trips.createdAt));
    } else if (user.role === 'company') {
      userTrips = await db.select().from(trips).where(eq(trips.shipperId, user.uid)).orderBy(desc(trips.createdAt));
    } else if (user.role === 'office') {
      userTrips = await db.select().from(trips).where(eq(trips.transporterId, user.uid)).orderBy(desc(trips.createdAt));
    } else if (user.role === 'driver') {
      userTrips = await db.select().from(trips).where(
        or(eq(trips.driverId, user.uid), eq(trips.transporterId, user.uid))
      ).orderBy(desc(trips.createdAt));
    } else {
      userTrips = await db.select().from(trips).where(
        or(eq(trips.shipperId, user.uid), eq(trips.transporterId, user.uid))
      ).orderBy(desc(trips.createdAt));
    }

    if (status && typeof status === 'string' && status !== 'all') {
      userTrips = userTrips.filter(t => t.status === status);
    }

    return res.json({
      success: true,
      trips: userTrips.map(t => ({
        ...t,
        price: Number(t.price),
        commission: Number(t.commission || 0),
        weightTons: Number(t.weightTons || 25),
        latitude: t.latitude ? Number(t.latitude) : null,
        longitude: t.longitude ? Number(t.longitude) : null,
      }))
    });
  } catch (error) {
    console.error('Fetch trips error:', error);
    return res.status(500).json({ error: 'فشل جلب قائمة الرحلات' });
  }
});

// GET /api/trips/:id - Single trip with IDOR ownership validation
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const [trip] = await db.select().from(trips).where(eq(trips.id, req.params.id));
    if (!trip) {
      return res.status(404).json({ error: 'الرحلة غير موجودة' });
    }

    // IDOR Check: Requester must be admin, supervisor, shipper, transporter, or driver
    const isAuthorized = 
      user.role === 'admin' || 
      user.role === 'supervisor' ||
      user.uid === trip.shipperId || 
      user.uid === trip.transporterId || 
      user.uid === trip.driverId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'غير مصرح: ليس لديك إذن للاطلاع على تفاصيل هذه الرحلة' });
    }

    const history = await db.select().from(tripStatusHistory).where(eq(tripStatusHistory.tripId, trip.id)).orderBy(desc(tripStatusHistory.timestamp));

    return res.json({
      success: true,
      trip: {
        ...trip,
        price: Number(trip.price),
        commission: Number(trip.commission || 0),
        weightTons: Number(trip.weightTons || 25),
        latitude: tNumber(trip.latitude),
        longitude: tNumber(trip.longitude),
        history,
      }
    });
  } catch (error) {
    console.error('Fetch trip error:', error);
    return res.status(500).json({ error: 'فشل جلب تفاصيل الرحلة' });
  }
});

function tNumber(val: any): number | null {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

// PATCH /api/trips/:id/status - Update trip status with validation
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const tripId = req.params.id;
    const { status, note, currentLocation, progressPercent } = req.body;

    const validStatuses = ['pending', 'assigned', 'loading', 'in_progress', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة الرحلة غير صالحة' });
    }

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) {
      return res.status(404).json({ error: 'الرحلة غير موجودة' });
    }

    // Role & Ownership check
    const isParticipant = 
      user.role === 'admin' || 
      user.role === 'supervisor' ||
      user.uid === trip.transporterId || 
      user.uid === trip.driverId || 
      user.uid === trip.shipperId;

    if (!isParticipant) {
      return res.status(403).json({ error: 'غير مصرح بتعديل حالة هذه الرحلة' });
    }

    let progress = progressPercent !== undefined ? progressPercent : trip.progressPercent;
    if (status === 'delivered') progress = 95;
    if (status === 'completed') progress = 100;
    if (status === 'loading') progress = 25;
    if (status === 'in_progress' && (progress < 30 || progress === 0)) progress = 50;

    const updateData: any = {
      status,
      progressPercent: progress,
    };
    if (currentLocation) updateData.currentLocation = currentLocation;
    if (status === 'in_progress' && !trip.startedAt) updateData.startedAt = new Date();
    if (status === 'completed' && !trip.completedAt) updateData.completedAt = new Date();

    // Commission settlement on completion
    if (status === 'completed' && Number(trip.commission || 0) === 0) {
      const tripPrice = Number(trip.price || 0);
      const [activeProf] = await db.select().from(commissionProfiles).where(eq(commissionProfiles.active, true)).limit(1);
      const profile = activeProf ? {
        id: activeProf.id,
        name: activeProf.name,
        description: activeProf.description,
        active: true,
        multiplier: Number(activeProf.multiplier || 1),
        tiers: JSON.parse(activeProf.tiersJson || '[]'),
      } : DEFAULT_COMMISSION_PROFILES[0];

      const commCalc = calculateTripCommission(tripPrice, profile);
      updateData.commission = String(commCalc.totalCommission);

      // Financial ledger entries in walletTransactions
      const wtxId = `wtx-${Date.now()}`;
      await db.insert(walletTransactions).values({
        id: wtxId,
        userId: trip.transporterId,
        tripId: trip.id,
        type: 'commission_fee',
        amount: String(commCalc.totalCommission),
        description: `عمولة المنصة للرحلة #${trip.tripNumber}`,
        status: 'completed',
      });
    }

    const [updatedTrip] = await db.update(trips).set(updateData).where(eq(trips.id, tripId)).returning();

    // Log status history in PostgreSQL
    await db.insert(tripStatusHistory).values({
      tripId,
      status,
      note: note || `تحديث حالة الرحلة إلى [${status}]`,
      actorId: user.uid,
      actorName: user.name,
    });

    // Notify participants
    const targetUserId = user.uid === trip.shipperId ? trip.transporterId : trip.shipperId;
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: targetUserId,
      title: `تحديث مسار الرحلة #${trip.tripNumber}`,
      message: `تم تحديث حالة الرحلة إلى [${status}] بواسطة ${user.name}`,
      type: 'trip',
      link: `/trips/${tripId}`,
    });

    // Audit log
    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: status === 'completed' ? 'COMPLETE_TRIP' : 'UPDATE_TRIP',
      entity: 'trip',
      entityId: tripId,
      details: `تحديث حالة الرحلة #${trip.tripNumber} إلى ${status}`,
    });

    return res.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error('Update trip status error:', error);
    return res.status(500).json({ error: 'فشل تحديث حالة الرحلة' });
  }
});

// PATCH /api/trips/:id/location - Update live GPS coordinates
router.patch('/:id/location', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const tripId = req.params.id;
    const { latitude, longitude, locationName } = req.body;

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) {
      return res.status(404).json({ error: 'الرحلة غير موجودة' });
    }

    const isAuthorized = 
      user.role === 'admin' || 
      user.role === 'supervisor' ||
      user.uid === trip.transporterId || 
      user.uid === trip.driverId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'غير مصرح بتحديث إحداثيات موقع هذه الشاحنة' });
    }

    const [updated] = await db.update(trips).set({
      latitude: String(latitude),
      longitude: String(longitude),
      currentLocation: locationName || trip.currentLocation,
    }).where(eq(trips.id, tripId)).returning();

    return res.json({ success: true, trip: updated });
  } catch (error) {
    console.error('Update trip GPS error:', error);
    return res.status(500).json({ error: 'فشل تحديث موقع الرحلة' });
  }
});

export default router;
