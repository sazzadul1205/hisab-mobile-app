import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WelcomePin from "./pages/WelcomePin/WelcomePin";
import Unlock from "./pages/Unlock/Unlock";
import Security from "./pages/Security/Security";
import Dashboard from "./pages/Dashboard/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomePin />} />
        <Route path="/unlock" element={<Unlock />} />
        <Route path="/security" element={<Security />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
