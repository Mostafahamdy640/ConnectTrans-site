import express from 'express';
import type { Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { walletTransactions, users, auditLogs, notifications } from '../../db/schema.ts';
import { requireAuth } from '../../middleware/auth.ts';
import type { AuthRequest } from '../../middleware/auth.ts';

const router = express.Router();

// GET /api/wallet/summary - Current user wallet balance & stats
router.get('/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const [userRecord] = await db.select().from(users).where(eq(users.uid, user.uid));
    
    const balance = userRecord ? Number(userRecord.walletBalance || 0) : 0;
    const transactions = await db.select().from(walletTransactions).where(eq(walletTransactions.userId, user.uid)).orderBy(desc(walletTransactions.createdAt));

    let totalCredits = 0;
    let totalDebits = 0;
    let totalCommissions = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'credit') totalCredits += amt;
      if (t.type === 'debit' || t.type === 'payout') totalDebits += amt;
      if (t.type === 'commission_fee') totalCommissions += amt;
    });

    return res.json({
      success: true,
      wallet: {
        balance,
        totalCredits,
        totalDebits,
        totalCommissions,
        currency: 'EGP',
        transactionsCount: transactions.length,
      }
    });
  } catch (error) {
    console.error('Wallet summary error:', error);
    return res.status(500).json({ error: 'فشل جلب ملخص المحفظة' });
  }
});

// GET /api/wallet/transactions - List transactions
router.get('/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const transactions = await db.select().from(walletTransactions).where(eq(walletTransactions.userId, user.uid)).orderBy(desc(walletTransactions.createdAt));

    return res.json({
      success: true,
      transactions: transactions.map(t => ({
        ...t,
        amount: Number(t.amount),
      }))
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return res.status(500).json({ error: 'فشل جلب المعاملات المالية' });
  }
});

// POST /api/wallet/deposit - Add funds / payment gateway simulation (Meeza, Card, Fawry, Vodafone Cash)
router.post('/deposit', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { amount, paymentMethod, reference } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'المبلغ يجب أن يكون رقماً أكبر من صفر' });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.uid, user.uid));
    const currentBalance = userRecord ? Number(userRecord.walletBalance || 0) : 0;
    const newBalance = currentBalance + parsedAmount;

    const txId = `wtx-${Date.now()}`;
    const methodDesc = paymentMethod === 'meeza' ? 'بطاقة ميزة الوطنية' :
                       paymentMethod === 'fawry' ? 'كود فوري للدفع' :
                       paymentMethod === 'vodafone_cash' ? 'محفظة فودافون كاش' : 'بطاقة ائتمانية بنكية';

    await db.insert(walletTransactions).values({
      id: txId,
      userId: user.uid,
      type: 'credit',
      amount: String(parsedAmount),
      description: `شحن رصيد المحفظة عبر [${methodDesc}] ${reference ? `(مرجع: ${reference})` : ''}`,
      status: 'completed',
    });

    await db.update(users).set({
      walletBalance: String(newBalance),
    }).where(eq(users.uid, user.uid));

    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: user.uid,
      title: 'تم إيداع رصيد في محفظتك',
      message: `تم شحن محفظتك بنجاح بمبلغ ${parsedAmount.toLocaleString()} ج.م رصيد متاح حالياً: ${newBalance.toLocaleString()} ج.م`,
      type: 'payment',
      link: '/wallet',
    });

    return res.json({
      success: true,
      message: `تم إيداع ${parsedAmount.toLocaleString()} ج.م بنجاح`,
      newBalance,
      transactionId: txId,
    });
  } catch (error) {
    console.error('Wallet deposit error:', error);
    return res.status(500).json({ error: 'فشل تنفيذ عملية الشحن' });
  }
});

