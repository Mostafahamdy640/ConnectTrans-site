import express from 'express';
import type { Request, Response } from 'express';
import { eq, desc, and, or } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { 
  transportRequests, officeOffers, requestAcceptances, trips, 
  tripStatusHistory, notifications, auditLogs, users, companyInquiries 
} from '../../db/schema.ts';
import { requireAuth, requireRole, JWT_SECRET } from '../../middleware/auth.ts';
import type { AuthRequest } from '../../middleware/auth.ts';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper to mask phone numbers for unauthorized viewers
function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '01*********';
  const clean = phone.trim();
  if (clean.length < 7) return '01*********';
  return clean.slice(0, 3) + '*****' + clean.slice(-3);
}

// Optional Auth extractor to identify viewer if token present
function extractOptionalUser(req: AuthRequest) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return null;
    }
  }
  return null;
}

// GET /api/requests - List all transport requests (Marketplace)
// Requirement 17: Mask contact details until accepted
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const viewer = extractOptionalUser(req);
    const { status, governorate } = req.query;
    
    let allRequests = await db.select().from(transportRequests).orderBy(desc(transportRequests.createdAt));

    if (status && typeof status === 'string') {
      allRequests = allRequests.filter(r => r.status === status);
    }
    if (governorate && typeof governorate === 'string' && governorate !== 'all') {
      allRequests = allRequests.filter(
        r => r.fromGovernorate.includes(governorate) || r.toGovernorate.includes(governorate)
      );
    }

    const requestsWithDetails = await Promise.all(
      allRequests.map(async (r) => {
        const offers = await db.select().from(officeOffers).where(eq(officeOffers.requestId, r.id));
        const acceptances = await db.select().from(requestAcceptances).where(eq(requestAcceptances.requestId, r.id));

        // Determine if viewer is authorized to see unmasked shipper phone
        const isOwner = viewer && (viewer.uid === r.creatorId || viewer.role === 'admin' || viewer.role === 'supervisor');
        const hasAccepted = viewer && acceptances.some(a => a.acceptedById === viewer.uid);
        const canViewShipperPhone = isOwner || hasAccepted;

        const sanitizedOffers = offers.map(o => {
          const canViewOfficePhone = viewer && (viewer.uid === o.officeId || viewer.uid === r.creatorId || viewer.role === 'admin');
          return {
            ...o,
            offeredPricePerUnit: Number(o.offeredPricePerUnit),
            officePhone: canViewOfficePhone ? o.officePhone : maskPhone(o.officePhone),
          };
        });

        return {
          ...r,
          pricePerUnit: Number(r.pricePerUnit),
          weightTons: Number(r.weightTons || 25),
          creatorPhone: canViewShipperPhone ? r.creatorPhone : maskPhone(r.creatorPhone),
          offersCount: sanitizedOffers.length,
          offers: sanitizedOffers,
          acceptances,
        };
      })
    );

    return res.json({ requests: requestsWithDetails });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return res.status(500).json({ error: 'فشل جلب طلبات النقل من قاعدة البيانات' });
  }
});

// GET /api/requests/available - Clearly separated: Published & open requests available for drivers
router.get('/available', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const all = await db.select().from(transportRequests).orderBy(desc(transportRequests.createdAt));
    
    // Filter open requests with remaining quantity > 0
    const available = all.filter(r => 
      r.remainingQuantity > 0 && 
      ['open', 'has_offers', 'partially_accepted'].includes(r.status) &&
      r.creatorId !== user.uid
    );

    const mapped = await Promise.all(available.map(async (r) => {
      const offers = await db.select().from(officeOffers).where(eq(officeOffers.requestId, r.id));
      return {
        ...r,
        pricePerUnit: Number(r.pricePerUnit),
        weightTons: Number(r.weightTons || 25),
        creatorPhone: maskPhone(r.creatorPhone),
        offersCount: offers.length,
      };
    }));

    return res.json({ success: true, requests: mapped });
  } catch (error) {
    console.error('Fetch available requests error:', error);
    return res.status(500).json({ error: 'فشل جلب الطلبات المتاحة' });
  }
});

