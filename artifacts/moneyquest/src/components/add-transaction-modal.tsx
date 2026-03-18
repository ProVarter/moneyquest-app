import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTransaction, getGetTransactionsQueryKey, getGetDashboardInsightsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string(),
  isRecurring: z.boolean().default(false),
});

const CATEGORIES = {
  expense: ["Housing", "Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Bills", "Subscriptions", "Other"],
  income: ["Salary", "Freelance", "Investment", "Gift", "Refund", "Other"]
};

export function AddTransactionModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: undefined,
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
    },
  });

  const type = form.watch("type");

  const createMutation = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardInsightsQueryKey() });
        toast({ title: "Transaction added! +10 XP 🌟" });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Error adding transaction", variant: "destructive" });
      }
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate({ data: values });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform absolute bottom-24 right-6 z-40 bg-gradient-to-br from-primary to-accent text-primary-foreground border-2 border-white/20">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 border-none glass-panel">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">New Transaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            
            <div className="grid grid-cols-2 gap-3 p-1 bg-secondary rounded-xl">
              <button
                type="button"
                onClick={() => { form.setValue("type", "expense"); form.setValue("category", ""); }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  type === "expense" ? "bg-white shadow-sm text-destructive" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowDownCircle className="w-4 h-4" /> Expense
              </button>
              <button
                type="button"
                onClick={() => { form.setValue("type", "income"); form.setValue("category", ""); }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  type === "income" ? "bg-white shadow-sm text-emerald-500" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowUpCircle className="w-4 h-4" /> Income
              </button>
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground font-display">$</span>
                      <Input type="number" step="0.01" className="pl-9 h-14 text-2xl font-display font-bold rounded-xl" placeholder="0.00" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES[type].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-12 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-xl" placeholder="What was this for?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm bg-card">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring</FormLabel>
                    <p className="text-xs text-muted-foreground">Happens every month</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-lg rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Add Transaction"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