// POST /api/wallet/payout - Request payout / withdrawal
router.post('/payout', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { amount, bankName, accountNumber, iban } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال مبلغ سحب صحيح' });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.uid, user.uid));
    const currentBalance = userRecord ? Number(userRecord.walletBalance || 0) : 0;

    if (parsedAmount > currentBalance) {
      return res.status(400).json({ 
        error: `رصيد المحفظة الحالي (${currentBalance.toLocaleString()} ج.م) لا يكفي لإتمام طلب السحب` 
      });
    }

    const newBalance = currentBalance - parsedAmount;
    const txId = `wtx-payout-${Date.now()}`;

    await db.insert(walletTransactions).values({
      id: txId,
      userId: user.uid,
      type: 'payout',
      amount: String(parsedAmount),
      description: `طلب سحب أرباح إلى حساب [${bankName || 'البنك الأهلي المصري'}] - الحساب: ${accountNumber || iban || 'قيد المعالجة'}`,
      status: 'pending',
    });

    await db.update(users).set({
      walletBalance: String(newBalance),
    }).where(eq(users.uid, user.uid));

    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'PAYOUT_REQUEST',
      entity: 'wallet',
      entityId: txId,
      details: `طلب سحب رصيد بقيمة ${parsedAmount} ج.م إلى بنك ${bankName || 'البنكي'}`,
    });

    return res.json({
      success: true,
      message: `تم تسجيل طلب السحب بقيمة ${parsedAmount.toLocaleString()} ج.م بنجاح ويجري التحويل البنكي`,
      newBalance,
      transactionId: txId,
    });
  } catch (error) {
    console.error('Wallet payout error:', error);
    return res.status(500).json({ error: 'فشل تسجيل طلب السحب' });
  }
});

// POST /api/wallet/escrow/lock - Office pays gross price (e.g., 4000 EGP), platform retains commission (e.g., 500 EGP), driver gets net escrow (e.g., 3500 EGP)
router.post('/escrow/lock', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { 
      requestId, 
      tripId, 
      driverId, 
      driverName, 
      grossPrice, 
      commissionAmount, 
      paymentMethod = 'card',
      paymentReference
    } = req.body;

    const parsedGross = parseFloat(grossPrice);
    const parsedCommission = parseFloat(commissionAmount) || 0;
    
    if (isNaN(parsedGross) || parsedGross <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال مبلغ إجمالي صحيح للنقلة' });
    }

    if (parsedCommission >= parsedGross) {
      return res.status(400).json({ error: 'قيمة العمولة لا يمكن أن تكون مساوية أو أكبر من إجمالي سعر النقلة' });
    }

    const netDriverAmount = parsedGross - parsedCommission;
    const escrowId = `escrow-${Date.now()}`;

    // 1. Log transaction for the paying party (Office / Company)
    await db.insert(walletTransactions).values({
      id: `wtx-escrow-pay-${Date.now()}`,
      userId: user.uid,
      type: 'debit',
      amount: String(parsedGross),
      description: `دفع وتأمين نقلة (طلب: ${requestId || 'عام'}) - إجمالي: ${parsedGross.toLocaleString()} ج.م بواسطة [${paymentMethod}]`,
      status: 'completed',
    });

    // 2. Log Platform Commission
    if (parsedCommission > 0) {
      await db.insert(walletTransactions).values({
        id: `wtx-fee-${Date.now()}`,
        userId: user.uid,
        type: 'commission_fee',
        amount: String(parsedCommission),
        description: `عمولة المنصة المقتطعة عن الطلب [${requestId || 'عام'}]: ${parsedCommission.toLocaleString()} ج.م`,
        status: 'completed',
      });
    }

    // 3. Log Escrow Hold for Driver
    const targetDriverId = driverId || 'pending_driver_assignment';
    await db.insert(walletTransactions).values({
      id: `wtx-escrow-hold-${Date.now()}`,
      userId: targetDriverId,
      type: 'credit',
      amount: String(netDriverAmount),
      description: `مستحقات نقلة في الضمان المالي (Escrow) - صافي أجر السائق: ${netDriverAmount.toLocaleString()} ج.م (يحرر فور تأكيد التسليم)`,
      status: 'pending',
    });

    // 4. Notify Driver if driverId provided
    if (driverId) {
      await db.insert(notifications).values({
        id: `notif-${Date.now()}`,
        userId: driverId,
        title: 'تم تأمين مستحقات النقلة في الضمان',
        message: `قام المكتب بتأمين مبلغ النقلة في محفظة الضمان. صافي مستحقاتك: ${netDriverAmount.toLocaleString()} ج.م وستضاف فور إتمام التسليم.`,
        type: 'payment',
        link: '/wallet',
      });
    }

    // 5. Audit Log
    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'ESCROW_PAYMENT_LOCKED',
      entity: 'wallet',
      entityId: escrowId,
      details: `تم دفع وتأمين نقلة: إجمالي ${parsedGross} ج.م، عمولة المنصة ${parsedCommission} ج.م، صافي السائق ${netDriverAmount} ج.م`,
    });

    return res.json({
      success: true,
      message: 'تم دفع وتأمين مستحقات النقلة بنجاح في حساب الضمان المشفر (Escrow)',
      escrow: {
        escrowId,
        grossPrice: parsedGross,
        commissionAmount: parsedCommission,
        netDriverAmount,
        driverName: driverName || 'كابتن الشاحنة',
        status: 'locked_in_escrow',
        paymentMethod,
        paymentReference: paymentReference || `PAYMOB-REF-${Date.now()}`
      }
    });
  } catch (error) {
    console.error('Escrow lock error:', error);
    return res.status(500).json({ error: 'فشل حجز وتأمين الدفعة في الضمان المالي' });
  }
});

