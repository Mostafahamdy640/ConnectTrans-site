import { Router, Response } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../db';
import { 
  transportRequests, officeOffers, requestAcceptances, trips, 
  tripStatusHistory, notifications, auditLogs, users 
} from '../../db/schema';
import { requireAuth, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();

// GET /api/requests - List all transport requests (marketplace)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
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

    // Attach offers count and acceptances to each request
    const requestsWithDetails = await Promise.all(
      allRequests.map(async (r) => {
        const offers = await db.select().from(officeOffers).where(eq(officeOffers.requestId, r.id));
        const acceptances = await db.select().from(requestAcceptances).where(eq(requestAcceptances.requestId, r.id));
        return {
          ...r,
          pricePerUnit: Number(r.pricePerUnit),
          weightTons: Number(r.weightTons || 25),
          offersCount: offers.length,
          offers,
          acceptances,
        };
      })
    );

    return res.json({ requests: requestsWithDetails });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return res.status(500).json({ error: 'فشل جلب طلبات النقل' });
  }
});

// POST /api/requests - Create a new transport request (Company or Admin)
router.post('/', requireAuth, requireRole(['company', 'admin']), async (req: AuthRequest, res: Response) => {
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

    const qty = parseInt(requiredQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'الكمية المطلوبة يجب أن تكون رقماً أكبر من صفر' });
    }

    const price = parseFloat(pricePerUnit);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'سعر النقل يجب أن يكون رقماً صحيحاً أكبر من صفر' });
    }

    const id = `req-${Date.now()}`;
    const requestNumber = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const [newRequest] = await db.insert(transportRequests).values({
      id,
      requestNumber,
      creatorId: user.uid,
      creatorType: user.role === 'admin' ? 'admin' : 'company',
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

// GET /api/requests/:id - Single request details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [request] = await db.select().from(transportRequests).where(eq(transportRequests.id, req.params.id));
    if (!request) {
      return res.status(404).json({ error: 'طلب النقل غير موجود' });
    }

    const offers = await db.select().from(officeOffers).where(eq(officeOffers.requestId, request.id));
    const acceptances = await db.select().from(requestAcceptances).where(eq(requestAcceptances.requestId, request.id));

    return res.json({
      request: {
        ...request,
        pricePerUnit: Number(request.pricePerUnit),
        weightTons: Number(request.weightTons || 25),
        offers,
        acceptances,
      }
    });
  } catch (error) {
    console.error('Fetch request error:', error);
    return res.status(500).json({ error: 'خطأ في جلب تفاصيل الطلب' });
  }
});

// POST /api/requests/:id/offers - Submit office price offer
router.post('/:id/offers', requireAuth, requireRole(['office', 'admin']), async (req: AuthRequest, res: Response) => {
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

    const qty = parseInt(availableQuantity, 10);
    const price = parseFloat(offeredPricePerUnit);

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

// POST /api/requests/:id/accept - STRICT DATABASE TRANSACTION
// Requirement 8: "منع قبول كميات أكبر من الكمية المطلوبة باستخدام Database Transactions"
router.post('/:id/accept', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const requestId = req.params.id;
    const { quantity, offerId, vehiclePlate, driverName, driverPhone } = req.body;

    const acceptedQty = parseInt(quantity, 10) || 1;
    if (acceptedQty <= 0) {
      return res.status(400).json({ error: 'الكمية المقبولة يجب أن تكون 1 على الأقل' });
    }

    // Execute atomic transaction
    const transactionResult = await db.transaction(async (tx) => {
      // 1. Fetch Request with row lock simulation
      const [reqRecord] = await tx.select().from(transportRequests).where(eq(transportRequests.id, requestId));
      
      if (!reqRecord) {
        throw new Error('طلب النقل غير موجود');
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

      let agreedUnitPrice = Number(reqRecord.pricePerUnit);
      let offerRecord = null;

      if (offerId) {
        const [foundOffer] = await tx.select().from(officeOffers).where(eq(officeOffers.id, offerId));
        if (foundOffer) {
          offerRecord = foundOffer;
          agreedUnitPrice = Number(foundOffer.offeredPricePerUnit);

          // Deduct from offer if office accepted
          const offerNewRemaining = Math.max(0, foundOffer.remainingQuantity - acceptedQty);
          const offerNewAccepted = foundOffer.acceptedQuantity + acceptedQty;
          await tx.update(officeOffers).set({
            remainingQuantity: offerNewRemaining,
            acceptedQuantity: offerNewAccepted,
            status: offerNewRemaining === 0 ? 'exhausted' : 'active',
          }).where(eq(officeOffers.id, offerId));
        }
      }

      // 2. Decrement remaining and increment accepted atomically
      const newRemaining = reqRecord.remainingQuantity - acceptedQty;
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

export default router;
