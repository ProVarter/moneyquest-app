import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { Coins, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

const STEPS = [
  {
    title: "Welcome to MoneyQuest! 🎮",
    desc: "Your financial journey is an epic adventure. Let's set up your character profile.",
    icon: Coins,
  },
  {
    title: "What's your primary goal? 🎯",
    desc: "Every hero needs a quest. What are you fighting for?",
    icon: Target,
    options: ["Save for a house", "Pay off debt", "Build emergency fund", "Invest for future"]
  },
  {
    title: "Ready to Level Up? 🌟",
    desc: "Track your spending, earn XP, complete challenges, and unlock achievements.",
    icon: TrendingUp,
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b']
      });
      setTimeout(() => setLocation("/"), 1500);
    }
  };

  const CurrentStep = STEPS[step];
  const Icon = CurrentStep.icon;

  return (
    <PageTransition className="flex items-center justify-center bg-background min-h-screen relative p-6">
      
      <div className="w-full max-w-sm glass-panel p-8 rounded-[2rem] text-center relative z-10 overflow-hidden shadow-2xl border-white/50">
        <div className="absolute top-0 left-0 w-full h-2 bg-secondary">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center py-6"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Icon className="w-10 h-10 text-primary" />
            </div>
            
            <h2 className="text-2xl font-display font-bold mb-3">{CurrentStep.title}</h2>
            <p className="text-muted-foreground mb-8">{CurrentStep.desc}</p>
            
            {CurrentStep.options && (
              <div className="w-full flex flex-col gap-3 mb-8">
                {CurrentStep.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelectedGoal(opt)}
                    className={`p-4 rounded-xl border-2 text-left font-semibold transition-all ${
                      selectedGoal === opt 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {opt}
                      {selectedGoal === opt && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <Button 
              onClick={handleNext} 
              className="w-full h-14 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              disabled={CurrentStep.options && !selectedGoal}
            >
              {step === STEPS.length - 1 ? "Start Adventure" : "Continue"}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
