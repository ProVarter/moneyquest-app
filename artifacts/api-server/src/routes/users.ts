import { Router } from "express";
import { db, usersTable, userSettingsTable, userChallengesTable, userAchievementsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [settings] = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, req.userId!)).limit(1);
    if (!settings) {
      const [newSettings] = await db.insert(userSettingsTable).values({ userId: req.userId! }).returning();
      res.json(newSettings);
      return;
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { language, currency, theme, financialGoal, notificationsEnabled, weeklyReportEnabled } = req.body;
    const updates: Record<string, unknown> = {};
    if (language !== undefined) updates.language = language;
    if (currency !== undefined) updates.currency = currency;
    if (theme !== undefined) updates.theme = theme;
    if (financialGoal !== undefined) updates.financialGoal = financialGoal;
    if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;
    if (weeklyReportEnabled !== undefined) updates.weeklyReportEnabled = weeklyReportEnabled;
    const [updated] = await db.update(userSettingsTable).set(updates).where(eq(userSettingsTable.userId, req.userId!)).returning();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const xpToNextLevel = user.level * 500;
    const [challengeCount] = await db.select({ count: count() }).from(userChallengesTable)
      .where(eq(userChallengesTable.userId, req.userId!));
    const [achievementCount] = await db.select({ count: count() }).from(userAchievementsTable)
      .where(eq(userAchievementsTable.userId, req.userId!));
    const financialHealthScore = Math.min(100, Math.floor(user.xp / 10) + user.streak * 2);
    res.json({
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      xpToNextLevel,
      totalChallengesCompleted: Number(challengeCount.count),
      totalAchievements: Number(achievementCount.count),
      financialHealthScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
