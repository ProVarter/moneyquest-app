import {
  db,
  usersTable,
  userSettingsTable,
  transactionsTable,
  goalsTable,
  budgetsTable,
  subscriptionsTable,
  challengesTable,
  achievementsTable,
  userChallengesTable,
  userAchievementsTable,
} from "@workspace/db";
import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.JWT_SECRET || "moneyquest-secret-key-2024";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", SECRET).update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

async function seed() {
  console.log("🌱 Seeding MoneyQuest demo data...");

  // Create demo user
  const [user] = await db.insert(usersTable).values({
    email: "demo@moneyquest.com",
    passwordHash: hashPassword("demo1234"),
    name: "Alex Johnson",
    xp: 1250,
    level: 3,
    streak: 7,
    lastLoginDate: new Date().toISOString().split("T")[0],
    isPremium: false,
  }).onConflictDoNothing().returning();

  if (!user) {
    console.log("Demo user already exists, skipping...");
    return;
  }

  const userId = user.id;

  // User settings
  await db.insert(userSettingsTable).values({
    userId,
    language: "en",
    currency: "USD",
    theme: "light",
    financialGoal: "save_money",
  }).onConflictDoNothing();

  // Transactions - last 3 months
  const now = new Date();
  const txData = [];

  // Income
  for (let m = 2; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    txData.push({
      userId,
      type: "income",
      amount: "4500.00",
      category: "Savings",
      description: "Monthly Salary",
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`,
      isRecurring: true,
      recurringPeriod: "monthly",
      tags: ["salary", "work"] as string[],
    });
    if (m === 0) {
      txData.push({
        userId,
        type: "income",
        amount: "350.00",
        category: "Other",
        description: "Freelance Project",
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-15`,
        isRecurring: false,
        tags: ["freelance"] as string[],
      });
    }

    // Expenses per month
    const expenses = [
      { amount: "1200.00", category: "Housing", description: "Rent Payment" },
      { amount: "85.50", category: "Food", description: "Grocery Shopping - Whole Foods" },
      { amount: "42.00", category: "Food", description: "Restaurant - Friday Dinner" },
      { amount: "65.00", category: "Transport", description: "Gas Station" },
      { amount: "12.99", category: "Subscriptions", description: "Netflix" },
      { amount: "9.99", category: "Subscriptions", description: "Spotify" },
      { amount: "120.00", category: "Shopping", description: "Amazon Order" },
      { amount: "35.00", category: "Entertainment", description: "Movie Tickets" },
      { amount: "45.00", category: "Health", description: "Gym Membership" },
    ];

    for (const exp of expenses) {
      const day = Math.floor(Math.random() * 25) + 1;
      txData.push({
        userId,
        type: "expense",
        amount: exp.amount,
        category: exp.category,
        description: exp.description,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        isRecurring: false,
        tags: [] as string[],
      });
    }
  }

  await db.insert(transactionsTable).values(txData);
  console.log(`✅ Created ${txData.length} transactions`);

  // Goals
  const goals = await db.insert(goalsTable).values([
    {
      userId,
      title: "Emergency Fund",
      icon: "🛟",
      targetAmount: "10000.00",
      currentAmount: "4250.00",
      monthlyContribution: "500.00",
      status: "active",
    },
    {
      userId,
      title: "Vacation to Japan",
      icon: "✈️",
      targetAmount: "3500.00",
      currentAmount: "1800.00",
      monthlyContribution: "200.00",
      deadline: "2026-08-01",
      status: "active",
    },
    {
      userId,
      title: "New Laptop",
      icon: "💻",
      targetAmount: "1500.00",
      currentAmount: "950.00",
      monthlyContribution: "150.00",
      deadline: "2026-06-01",
      status: "active",
    },
  ]).returning();
  console.log(`✅ Created ${goals.length} goals`);

  // Budgets
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  await db.insert(budgetsTable).values([
    { userId, category: "Food", monthlyLimit: "600.00", month: currentMonth, year: currentYear },
    { userId, category: "Transport", monthlyLimit: "200.00", month: currentMonth, year: currentYear },
    { userId, category: "Shopping", monthlyLimit: "300.00", month: currentMonth, year: currentYear },
    { userId, category: "Entertainment", monthlyLimit: "150.00", month: currentMonth, year: currentYear },
    { userId, category: "Health", monthlyLimit: "100.00", month: currentMonth, year: currentYear },
    { userId, category: "Subscriptions", monthlyLimit: "100.00", month: currentMonth, year: currentYear },
  ]);
  console.log("✅ Created budgets");

  // Subscriptions
  await db.insert(subscriptionsTable).values([
    { userId, name: "Netflix", amount: "15.99", billingCycle: "monthly", nextChargeDate: "2026-04-01", category: "Entertainment", isEssential: false },
    { userId, name: "Spotify", amount: "9.99", billingCycle: "monthly", nextChargeDate: "2026-04-05", category: "Entertainment", isEssential: false },
    { userId, name: "Gym Membership", amount: "45.00", billingCycle: "monthly", nextChargeDate: "2026-04-01", category: "Health", isEssential: true },
    { userId, name: "Adobe Creative Cloud", amount: "54.99", billingCycle: "monthly", nextChargeDate: "2026-04-15", category: "Education", isEssential: true },
    { userId, name: "Amazon Prime", amount: "139.00", billingCycle: "yearly", nextChargeDate: "2026-09-01", category: "Shopping", isEssential: false },
  ]);
  console.log("✅ Created subscriptions");

  // Challenges
  const challenges = await db.insert(challengesTable).values([
    { title: "No Spend Day", description: "Go an entire day without spending money on non-essentials.", xpReward: 75, type: "daily", difficulty: "easy" },
    { title: "Save $10 Today", description: "Set aside $10 extra into any savings goal today.", xpReward: 50, type: "daily", difficulty: "easy" },
    { title: "Skip One Unnecessary Purchase", description: "Identify and skip one impulse purchase today.", xpReward: 60, type: "daily", difficulty: "easy" },
    { title: "Track Every Expense", description: "Log every single expense you make today.", xpReward: 40, type: "daily", difficulty: "easy" },
    { title: "Review All Subscriptions", description: "Review all your subscriptions and identify which ones you can cancel.", xpReward: 100, type: "weekly", difficulty: "medium" },
    { title: "Stay Within Food Budget for 3 Days", description: "Keep your food spending under your daily budget limit for 3 consecutive days.", xpReward: 150, type: "weekly", difficulty: "medium" },
    { title: "Add Money to a Goal", description: "Make an extra contribution to any savings goal this week.", xpReward: 100, type: "weekly", difficulty: "easy" },
    { title: "7-Day Streak Champion", description: "Track your expenses every day for 7 days in a row.", xpReward: 250, type: "one-time", difficulty: "hard" },
    { title: "First Goal Created", description: "Create your very first savings goal.", xpReward: 100, type: "one-time", difficulty: "easy" },
    { title: "Budget Master", description: "Stay within budget in all categories for a full month.", xpReward: 500, type: "one-time", difficulty: "hard" },
  ]).returning();
  console.log(`✅ Created ${challenges.length} challenges`);

  // Mark a few challenges as completed
  await db.insert(userChallengesTable).values([
    { userId, challengeId: challenges[8].id, isCompleted: true, completedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { userId, challengeId: challenges[3].id, isCompleted: true, completedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  ]);

  // Achievements
  const achievementData = await db.insert(achievementsTable).values([
    { title: "First Steps", description: "Complete your first transaction", icon: "👣", xpReward: 50, category: "general", requirement: "first_transaction" },
    { title: "Goal Setter", description: "Create your first savings goal", icon: "🎯", xpReward: 100, category: "goals", requirement: "first_goal" },
    { title: "Streak Starter", description: "Log in 3 days in a row", icon: "🔥", xpReward: 75, category: "streak", requirement: "streak_3" },
    { title: "Week Warrior", description: "Maintain a 7-day streak", icon: "⚡", xpReward: 200, category: "streak", requirement: "streak_7" },
    { title: "Budget Pro", description: "Stay within budget for a full month", icon: "💎", xpReward: 300, category: "spending", requirement: "budget_month" },
    { title: "Saver Supreme", description: "Save over $1,000 in any goal", icon: "🏆", xpReward: 250, category: "savings", requirement: "save_1000" },
    { title: "Challenger", description: "Complete 5 challenges", icon: "🌟", xpReward: 150, category: "general", requirement: "complete_5_challenges" },
    { title: "Financial Health A+", description: "Achieve a financial health score of 90+", icon: "❤️", xpReward: 500, category: "general", requirement: "health_90" },
  ]).returning();
  console.log(`✅ Created ${achievementData.length} achievements`);

  // Unlock some achievements for demo user
  const today = new Date().toISOString().split("T")[0];
  await db.insert(userAchievementsTable).values([
    { userId, achievementId: achievementData[0].id, unlockedAt: today },
    { userId, achievementId: achievementData[1].id, unlockedAt: today },
    { userId, achievementId: achievementData[2].id, unlockedAt: today },
  ]);

  console.log("🎉 Seed complete! Demo user: demo@moneyquest.com / demo1234");
}

seed().catch(console.error).finally(() => process.exit());
