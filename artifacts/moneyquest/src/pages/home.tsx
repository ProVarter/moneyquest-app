import { useGetDashboardInsights, useCompleteChallenge, getGetDashboardInsightsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { XPBar } from "@/components/xp-bar";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUpRight, ArrowDownRight, Target, Sparkles, CheckCircle, BellRing, Coins } from "lucide-react";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export default function Home() {
  const { data, isLoading } = useGetDashboardInsights();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const completeMutation = useCompleteChallenge({
    mutation: {
      onSuccess: (res) => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast({
          title: "Challenge Completed! 🎉",
          description: `You earned ${res.xpEarned} XP! ${res.leveledUp ? 'LEVEL UP!' : ''}`,
        });
        queryClient.invalidateQueries({ queryKey: getGetDashboardInsightsQueryKey() });
      }
    }
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition className="pt-6 px-4">
      <StaggerContainer className="space-y-6">
        
        {/* Header & XP */}
        <StaggerItem>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-display font-bold">Dashboard</h1>
            <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
              <BellRing className="w-5 h-5 text-foreground" />
            </Button>
          </div>
          <XPBar level={data.level} xp={data.xp} streak={data.streak} />
        </StaggerItem>

        {/* Main Balance Card */}
        <StaggerItem>
          <div className="gamified-card bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 text-white p-6 border-none overflow-hidden relative shadow-xl shadow-primary/30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <p className="text-white/80 font-medium mb-1 flex items-center gap-2">
                <Coins className="w-4 h-4" /> Total Balance
              </p>
              <h2 className="text-4xl font-display font-black tracking-tight mb-6">
                {formatCurrency(data.totalBalance)}
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1 uppercase tracking-wider">
                    <ArrowUpCircleIcon className="w-3.5 h-3.5" /> Income
                  </div>
                  <div className="font-bold text-lg">{formatCurrency(data.incomeThisMonth)}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold mb-1 uppercase tracking-wider">
                    <ArrowDownCircleIcon className="w-3.5 h-3.5" /> Expenses
                  </div>
                  <div className="font-bold text-lg">{formatCurrency(data.expensesThisMonth)}</div>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Daily Challenge */}
        <StaggerItem>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent fill-accent" /> Daily Quest
            </h3>
          </div>
          {data.dailyChallenge ? (
            <Card className={`rounded-2xl border-2 transition-all ${data.dailyChallenge.isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-card border-border gamified-card'}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold mb-1 text-[15px]">{data.dailyChallenge.title}</h4>
                  <p className="text-xs text-muted-foreground">{data.dailyChallenge.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-accent/20 text-yellow-700 dark:text-yellow-400">+{data.dailyChallenge.xpReward} XP</span>
                  </div>
                </div>
                {data.dailyChallenge.isCompleted ? (
                  <div className="h-10 px-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" /> Done
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="rounded-xl h-10 bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all"
                    onClick={() => completeMutation.mutate({ id: data.dailyChallenge.id })}
                    disabled={completeMutation.isPending}
                  >
                    Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
             <div className="p-4 rounded-2xl bg-secondary text-center text-sm font-medium text-muted-foreground border border-border border-dashed">
               All quests completed! Come back tomorrow.
             </div>
          )}
        </StaggerItem>

        {/* Goal Progress */}
        {data.goalProgress.length > 0 && (
          <StaggerItem>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Active Goal
              </h3>
            </div>
            <Card className="rounded-2xl gamified-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">
                    {data.goalProgress[0].icon || '🎯'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">{data.goalProgress[0].title}</span>
                      <span className="text-xs font-bold text-primary">{data.goalProgress[0].progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${data.goalProgress[0].progressPercentage}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                  <span>{formatCurrency(data.goalProgress[0].currentAmount)}</span>
                  <span>{formatCurrency(data.goalProgress[0].targetAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

        {/* Smart Insights */}
        {data.smartInsights.length > 0 && (
          <StaggerItem>
            <h3 className="font-display font-bold text-lg mb-3">AI Insights</h3>
            <div className="bg-secondary/50 rounded-2xl p-4 space-y-3 border border-border">
              {data.smartInsights.slice(0, 2).map((insight, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                  <p className="text-sm font-medium text-foreground/80 leading-snug">{insight}</p>
                </div>
              ))}
            </div>
          </StaggerItem>
        )}

        {/* Spacer for FAB */}
        <div className="h-10" />
      </StaggerContainer>

      <AddTransactionModal />
    </PageTransition>
  );
}

// Inline icons for quick use
function ArrowUpCircleIcon(props: any) {
  return <ArrowUpRight {...props} />;
}
function ArrowDownCircleIcon(props: any) {
  return <ArrowDownRight {...props} />;
}
