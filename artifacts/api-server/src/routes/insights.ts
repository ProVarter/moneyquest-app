import { Router } from "express";
import { db, transactionsTable, goalsTable, subscriptionsTable, usersTable, challengesTable, userChallengesTable } from "@workspace/db";
import { eq, and, gte, lte, sum, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

    const monthTxs = await db.select().from(transactionsTable).where(and(
      eq(transactionsTable.userId, req.userId!),
      gte(transactionsTable.date, startOfMonth),
      lte(transactionsTable.date, endOfMonth)
    ));

    const income = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    const allTxs = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, req.userId!));
    const totalIncome = allTxs.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = allTxs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const totalBalance = totalIncome - totalExpenses;

    const recentTxs = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.userId, req.userId!))
      .orderBy(desc(transactionsTable.date))
      .limit(5);

    const goals = await db.select().from(goalsTable).where(and(eq(goalsTable.userId, req.userId!), eq(goalsTable.status, "active")));
    const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));

    // Get daily challenge
    const challenges = await db.select().from(challengesTable).where(eq(challengesTable.type, "daily")).limit(5);
    const userChallenges = await db.select().from(userChallengesTable).where(eq(userChallengesTable.userId, req.userId!));
    const completedIds = new Set(userChallenges.filter(uc => uc.isCompleted).map(uc => uc.challengeId));
    const dailyChallenge = challenges.find(c => !completedIds.has(c.id)) || challenges[0];

    // Smart insights
    const smartInsights: string[] = [];
    if (savingsRate > 20) smartInsights.push(`Great job! Your savings rate is ${savingsRate}% this month.`);
    if (savingsRate < 10 && income > 0) smartInsights.push(`Your savings rate is only ${savingsRate}%. Try to save at least 20%.`);
    if (user.streak > 0) smartInsights.push(`You're on a ${user.streak}-day streak! Keep it up!`);
    const topGoal = goals[0];
    if (topGoal) {
      const progress = Math.round((Number(topGoal.currentAmount) / Number(topGoal.targetAmount)) * 100);
      smartInsights.push(`You're ${progress}% of the way to your "${topGoal.title}" goal.`);
    }
    const highSubs = subs.filter(s => Number(s.amount) * 12 > 100);
    if (highSubs.length > 0) {
      smartInsights.push(`Review your ${highSubs.length} subscription(s) — they cost $${highSubs.reduce((s, sub) => s + Number(sub.amount) * 12, 0).toFixed(0)}/year.`);
    }

    const budgetHealthScore = Math.min(100, Math.max(0, 50 + savingsRate + (user.streak * 2)));

    res.json({
      totalBalance,
      incomeThisMonth: income,
      expensesThisMonth: expenses,
      savingsThisMonth: savings,
      savingsRate,
      budgetHealthScore,
      recentTransactions: recentTxs.map(t => ({
        ...t,
        amount: Number(t.amount),
        createdAt: t.createdAt.toISOString(),
      })),
      goalProgress: goals.map(g => ({
        ...g,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
        monthlyContribution: g.monthlyContribution ? Number(g.monthlyContribution) : null,
        progressPercentage: Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100)),
        projectedCompletionDate: null,
        createdAt: g.createdAt.toISOString(),
      })),
      upcomingSubscriptions: subs.map(s => ({
        ...s,
        amount: Number(s.amount),
        annualCost: Number(s.amount) * (s.billingCycle === "monthly" ? 12 : s.billingCycle === "weekly" ? 52 : 1),
        createdAt: s.createdAt.toISOString(),
      })),
      smartInsights,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      dailyChallenge: dailyChallenge ? {
        id: dailyChallenge.id,
        title: dailyChallenge.title,
        description: dailyChallenge.description,
        xpReward: dailyChallenge.xpReward,
        type: dailyChallenge.type,
        difficulty: dailyChallenge.difficulty,
        isCompleted: completedIds.has(dailyChallenge.id),
        completedAt: null,
        expiresAt: dailyChallenge.expiresAt ?? null,
      } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/monthly", requireAuth, async (req: AuthRequest, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const endDate = `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;
      const txs = await db.select().from(transactionsTable).where(and(
        eq(transactionsTable.userId, req.userId!),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate)
      ));
      const income = txs.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const expenses = txs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      result.push({
        month: `${y}-${String(m).padStart(2, "0")}`,
        income,
        expenses,
        savings: income - expenses,
      });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const startDate = (req.query.startDate as string) || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endDate = (req.query.endDate as string) || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    const txs = await db.select().from(transactionsTable).where(and(
      eq(transactionsTable.userId, req.userId!),
      eq(transactionsTable.type, "expense"),
      gte(transactionsTable.date, startDate),
      lte(transactionsTable.date, endDate)
    ));

    const categoryMap = new Map<string, { amount: number; count: number }>();
    let total = 0;
    for (const tx of txs) {
      const amt = Number(tx.amount);
      total += amt;
      const existing = categoryMap.get(tx.category) || { amount: 0, count: 0 };
      categoryMap.set(tx.category, { amount: existing.amount + amt, count: existing.count + 1 });
    }

    const result = Array.from(categoryMap.entries()).map(([category, { amount, count }]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      transactionCount: count,
    })).sort((a, b) => b.amount - a.amount);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