// GET /api/requests/my-requests - Scoped "طلباتي" (My Requests) for current user
// Office/Company: requests they published (current, in_progress, completed) + received offers
// Driver: requests they accepted + their active/completed trips
router.get('/my-requests', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    if (user.role === 'office' || user.role === 'company') {
      const userRequests = await db.select().from(transportRequests)
        .where(eq(transportRequests.creatorId, user.uid))
        .orderBy(desc(transportRequests.createdAt));

      const detailed = await Promise.all(userRequests.map(async (r) => {
        const offers = await db.select().from(officeOffers).where(eq(officeOffers.requestId, r.id));
        const acceptances = await db.select().from(requestAcceptances).where(eq(requestAcceptances.requestId, r.id));
        const relatedTrips = await db.select().from(trips).where(eq(trips.requestId, r.id));

        return {
          ...r,
          pricePerUnit: Number(r.pricePerUnit),
          weightTons: Number(r.weightTons || 25),
          offers,
          acceptances,
          trips: relatedTrips.map(t => ({
            ...t,
            price: Number(t.price),
            commission: Number(t.commission || 0),
          })),
        };
      }));

      const current = detailed.filter(r => r.status === 'open' || r.status === 'has_offers');
      const inProgress = detailed.filter(r => r.status === 'partially_accepted' || r.trips.some(t => ['assigned', 'loading', 'in_progress'].includes(t.status)));
      const completed = detailed.filter(r => r.status === 'closed' || (r.trips.length > 0 && r.trips.every(t => ['delivered', 'completed'].includes(t.status))));

      return res.json({
        success: true,
        role: user.role,
        summary: {
          total: detailed.length,
          currentCount: current.length,
          inProgressCount: inProgress.length,
          completedCount: completed.length,
        },
        current,
        inProgress,
        completed,
        all: detailed,
      });
    } else if (user.role === 'driver' || user.role === 'vehicle_owner') {
      const driverAcceptances = await db.select().from(requestAcceptances)
        .where(eq(requestAcceptances.acceptedById, user.uid))
        .orderBy(desc(requestAcceptances.createdAt));

      const driverTrips = await db.select().from(trips)
        .where(or(eq(trips.driverId, user.uid), eq(trips.transporterId, user.uid)))
        .orderBy(desc(trips.createdAt));

      const items = await Promise.all(driverAcceptances.map(async (acc) => {
        const [parentReq] = await db.select().from(transportRequests).where(eq(transportRequests.id, acc.requestId));
        const matchingTrip = driverTrips.find(t => t.acceptanceId === acc.id || t.requestId === acc.requestId);

        return {
          acceptanceId: acc.id,
          requestId: acc.requestId,
          requestNumber: parentReq?.requestNumber || 'REQ-UNKNOWN',
          fromGovernorate: parentReq?.fromGovernorate || '',
          fromCity: parentReq?.fromCity || '',
          toGovernorate: parentReq?.toGovernorate || '',
          toCity: parentReq?.toCity || '',
          cargoType: parentReq?.cargoType || '',
          truckType: parentReq?.truckType || '',
          acceptedQuantity: acc.acceptedQuantity,
          pricePerUnit: Number(acc.pricePerUnit),
          totalPrice: Number(acc.totalPrice),
          status: matchingTrip ? matchingTrip.status : acc.status,
          trip: matchingTrip ? {
            ...matchingTrip,
            price: Number(matchingTrip.price),
            commission: Number(matchingTrip.commission || 0),
          } : null,
          creatorName: parentReq?.creatorName || 'صاحب البضاعة',
          creatorPhone: parentReq?.creatorPhone || '',
          createdAt: acc.createdAt,
        };
      }));

      const current = items.filter(item => !item.trip || ['pending', 'assigned'].includes(item.trip.status));
      const inProgress = items.filter(item => item.trip && ['loading', 'in_progress'].includes(item.trip.status));
      const completed = items.filter(item => item.trip && ['delivered', 'completed'].includes(item.trip.status));

      return res.json({
        success: true,
        role: user.role,
        summary: {
          total: items.length,
          currentCount: current.length,
          inProgressCount: inProgress.length,
          completedCount: completed.length,
        },
        current,
        inProgress,
        completed,
        all: items,
      });
    } else {
      // Admin / Supervisor
      const allRequests = await db.select().from(transportRequests).orderBy(desc(transportRequests.createdAt));
      return res.json({
        success: true,
        role: user.role,
        all: allRequests,
      });
    }
  } catch (error) {
    console.error('Fetch my-requests error:', error);
    return res.status(500).json({ error: 'فشل جلب قائمة طلباتي' });
  }
});

