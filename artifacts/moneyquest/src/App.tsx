function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "#f8fafc",
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "12px" }}>
        MoneyQuest Debug Screen
      </h1>
      <p style={{ fontSize: "18px", maxWidth: "700px" }}>
        If you can see this page, Vercel deployment works and the white screen is
        caused by the app logic inside the original App.tsx.
      </p>
    </div>
  );
}

export default App;
