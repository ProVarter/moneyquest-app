import { Router } from "express";
import { db, goalsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

function calcProjected(current: number, target: number, monthly: number | null): string | null {
  if (!monthly || monthly <= 0) return null;
  const remaining = target - current;
  if (remaining <= 0) return new Date().toISOString().split("T")[0];
  const months = Math.ceil(remaining / monthly);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function formatGoal(g: Record<string, unknown>) {
  const target = Number(g.targetAmount);
  const current = Number(g.currentAmount);
  const monthly = g.monthlyContribution ? Number(g.monthlyContribution) : null;
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return {
    ...g,
    targetAmount: target,
    currentAmount: current,
    monthlyContribution: monthly,
    progressPercentage: progress,
    projectedCompletionDate: calcProjected(current, target, monthly),
    createdAt: (g.createdAt as Date).toISOString(),
    updatedAt: g.updatedAt ? (g.updatedAt as Date).toISOString() : undefined,
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(goalsTable).where(eq(goalsTable.userId, req.userId!));
    res.json(rows.map(formatGoal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, icon, targetAmount, currentAmount = 0, monthlyContribution, deadline } = req.body;
    if (!title || !targetAmount) {
      res.status(400).json({ error: "title and targetAmount are required" });
      return;
    }
    const [goal] = await db.insert(goalsTable).values({
      userId: req.userId!,
      title,
      icon,
      targetAmount: String(targetAmount),
      currentAmount: String(currentAmount),
      monthlyContribution: monthlyContribution ? String(monthlyContribution) : null,
      deadline,
    }).returning();
    res.status(201).json(formatGoal(goal as unknown as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const updates: Record<string, unknown> = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.icon !== undefined) updates.icon = req.body.icon;
    if (req.body.targetAmount !== undefined) updates.targetAmount = String(req.body.targetAmount);
    if (req.body.currentAmount !== undefined) updates.currentAmount = String(req.body.currentAmount);
    if (req.body.monthlyContribution !== undefined) updates.monthlyContribution = req.body.monthlyContribution ? String(req.body.monthlyContribution) : null;
    if (req.body.deadline !== undefined) updates.deadline = req.body.deadline;
    if (req.body.status !== undefined) updates.status = req.body.status;
    const [goal] = await db.update(goalsTable).set(updates)
      .where(and(eq(goalsTable.id, Number(req.params.id)), eq(goalsTable.userId, req.userId!)))
      .returning();
    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }
    res.json(formatGoal(goal as unknown as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [goal] = await db.delete(goalsTable)
      .where(and(eq(goalsTable.id, Number(req.params.id)), eq(goalsTable.userId, req.userId!)))
      .returning();
    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/contribute", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ error: "Valid amount is required" });
      return;
    }
    const [existing] = await db.select().from(goalsTable)
      .where(and(eq(goalsTable.id, Number(req.params.id)), eq(goalsTable.userId, req.userId!)))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }
    const newAmount = Number(existing.currentAmount) + Number(amount);
    const status = newAmount >= Number(existing.targetAmount) ? "completed" : existing.status;
    const [goal] = await db.update(goalsTable)
      .set({ currentAmount: String(newAmount), status })
      .where(eq(goalsTable.id, Number(req.params.id)))
      .returning();
    res.json(formatGoal(goal as unknown as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
