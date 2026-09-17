import { Router, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { ratings, trips, users, auditLogs, notifications } from '../../db/schema';
import { requireAuth, AuthRequest } from '../../middleware/auth';

const router = Router();

// POST /api/ratings - Submit rating after trip completion
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { tripId, rating, comment } = req.body;

    const starCount = parseInt(rating, 10);
    if (isNaN(starCount) || starCount < 1 || starCount > 5) {
      return res.status(400).json({ error: 'التقييم يجب أن يكون بين 1 إلى 5 نجوم' });
    }

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) {
      return res.status(404).json({ error: 'الرحلة غير موجودة' });
    }

    // Determine target user (if current is shipper -> target is transporter; if transporter -> target is shipper)
    const isShipper = user.uid === trip.shipperId;
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
      comment: comment || 'خدمة نقل ممتازة والتزام تام بالمواعيد',
    }).returning();

    // Recalculate recipient user rating
    const allUserRatings = await db.select().from(ratings).where(eq(ratings.toUserId, toUserId));
    const avgScore = allUserRatings.reduce((acc, r) => acc + r.rating, 0) / (allUserRatings.length || 1);
    await db.update(users).set({ rating: avgScore.toFixed(2) }).where(eq(users.uid, toUserId));

    // Notify recipient
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: toUserId,
      title: 'حصلت على تقييم جديد!',
      message: `قام ${user.name} بتقييمك ${starCount} من 5 نجوم للرحلة #${trip.tripNumber}`,
      type: 'system',
      link: `/trips/${trip.id}`,
    });

    return res.status(201).json({
      success: true,
      rating: newRating,
      newAverageRating: avgScore.toFixed(2),
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ error: 'فشل حفظ التقييم' });
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
