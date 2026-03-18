import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, or, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { type, category, startDate, endDate, search, limit = 50, offset = 0 } = req.query;
    const conditions = [eq(transactionsTable.userId, req.userId!)];
    if (type) conditions.push(eq(transactionsTable.type, type as string));
    if (category) conditions.push(eq(transactionsTable.category, category as string));
    if (startDate) conditions.push(gte(transactionsTable.date, startDate as string));
    if (endDate) conditions.push(lte(transactionsTable.date, endDate as string));
    if (search) {
      conditions.push(
        or(
          ilike(transactionsTable.description, `%${search}%`),
          ilike(transactionsTable.category, `%${search}%`)
        ) as ReturnType<typeof eq>
      );
    }
    const rows = await db.select().from(transactionsTable)
      .where(and(...conditions))
      .orderBy(desc(transactionsTable.date))
      .limit(Number(limit))
      .offset(Number(offset));
    res.json(rows.map(formatTransaction));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { type, amount, category, subcategory, description, notes, tags = [], date, isRecurring = false, recurringPeriod } = req.body;
    if (!type || !amount || !category || !description || !date) {
      res.status(400).json({ error: "type, amount, category, description, and date are required" });
      return;
    }
    const [tx] = await db.insert(transactionsTable).values({
      userId: req.userId!,
      type,
      amount: String(amount),
      category,
      subcategory,
      description,
      notes,
      tags,
      date,
      isRecurring,
      recurringPeriod,
    }).returning();
    res.status(201).json(formatTransaction(tx));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [tx] = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.id, Number(req.params.id)), eq(transactionsTable.userId, req.userId!)))
      .limit(1);
    if (!tx) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.json(formatTransaction(tx));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const updates: Record<string, unknown> = {};
    const fields = ["type", "amount", "category", "subcategory", "description", "notes", "tags", "date", "isRecurring", "recurringPeriod"];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        if (f === "amount") updates.amount = String(req.body[f]);
        else updates[f === "isRecurring" ? "isRecurring" : f] = req.body[f];
      }
    }
    if (req.body.isRecurring !== undefined) updates.isRecurring = req.body.isRecurring;
    const [tx] = await db.update(transactionsTable).set(updates)
      .where(and(eq(transactionsTable.id, Number(req.params.id)), eq(transactionsTable.userId, req.userId!)))
      .returning();
    if (!tx) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.json(formatTransaction(tx));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [tx] = await db.delete(transactionsTable)
      .where(and(eq(transactionsTable.id, Number(req.params.id)), eq(transactionsTable.userId, req.userId!)))
      .returning();
    if (!tx) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatTransaction(tx: Record<string, unknown>) {
  return {
    ...tx,
    amount: Number(tx.amount),
    createdAt: (tx.createdAt as Date).toISOString(),
    updatedAt: tx.updatedAt ? (tx.updatedAt as Date).toISOString() : undefined,
  };
}

export default router;
