import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WelcomePin from "./pages/WelcomePin/WelcomePin";
import Unlock from "./pages/Unlock/Unlock";
import Security from "./pages/Security/Security";
import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts/Accounts";
import AddAccount from "./pages/AddAccount/AddAccount";
import AccountDetail from "./pages/AccountDetail/AccountDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomePin />} />
        <Route path="/unlock" element={<Unlock />} />
        <Route path="/security" element={<Security />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/new" element={<AddAccount />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
