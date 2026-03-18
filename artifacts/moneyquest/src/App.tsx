import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { Layout } from "@/components/layout";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import "./lib/i18n";

import AuthPage from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import Transactions from "@/pages/transactions";
import Goals from "@/pages/goals";
import Insights from "@/pages/insights";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Patch fetch to automatically attach JWT token for orval hooks
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const token = localStorage.getItem('mq_token');
    if (token) {
      init = init || {};
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${token}`
      };
    }
  }
  return originalFetch(input, init);
};

function ProtectedRoutes() {
  return (
    <AuthGuard>
      <Layout>
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/goals" component={Goals} />
            <Route path="/insights" component={Insights} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </AnimatePresence>
      </Layout>
    </AuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/:rest*">
        <ProtectedRoutes />
      </Route>
    </Switch>
  );
}

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
