import { Router } from "express";
import { db, budgetsTable, transactionsTable } from "@workspace/db";
import { eq, and, gte, lte, sum } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

async function enrichBudget(b: Record<string, unknown>, userId: number) {
  const now = new Date();
  const month = b.month as number;
  const year = b.year as number;
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  const [spent] = await db.select({ total: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .where(and(
      eq(transactionsTable.userId, userId),
      eq(transactionsTable.category, b.category as string),
      eq(transactionsTable.type, "expense"),
      gte(transactionsTable.date, startDate),
      lte(transactionsTable.date, endDate)
    ));
  const limit = Number(b.monthlyLimit);
  const currentSpent = Number(spent.total) || 0;
  const remaining = Math.max(0, limit - currentSpent);
  const percentUsed = limit > 0 ? Math.min(100, Math.round((currentSpent / limit) * 100)) : 0;
  const status = percentUsed >= 100 ? "exceeded" : percentUsed >= 80 ? "warning" : "ok";
  return {
    ...b,
    monthlyLimit: limit,
    currentSpent,
    remaining,
    percentUsed,
    status,
    createdAt: (b.createdAt as Date).toISOString(),
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const rows = await db.select().from(budgetsTable)
      .where(and(
        eq(budgetsTable.userId, req.userId!),
        eq(budgetsTable.month, now.getMonth() + 1),
        eq(budgetsTable.year, now.getFullYear())
      ));
    const enriched = await Promise.all(rows.map(r => enrichBudget(r as unknown as Record<string, unknown>, req.userId!)));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const { category, monthlyLimit, month = now.getMonth() + 1, year = now.getFullYear() } = req.body;
    if (!category || !monthlyLimit) {
      res.status(400).json({ error: "category and monthlyLimit are required" });
      return;
    }
    const [budget] = await db.insert(budgetsTable).values({
      userId: req.userId!,
      category,
      monthlyLimit: String(monthlyLimit),
      month,
      year,
    }).returning();
    res.status(201).json(await enrichBudget(budget as unknown as Record<string, unknown>, req.userId!));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { monthlyLimit } = req.body;
    const updates: Record<string, unknown> = {};
    if (monthlyLimit !== undefined) updates.monthlyLimit = String(monthlyLimit);
    const [budget] = await db.update(budgetsTable).set(updates)
      .where(and(eq(budgetsTable.id, Number(req.params.id)), eq(budgetsTable.userId, req.userId!)))
      .returning();
    if (!budget) {
      res.status(404).json({ error: "Budget not found" });
      return;
    }
    res.json(await enrichBudget(budget as unknown as Record<string, unknown>, req.userId!));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [budget] = await db.delete(budgetsTable)
      .where(and(eq(budgetsTable.id, Number(req.params.id)), eq(budgetsTable.userId, req.userId!)))
      .returning();
    if (!budget) {
      res.status(404).json({ error: "Budget not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
