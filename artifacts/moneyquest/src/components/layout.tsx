import { useLocation, Link } from "wouter";
import { Home, ListOrdered, Target, BarChart3, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/transactions", icon: ListOrdered, label: "Activity" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/profile", icon: UserIcon, label: "Profile" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative w-full overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[80px]" />
      </div>

      <main className="flex-1 relative z-10 w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
        <nav className="w-full max-w-md bg-card/80 backdrop-blur-xl border-t border-border/50 px-6 py-3 flex justify-between items-center shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className="relative group p-2">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300",
                    isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 -translate-y-2" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-300",
                    isActive ? "text-primary opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