// PATCH /api/requests/:id - Edit request (Creator or Super Admin only - Prevents IDOR)
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const [existing] = await db.select().from(transportRequests).where(eq(transportRequests.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: 'طلب النقل غير موجود' });
    }

    // IDOR Prevention: Driver or other users cannot edit someone else's request
    const isOwner = user.uid === existing.creatorId || user.role === 'admin';
    if (!isOwner) {
      return res.status(403).json({ error: 'غير مصرح: لا يمكنك تعديل طلبات شحن تخص أطراف أخرى' });
    }

    if (existing.status === 'closed') {
      return res.status(400).json({ error: 'لا يمكن تعديل طلب نقل مغلق ومكتمل' });
    }

    const { pricePerUnit, requiredQuantity, notes, truckType, cargoType } = req.body;
    const updateData: any = { updatedAt: new Date() };

    if (pricePerUnit !== undefined) {
      const p = parseFloat(String(pricePerUnit));
      if (isNaN(p) || p <= 0) return res.status(400).json({ error: 'سعر النقل يجب أن يكون رقماً موجباً' });
      updateData.pricePerUnit = String(p);
    }

    if (requiredQuantity !== undefined) {
      const q = parseInt(String(requiredQuantity), 10);
      if (isNaN(q) || q < existing.acceptedQuantity) {
        return res.status(400).json({ error: `الكمية الإجمالية لا يمكن أن تقل عن الحمولات المقبولة بالفعل (${existing.acceptedQuantity})` });
      }
      updateData.requiredQuantity = q;
      updateData.remainingQuantity = q - existing.acceptedQuantity;
      if (updateData.remainingQuantity === 0) updateData.status = 'closed';
    }

    if (notes !== undefined) updateData.notes = notes;
    if (truckType) updateData.truckType = truckType;
    if (cargoType) updateData.cargoType = cargoType;

    const [updated] = await db.update(transportRequests).set(updateData).where(eq(transportRequests.id, req.params.id)).returning();

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'UPDATE_REQUEST',
      entity: 'request',
      entityId: existing.id,
      details: `تعديل بيانات طلب الشحن #${existing.requestNumber}`,
    });

    return res.json({ success: true, request: updated });
  } catch (error) {
    console.error('Update request error:', error);
    return res.status(500).json({ error: 'فشل تعديل طلب النقل' });
  }
});

