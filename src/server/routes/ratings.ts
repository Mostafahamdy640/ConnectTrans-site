import express from 'express';
import type { Response } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { ratings, trips, users, auditLogs, notifications } from '../../db/schema.ts';
import { requireAuth } from '../../middleware/auth.ts';
import type { AuthRequest } from '../../middleware/auth.ts';

const router = express.Router();

// POST /api/ratings - Submit rating after trip completion
// Requirement 18: Prevent rating before completion, prevent duplicates, link to trip, recalculate average
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { tripId, rating, comment } = req.body;

    const starCount = parseInt(String(rating), 10);
    if (isNaN(starCount) || starCount < 1 || starCount > 5) {
      return res.status(400).json({ error: 'التقييم يجب أن يكون بين 1 إلى 5 نجوم' });
    }

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) {
      return res.status(404).json({ error: 'الرحلة غير موجودة' });
    }

    // 1. Prevent rating before completion
    if (trip.status !== 'completed' && trip.status !== 'delivered') {
      return res.status(400).json({ error: 'لا يمكن إضافة تقييم إلا بعد اكتمال الرحلة وتسليم البضاعة' });
    }

    // 2. Ownership / Participant verification
    const isShipper = user.uid === trip.shipperId;
    const isTransporter = user.uid === trip.transporterId;
    const isDriver = user.uid === trip.driverId;

    if (!isShipper && !isTransporter && !isDriver && user.role !== 'admin') {
      return res.status(403).json({ error: 'غير مصرح: التقييم متاح لأطراف الرحلة المعتمدين فقط' });
    }

    // 3. Prevent duplicate ratings
    const existing = await db.select().from(ratings).where(
      and(eq(ratings.tripId, trip.id), eq(ratings.fromUserId, user.uid))
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'لقد قمت بتقييم هذه الرحلة مسبقاً ولا يمكن تكرار التقييم' });
    }

    // Determine recipient
    const toUserId = isShipper ? trip.transporterId : trip.shipperId;
    const toUserName = isShipper ? trip.transporterName : trip.shipperName;
    const toUserRole = isShipper ? 'office' : 'company';

    const ratingId = `rat-${Date.now()}`;

    const [newRating] = await db.insert(ratings).values({
      id: ratingId,
      tripId: trip.id,
      tripNumber: trip.tripNumber,
      fromUserId: user.uid,
      fromUserName: user.name,
      fromUserRole: user.role,
      toUserId,
      toUserName,
      toUserRole,
      rating: starCount,
      comment: comment || 'خدمة نقل متميزة والتزام تام بالمواعيد وسلامة الحمولات',
    }).returning();

    // 4. Recalculate recipient user's average rating in PostgreSQL
    const allUserRatings = await db.select().from(ratings).where(eq(ratings.toUserId, toUserId));
    const totalStars = allUserRatings.reduce((acc, r) => acc + r.rating, 0);
    const avgScore = totalStars / (allUserRatings.length || 1);
    await db.update(users).set({ rating: avgScore.toFixed(2) }).where(eq(users.uid, toUserId));

    // 5. Notify recipient in PostgreSQL
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: toUserId,
      title: 'حصلت على تقييم موثق جديد!',
      message: `قام ${user.name} بتقييم أدائك ${starCount} من 5 نجوم للرحلة #${trip.tripNumber}`,
      type: 'system',
      link: `/trips/${trip.id}`,
    });

    // 6. Audit log in PostgreSQL
    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'RATE_TRIP',
      entity: 'rating',
      entityId: ratingId,
      details: `إضافة تقييم ${starCount} نجوم للرحلة #${trip.tripNumber}`,
    });

    return res.status(201).json({
      success: true,
      rating: newRating,
      newAverageRating: avgScore.toFixed(2),
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ error: 'فشل حفظ التقييم في قاعدة البيانات' });
  }
});

// GET /api/ratings/user/:userId - List ratings for user
router.get('/user/:userId', async (req, res) => {
  try {
    const userRatings = await db.select().from(ratings).where(eq(ratings.toUserId, req.params.userId)).orderBy(desc(ratings.createdAt));
    return res.json({ success: true, ratings: userRatings });
  } catch (error) {
    console.error('Fetch user ratings error:', error);
    return res.status(500).json({ error: 'فشل جلب التقييمات' });
  }
});

export default router;
