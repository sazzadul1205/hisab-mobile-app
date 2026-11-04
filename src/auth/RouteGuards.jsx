import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext";

export function BootScreen() {
  return (
    <div className="min-h-dvh bg-(--bg) flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-[3px] border-(--line)
                   border-t-(--brand) animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

/* Wraps every financial page */
export function RequireAuth() {
  const { status } = useAuth();
  if (status === "booting") return <BootScreen />;
  if (status === "no-vault") return <Navigate to="/welcome" replace />;
  if (status === "locked") return <Navigate to="/unlock" replace />;
  return <Outlet />;
}

/* Wraps /welcome — only reachable if no vault exists */
export function RequireNoVault() {
  const { status } = useAuth();
  if (status === "booting") return <BootScreen />;
  if (status === "unlocked") return <Navigate to="/dashboard" replace />;
  if (status === "locked") return <Navigate to="/unlock" replace />;
  return <Outlet />;
}

/* Wraps /unlock — only reachable if a vault exists and is locked */
export function RequireVaultLocked() {
  const { status } = useAuth();
  if (status === "booting") return <BootScreen />;
  if (status === "no-vault") return <Navigate to="/welcome" replace />;
  if (status === "unlocked") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/* `/` — smart redirect */
export function RootRedirect() {
  const { status } = useAuth();
  if (status === "booting") return <BootScreen />;
  if (status === "no-vault") return <Navigate to="/welcome" replace />;
  if (status === "locked") return <Navigate to="/unlock" replace />;
  return <Navigate to="/dashboard" replace />;
}