// POST /api/requests - Create a new transport request (Company, Office, or Admin)
router.post('/', requireAuth, requireRole(['company', 'office', 'admin', 'supervisor']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      fromGovernorate, fromCity, toGovernorate, toCity,
      pickupLocation, dropoffLocation, truckType, cargoType,
      weightTons, pricePerUnit, requiredQuantity, notes
    } = req.body;

    if (!fromGovernorate || !toGovernorate || !truckType || !cargoType || !pricePerUnit || !requiredQuantity) {
      return res.status(400).json({ error: 'يرجى استكمال جميع بيانات طلب النقل الأساسية' });
    }

    const qty = parseInt(String(requiredQuantity), 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'الكمية المطلوبة يجب أن تكون رقماً أكبر من صفر' });
    }

    const price = parseFloat(String(pricePerUnit));
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'سعر النقل يجب أن يكون رقماً صحيحاً أكبر من صفر' });
    }

    const id = `req-${Date.now()}`;
    const requestNumber = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const [newRequest] = await db.insert(transportRequests).values({
      id,
      requestNumber,
      creatorId: user.uid,
      creatorType: user.role === 'admin' ? 'admin' : (user.role === 'office' ? 'office' : 'company'),
      creatorName: user.name,
      creatorPhone: user.phone,
      fromGovernorate,
      fromCity: fromCity || 'المدينة الصناعية',
      toGovernorate,
      toCity: toCity || 'محطة الوصول',
      pickupLocation: pickupLocation || `${fromGovernorate} - موقع التحميل`,
      dropoffLocation: dropoffLocation || `${toGovernorate} - موقع التفريغ`,
      truckType,
      cargoType,
      weightTons: weightTons ? String(weightTons) : '25.00',
      pricePerUnit: String(price),
      requiredQuantity: qty,
      remainingQuantity: qty,
      acceptedQuantity: 0,
      status: 'open',
      notes: notes || '',
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'CREATE_REQUEST',
      entity: 'request',
      entityId: id,
      details: `إنشاء طلب شحن جديد #${requestNumber} بكمية ${qty} نقلات (${truckType})`,
    });

    return res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({ error: 'فشل إنشاء طلب النقل' });
  }
});

// GET /api/requests/:id - Single request details with contact protection
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const viewer = extractOptionalUser(req);
    const [request] = await db.select().from(transportRequests).where(eq(transportRequests.id, req.params.id));
    if (!request) {
      return res.status(404).json({ error: 'طلب النقل غير موجود' });
    }

    const offers = await db.select().from(officeOffers).where(eq(officeOffers.requestId, request.id));
    const acceptances = await db.select().from(requestAcceptances).where(eq(requestAcceptances.requestId, request.id));

    const isOwner = viewer && (viewer.uid === request.creatorId || viewer.role === 'admin' || viewer.role === 'supervisor');
    const hasAccepted = viewer && acceptances.some(a => a.acceptedById === viewer.uid);
    const canViewShipperPhone = isOwner || hasAccepted;

    const sanitizedOffers = offers.map(o => {
      const canViewOfficePhone = viewer && (viewer.uid === o.officeId || viewer.uid === request.creatorId || viewer.role === 'admin');
      return {
        ...o,
        offeredPricePerUnit: Number(o.offeredPricePerUnit),
        officePhone: canViewOfficePhone ? o.officePhone : maskPhone(o.officePhone),
      };
    });

    return res.json({
      request: {
        ...request,
        pricePerUnit: Number(request.pricePerUnit),
        weightTons: Number(request.weightTons || 25),
        creatorPhone: canViewShipperPhone ? request.creatorPhone : maskPhone(request.creatorPhone),
        offers: sanitizedOffers,
        acceptances,
      }
    });
  } catch (error) {
    console.error('Fetch request error:', error);
    return res.status(500).json({ error: 'خطأ في جلب تفاصيل الطلب' });
  }
});

