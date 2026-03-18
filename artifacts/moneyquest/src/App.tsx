import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/home";

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: 700,
          fontSize: "20px",
          background: "#ffffff",
        }}
      >
        MoneyQuest
      </header>

      <main style={{ padding: "24px" }}>{children}</main>
    </div>
  );
}

function WrappedHome() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}

function NotFoundPage() {
  return (
    <Layout>
      <h1>404</h1>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={WrappedHome} />
        <Route component={NotFoundPage} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;
