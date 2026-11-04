import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./auth/ThemeProvider";
import { AuthProvider } from "./auth/AuthProvider";
import {
  RequireAuth,
  RequireNoVault,
  RequireVaultLocked,
  RootRedirect,
} from "./auth/RouteGuards";

import WelcomePin from "./pages/WelcomePin/WelcomePin";
import Unlock from "./pages/Unlock/Unlock";
import Security from "./pages/Security/Security";
import ChangePin from "./pages/ChangePin/ChangePin";
import AutoLock from "./pages/AutoLock/AutoLock";
import KeyInfo from "./pages/KeyInfo/KeyInfo";
import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts/Accounts";
import AddAccount from "./pages/AddAccount/AddAccount";
import AccountDetail from "./pages/AccountDetail/AccountDetail";
import ArchiveAccount from "./pages/ArchiveAccount/ArchiveAccount";
import Transactions from "./pages/Transactions/Transactions";
import AddIncome from "./pages/AddIncome/AddIncome";
import AddExpense from "./pages/AddExpense/AddExpense";
import AddTransfer from "./pages/AddTransfer/AddTransfer";
import TransactionDetail from "./pages/TransactionDetail/TransactionDetail";
import EditTransaction from "./pages/EditTransaction/EditTransaction";
import Categories from "./pages/Categories/Categories";
import AddCategory from "./pages/AddCategory/AddCategory";
import Reports from "./pages/Reports/Reports";
import ImportStatement from "./pages/ImportStatement/ImportStatement";
import ReviewImport from "./pages/ReviewImport/ReviewImport";
import Reconcile from "./pages/Reconcile/Reconcile";
import Backup from "./pages/Backup/Backup";
import Settings from "./pages/Settings/Settings";
import DeleteAll from "./pages/DeleteAll/DeleteAll";
import Export from "./pages/Export/Export";
import Storage from "./pages/Storage/Storage";
import ThemeSettings from "./pages/ThemeSettings/ThemeSettings";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Prevent the context menu (right click / long press)
    const handleContextMenu = (e) => {
      // Check if the user is trying to paste into an input field
      const isInput =
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.closest("input") ||
        e.target.closest("textarea");

      if (isInput) {
        return; // Allow default behavior for inputs
      }

      e.preventDefault(); // Block it everywhere else
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route element={<RequireNoVault />}>
              <Route path="/welcome" element={<WelcomePin />} />
            </Route>

            <Route element={<RequireVaultLocked />}>
              <Route path="/unlock" element={<Unlock />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/new" element={<AddAccount />} />
              <Route path="/accounts/:id" element={<AccountDetail />} />
              <Route
                path="/accounts/:id/edit"
                element={<AddAccount mode="edit" />}
              />
              <Route path="/accounts/:id/reconcile" element={<Reconcile />} />
              <Route
                path="/accounts/:id/archive"
                element={<ArchiveAccount />}
              />

              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:id" element={<TransactionDetail />} />
              <Route
                path="/transactions/:id/edit"
                element={<EditTransaction />}
              />

              <Route path="/income/new" element={<AddIncome />} />
              <Route path="/expense/new" element={<AddExpense />} />
              <Route path="/transfer/new" element={<AddTransfer />} />

              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/new" element={<AddCategory />} />
              <Route
                path="/categories/:id/edit"
                element={<AddCategory mode="edit" />}
              />

              <Route path="/reports" element={<Reports />} />
              <Route path="/import" element={<ImportStatement />} />
              <Route path="/import/review" element={<ReviewImport />} />

              <Route path="/backup" element={<Backup />} />
              <Route path="/security" element={<Security />} />
              <Route path="/security/change-pin" element={<ChangePin />} />
              <Route path="/security/auto-lock" element={<AutoLock />} />
              <Route path="/security/key-info" element={<KeyInfo />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/export" element={<Export />} />
              <Route path="/settings/storage" element={<Storage />} />

              {/* Add the new theme route */}
              <Route path="/settings/theme" element={<ThemeSettings />} />

              <Route path="/delete-all" element={<DeleteAll />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
