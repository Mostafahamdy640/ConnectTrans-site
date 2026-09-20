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

export default router;
