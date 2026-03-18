import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/calculate", requireAuth, async (req, res) => {
  try {
    const { initialAmount, monthlyContribution, annualRate, years, inflationRate, yearlyIncrease } = req.body;
    if (initialAmount === undefined || monthlyContribution === undefined || !annualRate || !years) {
      res.status(400).json({ error: "initialAmount, monthlyContribution, annualRate, and years are required" });
      return;
    }
    const monthlyRate = annualRate / 100 / 12;
    const yearlyData = [];
    let balance = Number(initialAmount);
    let totalContributed = Number(initialAmount);
    let monthly = Number(monthlyContribution);

    for (let y = 1; y <= years; y++) {
      let yearContrib = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interest = balance * monthlyRate;
        balance += interest + monthly;
        yearContrib += monthly;
        yearInterest += interest;
      }
      totalContributed += yearContrib;
      yearlyData.push({
        year: y,
        balance: Math.round(balance * 100) / 100,
        contributed: Math.round(totalContributed * 100) / 100,
        interest: Math.round((balance - totalContributed) * 100) / 100,
      });
      if (yearlyIncrease) monthly *= (1 + Number(yearlyIncrease) / 100);
    }

    const futureValue = balance;
    const interestEarned = futureValue - totalContributed;
    let inflationAdjustedValue: number | null = null;
    if (inflationRate) {
      inflationAdjustedValue = futureValue / Math.pow(1 + Number(inflationRate) / 100, years);
      inflationAdjustedValue = Math.round(inflationAdjustedValue * 100) / 100;
    }

    res.json({
      futureValue: Math.round(futureValue * 100) / 100,
      totalContributed: Math.round(totalContributed * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100,
      inflationAdjustedValue,
      yearlyData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