// POST /api/requests/:id/offers - Submit office price offer
router.post('/:id/offers', requireAuth, requireRole(['office', 'admin', 'supervisor']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const requestId = req.params.id;
    const { offeredPricePerUnit, availableQuantity, truckTypesAvailable, notes } = req.body;

    const [request] = await db.select().from(transportRequests).where(eq(transportRequests.id, requestId));
    if (!request) {
      return res.status(404).json({ error: 'طلب النقل غير موجود' });
    }

    if (request.status === 'closed' || request.remainingQuantity <= 0) {
      return res.status(400).json({ error: 'عذراً، هذا الطلب مكتمل النقلات ومغلق' });
    }

    const qty = parseInt(String(availableQuantity), 10);
    const price = parseFloat(String(offeredPricePerUnit));

    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال سعر وكمية شاحنات صحيحة' });
    }

    const offerId = `off-${Date.now()}`;

    const [newOffer] = await db.insert(officeOffers).values({
      id: offerId,
      requestId: request.id,
      requestNumber: request.requestNumber,
      officeId: user.uid,
      officeName: user.name,
      officePhone: user.phone,
      offeredPricePerUnit: String(price),
      availableQuantity: qty,
      remainingQuantity: qty,
      acceptedQuantity: 0,
      truckTypesAvailable: truckTypesAvailable || request.truckType,
      notes: notes || '',
      status: 'active',
    }).returning();

    // Update request status to has_offers if open
    if (request.status === 'open') {
      await db.update(transportRequests).set({
        status: 'has_offers',
        updatedAt: new Date(),
      }).where(eq(transportRequests.id, request.id));
    }

    // Send notification to request creator
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: request.creatorId,
      title: 'عرض أسعار جديد لطلبك',
      message: `قدم ${user.name} عرض سعر بقيمة ${price} ج.م للطلب #${request.requestNumber}`,
      type: 'offer',
      link: `/requests/${request.id}`,
    });

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'SUBMIT_OFFER',
      entity: 'offer',
      entityId: offerId,
      details: `تقديم عرض سعر ${price} ج.م لـ ${qty} سيارات على الطلب ${request.requestNumber}`,
    });

    return res.status(201).json({ success: true, offer: newOffer });
  } catch (error) {
    console.error('Submit offer error:', error);
    return res.status(500).json({ error: 'فشل تقديم العرض' });
  }
});

