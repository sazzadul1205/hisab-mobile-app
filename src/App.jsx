import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WelcomePin from "./pages/WelcomePin/WelcomePin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomePin />} />
      </Routes>
    </BrowserRouter>
  );
}
