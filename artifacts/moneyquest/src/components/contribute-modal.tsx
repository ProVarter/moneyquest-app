import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContributeToGoal, getGetGoalsQueryKey, getGetDashboardInsightsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

const formSchema = z.object({
  amount: z.coerce.number().positive("Must be positive"),
});

export function ContributeModal({ goal, open, onOpenChange }: { goal: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: undefined },
  });

  const contributeMutation = useContributeToGoal({
    mutation: {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardInsightsQueryKey() });
        
        if (res.status === "completed") {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          toast({ title: "Goal Completed! 🏆", description: "You are a financial hero!" });
        } else {
          toast({ title: "Funds added! 💰", description: "Closer to the target!" });
        }
        
        onOpenChange(false);
        form.reset();
      }
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    contributeMutation.mutate({ id: goal.id, data: values });
  }

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-3xl p-6 border-none glass-panel">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center mb-2">
            Add to {goal.icon} {goal.title}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground font-display">$</span>
                      <Input type="number" step="0.01" className="pl-9 h-16 text-3xl font-display font-bold rounded-2xl text-center" placeholder="0.00" autoFocus {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2 py-2">
              {[50, 100, 500].map(amt => (
                <Button 
                  key={amt} 
                  type="button" 
                  variant="outline" 
                  className="rounded-xl border-border/50 bg-secondary/50 font-bold"
                  onClick={() => form.setValue("amount", amt)}
                >
                  +${amt}
                </Button>
              ))}
            </div>

            <Button type="submit" className="w-full h-14 text-lg rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 mt-2" disabled={contributeMutation.isPending}>
              {contributeMutation.isPending ? "Processing..." : "Fund Goal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
