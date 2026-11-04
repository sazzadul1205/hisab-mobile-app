import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext";

export function BootScreen() {
  return (
    <div className="min-h-dvh bg-(--bg) flex flex-col items-center justify-center">
      {/* Pulsing Brand Icon */}
      <div
        className="w-20 h-20 rounded-3xl grid place-items-center bg-(--brand) text-white shadow-xl mb-6"
        style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
      >
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current">
          {/* The taka symbol path */}
          <path
            d="M7 4v16M12 8h4a3 3 0 0 1 0 6h-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Loading text */}
      <div className="text-[13px] font-semibold tracking-widest text-(--muted) uppercase animate-pulse">
        Securing Data
      </div>
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
