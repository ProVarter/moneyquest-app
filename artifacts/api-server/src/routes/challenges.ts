import { Router } from "express";
import { db, challengesTable, userChallengesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const challenges = await db.select().from(challengesTable);
    const userChallenges = await db.select().from(userChallengesTable).where(eq(userChallengesTable.userId, req.userId!));
    const ucMap = new Map(userChallenges.map(uc => [uc.challengeId, uc]));
    const result = challenges.map(c => {
      const uc = ucMap.get(c.id);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        xpReward: c.xpReward,
        type: c.type,
        difficulty: c.difficulty,
        isCompleted: uc?.isCompleted ?? false,
        completedAt: uc?.completedAt ?? null,
        expiresAt: c.expiresAt ?? null,
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/complete", requireAuth, async (req: AuthRequest, res) => {
  try {
    const challengeId = Number(req.params.id);
    const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, challengeId)).limit(1);
    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }
    const existing = await db.select().from(userChallengesTable)
      .where(and(eq(userChallengesTable.userId, req.userId!), eq(userChallengesTable.challengeId, challengeId)))
      .limit(1);
    if (existing.length > 0 && existing[0].isCompleted) {
      res.json({
        challenge: { ...challenge, isCompleted: true, completedAt: existing[0].completedAt, expiresAt: challenge.expiresAt ?? null },
        xpEarned: 0,
        leveledUp: false,
        newLevel: null,
      });
      return;
    }
    const now = new Date().toISOString();
    if (existing.length > 0) {
      await db.update(userChallengesTable).set({ isCompleted: true, completedAt: now })
        .where(and(eq(userChallengesTable.userId, req.userId!), eq(userChallengesTable.challengeId, challengeId)));
    } else {
      await db.insert(userChallengesTable).values({ userId: req.userId!, challengeId, isCompleted: true, completedAt: now });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    const newXp = user.xp + challenge.xpReward;
    const newLevel = Math.floor(newXp / 500) + 1;
    const leveledUp = newLevel > user.level;
    await db.update(usersTable).set({ xp: newXp, level: newLevel }).where(eq(usersTable.id, req.userId!));
    res.json({
      challenge: { ...challenge, isCompleted: true, completedAt: now, expiresAt: challenge.expiresAt ?? null },
      xpEarned: challenge.xpReward,
      leveledUp,
      newLevel: leveledUp ? newLevel : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
