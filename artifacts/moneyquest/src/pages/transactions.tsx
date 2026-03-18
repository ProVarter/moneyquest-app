import { useState } from "react";
import { useGetTransactions, getGetTransactionsQueryKey, useDeleteTransaction, getGetDashboardInsightsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreVertical, Trash2, Edit, ShoppingBag, Coffee, Car, Home, Receipt, ArrowUpRight, ArrowDownRight, Briefcase, Zap } from "lucide-react";
import { AddTransactionModal } from "@/components/add-transaction-modal";

const CATEGORY_ICONS: Record<string, any> = {
  "Food": Coffee,
  "Transport": Car,
  "Housing": Home,
  "Shopping": ShoppingBag,
  "Bills": Receipt,
  "Salary": Briefcase,
  "Other": Zap
};

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  
  // Real implementation would pass params to the hook
  const { data: transactions, isLoading } = useGetTransactions();
  const deleteMutation = useDeleteTransaction();
  const queryClient = useQueryClient();

  const filtered = transactions?.filter(t => {
    if (type !== "all" && t.type !== type) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardInsightsQueryKey() });
  };

  return (
    <PageTransition className="pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Activity</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-9 h-11 rounded-xl bg-card border-border/50 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[110px] h-11 rounded-xl bg-card border-border/50 shadow-sm">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StaggerContainer className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-secondary/50 rounded-2xl animate-pulse" />
          ))
        ) : filtered?.length === 0 ? (
          <div className="text-center py-12">
            <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="Empty" className="w-40 h-40 mx-auto opacity-80 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No records found</h3>
            <p className="text-sm text-muted-foreground mt-1">Start by adding your first transaction!</p>
          </div>
        ) : (
          filtered?.map((t) => {
            const Icon = CATEGORY_ICONS[t.category] || Zap;
            const isIncome = t.type === "income";
            
            return (
              <StaggerItem key={t.id}>
                <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{t.description}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {t.category} • {format(new Date(t.date), "MMM d")}
                    </p>
                  </div>
                  
                  <div className="text-right flex items-center gap-2">
                    <div className={`font-bold text-base ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem className="py-2.5">
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </StaggerItem>
            );
          })
        )}
      </StaggerContainer>

      {/* Spacer for FAB */}
      <div className="h-20" />
      <AddTransactionModal />
    </PageTransition>
  );
}