// POST /api/wallet/escrow/office-authorize - Office authorizes driver to receive payout, but funds REMAIN PENDING until Finance Administration releases them
router.post('/escrow/office-authorize', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { escrowId, tripNumber, driverId, driverName, amount } = req.body;

    if (!escrowId) {
      return res.status(400).json({ error: 'معرف عملية الضمان مطلوب' });
    }

    // Audit Log for office authorization
    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'OFFICE_PAYOUT_AUTHORIZED',
      entity: 'wallet',
      entityId: escrowId,
      details: `صرح مكتب النقل (${user.name}) بالسماح للسائق باستلام مستحقات الرحلة ${tripNumber || ''}. العملية معلقة بانتظار تحرير الإدارة المالية.`,
    });

    // Notify Finance Department
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: 'finance-admin-queue',
      title: 'إشعار تصريح مكتب: بانتظار تحرير الإدارة المالية',
      message: `صرح مكتب [${user.name}] بصرف مبلغ (${Number(amount || 0).toLocaleString()} ج.م) للسائق [${driverName || 'الكابتن'}]. العملية معلقة وتتطلب التدقيق والتحرير المالي.`,
      type: 'payment',
      link: '/admin',
    });

    return res.json({
      success: true,
      status: 'pending_finance_release',
      message: 'تم تسجيل تصريح وتفويض مكتب النقل بنجاح. المستحقات معلقة حالياً في خزانة الضمان بانتظار المراجعة والتحرير النهائي من قبل الإدارة المالية.',
      notice: 'تنفيذاً للقواعد المالية: لا يمكن تحويل الأموال لمحفظة السائق إلا بعد اعتماد وموافقة المراقب المالي.'
    });
  } catch (error) {
    console.error('Office authorize error:', error);
    return res.status(500).json({ error: 'فشل تسجيل تصريح المكتب' });
  }
});

// POST /api/wallet/escrow/release - STRICTLY RESTRICTED to Finance Administration and Super Admin
router.post('/escrow/release', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { escrowId, driverId, amount, tripNumber, notes } = req.body;

    // Strict RBAC Enforcement: ONLY Finance and Super Admin can release escrowed funds
    const isFinanceOrAdmin = user.role === 'admin' || user.role === 'finance';
    if (!isFinanceOrAdmin) {
      return res.status(403).json({ 
        error: 'غير مصرح: تحرير وصرف أموال الضمان محصور حصرياً بالإدارة المالية والمدير العام. تظل الأموال معلقة في خزانة الضمان حتى اعتماد المراقب المالي.' 
      });
    }

    if (!driverId || !amount) {
      return res.status(400).json({ error: 'بيانات تحرير المستحقات غير مكتملة' });
    }

    const releaseAmount = parseFloat(amount);
    const [driverRecord] = await db.select().from(users).where(eq(users.uid, driverId));
    if (!driverRecord) {
      return res.status(404).json({ error: 'السائق المستفيد غير مسجل بالنظام' });
    }

    const currentDriverBalance = Number(driverRecord.walletBalance || 0);
    const newDriverBalance = currentDriverBalance + releaseAmount;

    // Credit driver's balance
    await db.update(users).set({
      walletBalance: String(newDriverBalance)
    }).where(eq(users.uid, driverId));

    // Add completed transaction
    await db.insert(walletTransactions).values({
      id: `wtx-payout-rel-${Date.now()}`,
      userId: driverId,
      type: 'credit',
      amount: String(releaseAmount),
      description: `تحرير وصرف مستحقات النقلة (${tripNumber || 'رحلة معتمدة'}) من قبل الإدارة المالية (${user.name}) بعد التدقيق المالي وموافقة المكتب`,
      status: 'completed',
    });

    // Notify driver
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId: driverId,
      title: 'تم اعتماد وتحرير أرباحك من الإدارة المالية',
      message: `قامت الإدارة المالية باعتماد صرف صافي مستحقات النقلة (${releaseAmount.toLocaleString()} ج.م) وأصبحت متاحة في محفظتك للسحب الفوري عبر InstaPay.`,
      type: 'payment',
      link: '/wallet',
    });

    // Audit Log
    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'FINANCE_ESCROW_RELEASED',
      entity: 'wallet',
      entityId: escrowId || `escrow-${Date.now()}`,
      details: `قامت الإدارة المالية (${user.name}) بتحرير وصرف مبلغ ${releaseAmount} ج.م للسائق ${driverRecord.name}`,
    });

    return res.json({
      success: true,
      message: `تم تحرير واعتماد صرف مبلغ ${releaseAmount.toLocaleString()} ج.م بنجاح من قبل الإدارة المالية إلى محفظة السائق`,
      status: 'paid_out',
      releasedBy: user.name,
      newDriverBalance
    });
  } catch (error) {
    console.error('Escrow release error:', error);
    return res.status(500).json({ error: 'فشل تحرير مستحقات الضمان من الإدارة المالية' });
  }
});