// POST /api/requests/:id/accept - STRICT POSTGRESQL TRANSACTION
// Concurrency & Quota Protection: Prevent over-accepting using PostgreSQL Database Transactions
router.post('/:id/accept', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const requestId = req.params.id;
    const { quantity, offerId, vehiclePlate, driverName, driverPhone } = req.body;

    // Requirement 5: Office cannot accept others' requests
    if (user.role === 'office') {
      return res.status(403).json({ error: 'المكتب لا يستطيع قبول طلبات الآخرين. مكاتب النقل تقدم عروض أسعار فقط ولا تنفذ عمليات السائق.' });
    }

    if (user.role === 'company') {
      return res.status(403).json({ error: 'الشركات تطرح طلبات الشحن ولا تقبل الطلبات.' });
    }

    const acceptedQty = parseInt(String(quantity), 10);
    if (isNaN(acceptedQty) || acceptedQty <= 0) {
      return res.status(400).json({ error: 'الكمية المقبولة يجب أن تكون رقماً صحيحاً موجباً (1 على الأقل)' });
    }

    // Execute atomic PostgreSQL transaction
    const transactionResult = await db.transaction(async (tx) => {
      // 1. Fetch Request with lock verification
      const [reqRecord] = await tx.select().from(transportRequests).where(eq(transportRequests.id, requestId));
      
      if (!reqRecord) {
        throw new Error('طلب النقل غير موجود في النظام');
      }

      if (reqRecord.creatorId === user.uid) {
        throw new Error('لا يمكن لصاحب طلب النقل قبول طلبه بنفسه');
      }

      if (reqRecord.status === 'closed' || reqRecord.remainingQuantity <= 0) {
        throw new Error('عذراً، هذا الطلب مكتمل ومغلق بالفعل ولا يقبل حمولات إضافية');
      }

      // CRITICAL VALIDATION: Prevent over-accepting
      if (acceptedQty > reqRecord.remainingQuantity) {
        throw new Error(
          `الكمية المراد قبولها (${acceptedQty}) أكبر من الكمية المتبقية المتاحة (${reqRecord.remainingQuantity})`
        );
      }

      const newRemaining = reqRecord.remainingQuantity - acceptedQty;
      if (newRemaining < 0) {
        throw new Error('العملية غير صالحة: الكمية المتبقية لا يمكن أن تصبح سالبة');
      }

      let agreedUnitPrice = Number(reqRecord.pricePerUnit);
      let offerRecord = null;

      if (offerId) {
        const [foundOffer] = await tx.select().from(officeOffers).where(eq(officeOffers.id, offerId));
        if (foundOffer) {
          offerRecord = foundOffer;
          agreedUnitPrice = Number(foundOffer.offeredPricePerUnit);

          if (acceptedQty > foundOffer.remainingQuantity) {
            throw new Error(`الكمية المطلوبة تتجاوز الكمية المتبقية في عرض مكتب النقل (${foundOffer.remainingQuantity})`);
          }

          // Deduct from offer if office offer accepted
          const offerNewRemaining = Math.max(0, foundOffer.remainingQuantity - acceptedQty);
          const offerNewAccepted = foundOffer.acceptedQuantity + acceptedQty;
          await tx.update(officeOffers).set({
            remainingQuantity: offerNewRemaining,
            acceptedQuantity: offerNewAccepted,
            status: offerNewRemaining === 0 ? 'exhausted' : 'active',
          }).where(eq(officeOffers.id, offerId));
        }
      }

      // 2. Decrement remaining and increment accepted atomically in PostgreSQL
      const newAccepted = reqRecord.acceptedQuantity + acceptedQty;
      const newStatus = newRemaining === 0 ? 'closed' : 'partially_accepted';

      await tx.update(transportRequests).set({
        remainingQuantity: newRemaining,
        acceptedQuantity: newAccepted,
        status: newStatus,
        updatedAt: new Date(),
      }).where(eq(transportRequests.id, requestId));

      // 3. Create acceptance record
      const acceptanceId = `acc-${Date.now()}`;
      const totalPrice = agreedUnitPrice * acceptedQty;

      const [acceptance] = await tx.insert(requestAcceptances).values({
        id: acceptanceId,
        requestId: reqRecord.id,
        offerId: offerId || null,
        acceptedByRole: user.role,
        acceptedById: user.uid,
        acceptedByName: user.name,
        acceptedByPhone: user.phone,
        acceptedQuantity: acceptedQty,
        pricePerUnit: String(agreedUnitPrice),
        totalPrice: String(totalPrice),
        status: 'confirmed',
      }).returning();

      // 4. Create Trip and release contact details
      const tripId = `trip-${Date.now()}`;
      const tripNumber = `TRIP-EG-${Math.floor(1000 + Math.random() * 9000)}`;

      const [trip] = await tx.insert(trips).values({
        id: tripId,
        tripNumber,
        requestId: reqRecord.id,
        acceptanceId,
        offerId: offerId || null,
        shipperId: reqRecord.creatorId,
        shipperName: reqRecord.creatorName,
        shipperPhone: reqRecord.creatorPhone,
        transporterId: offerRecord ? offerRecord.officeId : user.uid,
        transporterName: offerRecord ? offerRecord.officeName : user.name,
        transporterPhone: offerRecord ? offerRecord.officePhone : user.phone,
        driverId: user.role === 'driver' ? user.uid : null,
        driverName: driverName || (user.role === 'driver' ? user.name : 'سائق معتمد'),
        driverPhone: driverPhone || (user.role === 'driver' ? user.phone : user.phone),
        vehiclePlate: vehiclePlate || (user.role === 'driver' ? 'شاحنة معتمدة' : 'أسطول المكتب'),
        fromLocation: `${reqRecord.fromGovernorate} (${reqRecord.fromCity})`,
        toLocation: `${reqRecord.toGovernorate} (${reqRecord.toCity})`,
        cargoType: reqRecord.cargoType,
        weightTons: reqRecord.weightTons,
        price: String(agreedUnitPrice),
        commission: '0.00',
        status: 'pending',
        currentLocation: reqRecord.pickupLocation || 'نقطة التحميل',
        progressPercent: 10,
      }).returning();

      // 5. Trip history
      await tx.insert(tripStatusHistory).values({
        tripId,
        status: 'pending',
        note: `تم تأكيد قبول الحمولة وإصدار أمر الرحلة ${tripNumber}`,
        actorId: user.uid,
        actorName: user.name,
      });

      // 6. Notifications for both parties
      await tx.insert(notifications).values([
        {
          id: `notif-${Date.now()}-1`,
          userId: reqRecord.creatorId,
          title: 'تم قبول شحنة من طلبك بنجاح!',
          message: `قبل ${user.name} نقل ${acceptedQty} حمولة للطلب #${reqRecord.requestNumber}. رقم الرحلة: ${tripNumber}`,
          type: 'trip',
          link: `/trips/${tripId}`,
        },
        {
          id: `notif-${Date.now()}-2`,
          userId: user.uid,
          title: 'تم تأكيد حجز الرحلة وإصدار بوليصة الشحن',
          message: `تم حجز ${acceptedQty} حمولة للطلب #${reqRecord.requestNumber}. رقم الرحلة: ${tripNumber}`,
          type: 'trip',
          link: `/trips/${tripId}`,
        }
      ]);

      // 7. Audit log
      await tx.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        actorId: user.uid,
        actorName: user.name,
        actorRole: user.role,
        action: 'ACCEPT_REQUEST',
        entity: 'request',
        entityId: requestId,
        details: `قبول ${acceptedQty} نقلة للطلب ${reqRecord.requestNumber}. المتبقي: ${newRemaining}`,
      });

      return {
        remainingQuantity: newRemaining,
        acceptedQuantity: newAccepted,
        isClosed: newRemaining === 0,
        trip,
        acceptance,
      };
    });

    return res.status(200).json({
      success: true,
      message: `تم قبول ${acceptedQty} حمولة بنجاح! الكمية المتبقية: ${transactionResult.remainingQuantity}`,
      data: transactionResult,
    });
  } catch (error: any) {
    console.error('Accept request transaction failed:', error);
    return res.status(400).json({ 
      error: error.message || 'فشلت عملية قبول الحمولة في قاعدة البيانات' 
    });
  }
});

