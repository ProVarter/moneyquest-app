import { Router } from "express";
import { db, achievementsTable, userAchievementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const achievements = await db.select().from(achievementsTable);
    const userAchievements = await db.select().from(userAchievementsTable).where(eq(userAchievementsTable.userId, req.userId!));
    const uaMap = new Map(userAchievements.map(ua => [ua.achievementId, ua]));
    const result = achievements.map(a => {
      const ua = uaMap.get(a.id);
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        category: a.category,
        isUnlocked: !!ua,
        unlockedAt: ua?.unlockedAt ?? null,
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
