import { Router } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

function formatSub(s: Record<string, unknown>) {
  const amount = Number(s.amount);
  const cycle = s.billingCycle as string;
  const annualCost = cycle === "monthly" ? amount * 12 : cycle === "weekly" ? amount * 52 : amount;
  return {
    ...s,
    amount,
    annualCost,
    createdAt: (s.createdAt as Date).toISOString(),
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));
    res.json(rows.map(r => formatSub(r as unknown as Record<string, unknown>)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, amount, billingCycle, nextChargeDate, category, isEssential = false } = req.body;
    if (!name || !amount || !billingCycle || !nextChargeDate || !category) {
      res.status(400).json({ error: "name, amount, billingCycle, nextChargeDate, and category are required" });
      return;
    }
    const [sub] = await db.insert(subscriptionsTable).values({
      userId: req.userId!,
      name,
      amount: String(amount),
      billingCycle,
      nextChargeDate,
      category,
      isEssential,
    }).returning();
    res.status(201).json(formatSub(sub as unknown as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const updates: Record<string, unknown> = {};
    const fields = ["name", "billingCycle", "nextChargeDate", "category", "isEssential"];
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    if (req.body.amount !== undefined) updates.amount = String(req.body.amount);
    const [sub] = await db.update(subscriptionsTable).set(updates)
      .where(and(eq(subscriptionsTable.id, Number(req.params.id)), eq(subscriptionsTable.userId, req.userId!)))
      .returning();
    if (!sub) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }
    res.json(formatSub(sub as unknown as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [sub] = await db.delete(subscriptionsTable)
      .where(and(eq(subscriptionsTable.id, Number(req.params.id)), eq(subscriptionsTable.userId, req.userId!)))
      .returning();
    if (!sub) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