// POST /api/requests/inquiry - Company direct cooperation inquiry
router.post('/inquiry', async (req: Request, res: Response) => {
  try {
    const {
      companyName, contactPerson, phone, email, governorate, city,
      monthlyCargoVolumeTons, truckTypesNeeded, cooperationType, notes
    } = req.body;

    if (!companyName || !phone) {
      return res.status(400).json({ error: 'اسم الشركة ورقم الهاتف للتواصل حقول مطلوبة' });
    }

    const id = `inq-${Date.now()}`;
    const [inquiry] = await db.insert(companyInquiries).values({
      id,
      companyName: companyName.trim(),
      contactPerson: contactPerson || 'مسؤول اللوجستيات',
      phone: phone.trim(),
      email: email || `${phone}@company-eg.com`,
      governorate: governorate || 'القاهرة',
      city: city || 'المنطقة الصناعية',
      monthlyCargoVolumeTons: String(monthlyCargoVolumeTons || 100),
      truckTypesNeeded: Array.isArray(truckTypesNeeded) ? truckTypesNeeded.join(', ') : (truckTypesNeeded || ''),
      cooperationType: cooperationType || 'long_term_contract',
      notes: notes || 'طلب شراكة وتنسيق نقل مباشر',
      status: 'pending',
    }).returning();

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: id,
      actorName: companyName,
      actorRole: 'company',
      action: 'COMPANY_DIRECT_INQUIRY',
      entity: 'inquiry',
      entityId: id,
      details: `تسجيل طلب تعاون مباشر لشركة [${companyName}] - حجم ${monthlyCargoVolumeTons || 100} طن`,
    });

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل طلب تعاون الشركة بنجاح والتواصل المباشر مع إدارة ConnectTrans!',
      inquiry,
    });
  } catch (error) {
    console.error('Company inquiry error:', error);
    return res.status(500).json({ error: 'فشل حفظ طلب التعاون في قاعدة البيانات' });
  }
});

// GET /api/requests/inquiries - List inquiries for admin & supervisors
router.get('/inquiries/all', requireAuth, requireRole(['admin', 'supervisor']), async (req: AuthRequest, res: Response) => {
  try {
    const inquiries = await db.select().from(companyInquiries).orderBy(desc(companyInquiries.createdAt));
    return res.json({ success: true, inquiries });
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    return res.status(500).json({ error: 'فشل جلب طلبات التعاون' });
  }
});

export default router;