// POST /api/wallet/escrow/finance-suspend - Finance freezes / suspends payout capability
router.post('/escrow/finance-suspend', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { escrowId, reason, tripNumber, driverId } = req.body;

    const isFinanceOrAdmin = user.role === 'admin' || user.role === 'finance';
    if (!isFinanceOrAdmin) {
      return res.status(403).json({ 
        error: 'غير مصرح: تعليق أو تجميد صرف المستحقات المالية محصور حصرياً بالإدارة المالية والمدير العام.' 
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'يرجى كتابة سبب التعليق المالي بوضوح' });
    }

    // Audit Log
    await db.insert(auditLogs).values({
      id: `log-${Date.now()}`,
      actorId: user.uid,
      actorName: user.name,
      actorRole: user.role,
      action: 'FINANCE_PAYOUT_SUSPENDED',
      entity: 'wallet',
      entityId: escrowId || `escrow-${Date.now()}`,
      details: `قامت الإدارة المالية بتجميد وتعليق صرف المستحقات للعملية ${tripNumber || ''}. السبب: ${reason}`,
    });

    // Notify driver and office
    if (driverId) {
      await db.insert(notifications).values({
        id: `notif-${Date.now()}`,
        userId: driverId,
        title: 'إشعار مالي: تعليق صرف مستحقات مؤقتاً',
        message: `تم تعليق صرف المستحقات المالية مؤقتاً من قبل الإدارة المالية للمراجعة والتدقيق: ${reason}`,
        type: 'payment',
        link: '/wallet',
      });
    }

    return res.json({
      success: true,
      status: 'finance_suspended',
      message: 'تم تجميد وتعليق تحويل وصرف الأموال بنجاح من قبل الإدارة المالية حتى استكمال المراجعة.',
      reason
    });
  } catch (error) {
    console.error('Finance suspend error:', error);
    return res.status(500).json({ error: 'فشل تعليق العملية المالية' });
  }
});

// In-memory payment gateways configuration for Egyptian payment ecosystem
let gatewayConfig = {
  activeProvider: 'paymob', // 'paymob' | 'kashier' | 'fawry' | 'instapay'
  paymobApiKey: 'sec_test_cbe_paymob_token_connecttrans_production',
  paymobIntegrationIdCard: '4198231',
  paymobIntegrationIdWallet: '4198232',
  paymobHmacSecret: 'hmac_sha512_secret_signature_verified_cbe',
  fawryMerchantCode: 'FAWRY_EG_CONNECTTRANS',
  instapayEnabled: true,
  testMode: true,
  escrowAutoReleaseHours: 24, // Auto release 24 hours after POD if no dispute raised
};

// GET /api/wallet/gateways/config
router.get('/gateways/config', requireAuth, async (req: AuthRequest, res: Response) => {
  // Only admin can view the keys, others get public config
  const isAdmin = req.user?.role === 'admin';
  return res.json({
    success: true,
    config: isAdmin ? gatewayConfig : {
      activeProvider: gatewayConfig.activeProvider,
      instapayEnabled: gatewayConfig.instapayEnabled,
      testMode: gatewayConfig.testMode,
    }
  });
});

// POST /api/wallet/gateways/config (Admin only)
router.post('/gateways/config', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح لغير الإدارة بتعديل بوابات الدفع' });
  }
  const updates = req.body;
  gatewayConfig = { ...gatewayConfig, ...updates };
  return res.json({
    success: true,
    message: 'تم حفظ وتحديث إعدادات بوابات الدفع الإلكتروني بنجاح',
    config: gatewayConfig
  });
});

export default router;
