import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateGoal, getGetGoalsQueryKey, getGetDashboardInsightsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z.string().default("🎯"),
  targetAmount: z.coerce.number().positive("Must be positive"),
  currentAmount: z.coerce.number().min(0).default(0),
  monthlyContribution: z.coerce.number().optional(),
});

export function AddGoalModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", icon: "🎯", targetAmount: undefined, currentAmount: 0, monthlyContribution: undefined },
  });

  const createMutation = useCreateGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardInsightsQueryKey() });
        toast({ title: "Goal created! New Quest Started 🗺️" });
        setOpen(false);
        form.reset();
      }
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate({ data: values });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
          <Target className="w-5 h-5 mr-2" /> Start New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 border-none glass-panel">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">New Goal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="w-20">
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input className="h-12 rounded-xl text-center text-xl" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Quest Name</FormLabel>
                    <FormControl>
                      <Input className="h-12 rounded-xl" placeholder="e.g. Dream Vacation" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <Input type="number" className="h-12 rounded-xl font-bold" placeholder="10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Saved</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-xl" placeholder="0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Plan</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-xl" placeholder="500" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg rounded-xl font-bold bg-primary mt-2" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
