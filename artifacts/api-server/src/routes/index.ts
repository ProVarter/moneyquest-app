import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import transactionsRouter from "./transactions.js";
import goalsRouter from "./goals.js";
import budgetsRouter from "./budgets.js";
import subscriptionsRouter from "./subscriptions.js";
import challengesRouter from "./challenges.js";
import achievementsRouter from "./achievements.js";
import insightsRouter from "./insights.js";
import savingsRouter from "./savings.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/transactions", transactionsRouter);
router.use("/goals", goalsRouter);
router.use("/budgets", budgetsRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/challenges", challengesRouter);
router.use("/achievements", achievementsRouter);
router.use("/insights", insightsRouter);
router.use("/savings", savingsRouter);

export default router;
