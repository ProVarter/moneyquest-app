import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home works ✅</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
