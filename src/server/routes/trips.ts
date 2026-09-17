import { Router, Response } from 'express';
import { eq, desc, or } from 'drizzle-orm';
import { db } from '../../db';
import { 
  trips, tripStatusHistory, notifications, auditLogs, 
  walletTransactions, users, commissionProfiles 
} from '../../db/schema';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { calculateTripCommission, DEFAULT_COMMISSION_PROFILES } from '../../data/egyptLocations';

const router = Router();

// GET /api/trips - List trips for current user or all for admin
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status } = req.query;

    let userTrips = [];
    try {
      if (user.role === 'admin') {
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
    } catch (e) {
      console.warn('DB select failed, returning empty list:', e);
      userTrips = [];
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

// GET /api/trips/:id - Single trip with history
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [trip] = await db.select().from(trips).where(eq(trips.id, req.params.id));
    if (!trip) {
      return res.status(404).json({ error: 'الرحلة غير موجودة' });
    }

    const history = await db.select().from(tripStatusHistory).where(eq(tripStatusHistory.tripId, trip.id));

    return res.json({
      success: true,
      trip: {
        ...trip,
        price: Number(trip.price),
        commission: Number(trip.commission || 0),
        weightTons: Number(trip.weightTons || 25),
        latitude: trip.latitude ? Number(trip.latitude) : null,
        longitude: trip.longitude ? Number(trip.longitude) : null,
        history,
      }
    });
  } catch (error) {
    console.error('Fetch trip error:', error);
    return res.status(500).json({ error: 'فشل جلب تفاصيل الرحلة' });
  }
});

// PATCH /api/trips/:id/status - Update trip status
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

    // Role check: Only assigned transporter, driver, shipper or admin can update status
    if (user.role !== 'admin' && user.uid !== trip.transporterId && user.uid !== trip.driverId && user.uid !== trip.shipperId) {
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

    const [updatedTrip] = await db.update(trips).set(updateData).where(eq(trips.id, tripId)).returning();

    // Log history
    await db.insert(tripStatusHistory).values({
      tripId,
      status,
      note: note || `تحديث حالة الرحلة إلى [${status}]`,
      actorId: user.uid,
      actorName: user.name,
    });

    // Notify other party
    const targetUserId = user.uid === trip.shipperId ? trip.transporterId : trip.shipperId;
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: targetUserId,
      title: `تحديث الرحلة #${trip.tripNumber}`,
      message: `تم تحديث حالة الرحلة إلى: ${status} بواسطة ${user.name}`,
      type: 'trip',
      link: `/trips/${tripId}`,
    });

    // If completed, trigger settlement
    if (status === 'completed') {
      const tripPrice = Number(trip.price);
      const profile = DEFAULT_COMMISSION_PROFILES[0];
      const commCalc = calculateTripCommission(tripPrice, profile);
      const calcCommission = commCalc.totalCommission;
      const netTransporterAmount = tripPrice - calcCommission;

      // Update commission on trip
      await db.update(trips).set({ commission: String(calcCommission) }).where(eq(trips.id, tripId));

      // Wallet credit for transporter
      await db.insert(walletTransactions).values([
        {
          id: `wtx-${Date.now()}-1`,
          userId: trip.transporterId,
          tripId: trip.id,
          type: 'credit',
          amount: String(netTransporterAmount),
          description: `مستحقات الرحلة #${trip.tripNumber} (بعد خصم العمولة ${calcCommission} ج.م)`,
          status: 'completed',
        },
        {
          id: `wtx-${Date.now()}-2`,
          userId: 'USR-ADM-01',
          tripId: trip.id,
          type: 'commission_fee',
          amount: String(calcCommission),
          description: `عمولة المنصة من الرحلة #${trip.tripNumber}`,
          status: 'completed',
        }
      ]);
    }

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
    const { latitude, longitude, currentLocation, progressPercent } = req.body;

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) {
      return res.status(404).json({ error: 'الرحلة غير موجودة' });
    }

    if (user.role !== 'admin' && user.uid !== trip.transporterId && user.uid !== trip.driverId) {
      return res.status(403).json({ error: 'فقط السائق أو الناقل المسؤول يمكنه إرسال إحداثيات GPS الحية' });
    }

    const [updated] = await db.update(trips).set({
      latitude: latitude ? String(latitude) : trip.latitude,
      longitude: longitude ? String(longitude) : trip.longitude,
      currentLocation: currentLocation || trip.currentLocation,
      progressPercent: progressPercent !== undefined ? progressPercent : trip.progressPercent,
    }).where(eq(trips.id, tripId)).returning();

    return res.json({
      success: true,
      location: {
        tripId,
        latitude: Number(updated.latitude),
        longitude: Number(updated.longitude),
        currentLocation: updated.currentLocation,
        progressPercent: updated.progressPercent,
      }
    });
  } catch (error) {
    console.error('Update GPS location error:', error);
    return res.status(500).json({ error: 'فشل تحديث موقع الرحلة' });
  }
});

export default router;
