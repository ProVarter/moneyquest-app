import { Route, Switch } from "wouter";

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

function HomePage() {
  return (
    <Layout>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "12px" }}>
        Layout works ✅
      </h1>
      <p style={{ fontSize: "18px" }}>
        Routing + layout are working.
      </p>
    </Layout>
  );
}

function NotFoundPage() {
  return (
    <Layout>
      <h1 style={{ fontSize: "28px", fontWeight: 700 }}>404</h1>
    </Layout>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default App;
