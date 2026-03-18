import { useState } from "react";
import { useGetMonthlyInsights, useGetCategoryInsights, useGetAchievements } from "@workspace/api-client-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Medal, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Insights() {
  const [tab, setTab] = useState("charts");
  const { data: monthly, isLoading: loadingMonthly } = useGetMonthlyInsights({ months: 6 });
  const { data: categories, isLoading: loadingCat } = useGetCategoryInsights({});
  const { data: achievements, isLoading: loadingAch } = useGetAchievements();

  return (
    <PageTransition className="pt-6 px-4">
      <h1 className="text-2xl font-display font-bold mb-6">Codex</h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-secondary/50 mb-6 p-1">
          <TabsTrigger value="charts" className="rounded-lg text-sm font-semibold">Analytics</TabsTrigger>
          <TabsTrigger value="achievements" className="rounded-lg text-sm font-semibold">Trophies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <StaggerContainer>
            <StaggerItem>
              <Card className="rounded-2xl border-border gamified-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Cash Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 px-2">
                  {loadingMonthly ? <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(v) => { const [y,m] = v.split('-'); return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]}`; }} fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip cursor={{fill: 'hsl(var(--secondary))'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="income" name="Income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem className="mt-6">
              <Card className="rounded-2xl border-border gamified-card">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Top Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCat ? <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                      <div className="w-40 h-40 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={categories?.slice(0, 5)} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="amount" stroke="none">
                              {categories?.slice(0, 5).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 w-full space-y-3">
                        {categories?.slice(0, 5).map((c, i) => (
                          <div key={c.category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span className="font-medium text-foreground">{c.category}</span>
                            </div>
                            <span className="font-bold">{formatCurrency(c.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="achievements">
          <StaggerContainer className="grid grid-cols-2 gap-4">
            {loadingAch ? <Loader2 className="animate-spin text-primary mx-auto col-span-2 mt-10" /> : (
              achievements?.map(ach => (
                <StaggerItem key={ach.id}>
                  <div className={`p-4 rounded-2xl border-2 text-center transition-all h-full flex flex-col items-center justify-center gap-2
                    ${ach.isUnlocked 
                      ? 'bg-gradient-to-b from-accent/10 to-card border-accent/30 shadow-md shadow-accent/5' 
                      : 'bg-secondary/30 border-border/50 opacity-60 grayscale'}`
                  }>
                    <div className="text-4xl drop-shadow-md relative">
                      {ach.icon}
                      {!ach.isUnlocked && (
                        <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center backdrop-blur-[1px]">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{ach.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{ach.description}</p>
                    </div>
                    {ach.isUnlocked && (
                      <div className="bg-accent text-accent-foreground text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 mt-auto">
                        <Medal className="w-3 h-3" /> Unlocked
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </TabsContent>
      </Tabs>
      <div className="h-24" />
    </PageTransition>
  );
}
