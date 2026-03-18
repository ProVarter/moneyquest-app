import { useState } from "react";
import { useGetGoals } from "@workspace/api-client-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { AddGoalModal } from "@/components/add-goal-modal";
import { ContributeModal } from "@/components/contribute-modal";

export default function Goals() {
  const { data: goals, isLoading } = useGetGoals();
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  return (
    <PageTransition className="pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Quests</h1>
      </div>

      <StaggerContainer className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : goals?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🗺️</div>
            <h3 className="text-lg font-bold">No Active Quests</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Set a financial goal to start your journey.</p>
            <AddGoalModal />
          </div>
        ) : (
          <>
            <AddGoalModal />
            
            {goals?.map(goal => (
              <StaggerItem key={goal.id}>
                <Card className={`rounded-[1.5rem] border-2 gamified-card overflow-hidden ${goal.status === 'completed' ? 'border-accent bg-accent/5' : 'border-border'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl shadow-inner border border-white/50">
                          {goal.icon || '🎯'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{goal.title}</h3>
                          <p className="text-xs font-semibold text-primary mt-0.5">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                      </div>
                      {goal.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary text-xs font-bold"
                          onClick={() => setSelectedGoal(goal)}
                        >
                          Fund <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>

                    <div className="relative h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner mb-2">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${goal.status === 'completed' ? 'bg-accent' : 'bg-primary'}`}
                        style={{ width: `${goal.progressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBsNDAtNDBIMjBMtMjAgMjB6TTQwIDBMMCA0MGgyMGw0MC00MHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-20" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-muted-foreground">{goal.progressPercentage}% Complete</span>
                      {goal.projectedCompletionDate && goal.status !== 'completed' && (
                        <span className="text-muted-foreground">Est. {new Date(goal.projectedCompletionDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                      )}
                      {goal.status === 'completed' && <span className="text-accent font-bold">Quest Completed! 🏆</span>}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </>
        )}
      </StaggerContainer>

      <ContributeModal goal={selectedGoal} open={!!selectedGoal} onOpenChange={(open) => !open && setSelectedGoal(null)} />
      <div className="h-24" />
    </PageTransition>
  );
}
