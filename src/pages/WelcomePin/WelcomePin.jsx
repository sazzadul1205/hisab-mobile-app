import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { PinKeypad } from "../../components/PinKeypad";
import { Button } from "../../components/Button";
import { useAuth } from "../../auth/authContext";
import { PIN_LENGTH } from "../../constants/app";

function Bullet({ icon, title, subtitle }) {
  return (
    <div className="flex gap-2.75 items-start">
      <div className="w-7.5 h-7.5 rounded-[9px] flex-none grid place-items-center bg-white border border-(--line) text-(--brand)">
        <svg
          viewBox="0 0 24 24"
          className="w-3.75 h-3.75 stroke-current fill-none stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          {icon}
        </svg>
      </div>
      <div>
        <b className="block text-[13px] font-semibold mb-0.5">{title}</b>
        <small className="text-[12px] text-(--muted) leading-normal">
          {subtitle}
        </small>
      </div>
    </div>
  );
}

export default function WelcomePin() {
  const navigate = useNavigate();
  const { setupVaultAndUnlock } = useAuth();

  const [step, setStep] = useState("enter"); // 'enter' | 'confirm'
  const [digits, setDigits] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDigit = async (d) => {
    if (loading || digits.length >= PIN_LENGTH) return;
    const next = digits + d;
    setDigits(next);
    setError("");
    if (next.length === PIN_LENGTH) {
      await handleComplete(next);
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setDigits((d) => d.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    if (loading) return;
    setDigits("");
    setError("");
  };

  const handleComplete = async (pin) => {
    if (step === "enter") {
      setFirstPin(pin);
      setDigits("");
      setStep("confirm");
      return;
    }

    if (pin !== firstPin) {
      setError("PINs don't match. Try again.");
      setDigits("");
      setFirstPin("");
      setStep("enter");
      return;
    }

    setLoading(true);
    try {
      await setupVaultAndUnlock(pin);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Vault setup failed:", err);
      setError("Setup failed. Try again.");
      setDigits("");
      setFirstPin("");
      setStep("enter");
      setLoading(false);
    }
  };

  const resetToEnter = () => {
    setStep("enter");
    setDigits("");
    setFirstPin("");
    setError("");
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        {/* Hero */}
        <div className="text-center pt-6.5 pb-5.5">
          <div className="w-16 h-16 rounded-[22px] mx-auto mb-4.5 grid place-items-center bg-(--brand-soft) text-(--brand-dk)">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h2 className="m-0 mb-2 text-[22px] font-bold tracking-[-0.5px]">
            {step === "enter" ? "Set up your PIN" : "Re-enter your PIN"}
          </h2>
          <p className="m-0 mx-auto text-[13px] leading-[1.6] text-(--muted) max-w-[30ch]">
            {step === "enter"
              ? "Choose a 6-digit PIN. It stays on this device and encrypts your records."
              : "Enter the same 6 digits to confirm."}
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-3.75 justify-center mt-6.5">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <i
              key={i}
              className={
                "block w-3.5 h-3.5 rounded-full border-[1.5px] " +
                (i < digits.length
                  ? "bg-(--brand) border-(--brand)"
                  : "bg-transparent border-[#C9D4CF]")
              }
            />
          ))}
        </div>
        <div className="text-center text-[12px] text-(--muted) mt-3.5">
          {step === "enter" ? "Enter 6 digits" : "Re-enter to confirm"}
        </div>

        {error && (
          <div className="text-center mt-4">
            <span className="text-[12px] font-semibold text-(--out)">
              {error}
            </span>
          </div>
        )}
        {loading && (
          <div className="text-center mt-4">
            <span className="text-[12px] font-semibold text-(--muted)">
              Encrypting…
            </span>
          </div>
        )}

        {/* Keypad */}
        <div className="mt-8">
          <PinKeypad
            onDigit={handleDigit}
            onClear={handleClear}
            onBackspace={handleBackspace}
            disabled={loading}
          />
        </div>

        {/* Bullets — only step 1 */}
        {step === "enter" && (
          <div className="flex flex-col gap-3 mt-6 mb-1.5">
            <Bullet
              icon={
                <>
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M3 9h18" />
                </>
              }
              title="Stored locally"
              subtitle="No account, no server, no upload."
            />
            <Bullet
              icon={<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />}
              title="Protected access"
              subtitle="PIN derives a key; it is never stored."
            />
            <Bullet
              icon={
                <>
                  <path d="M12 8v5" />
                  <circle cx="12" cy="16.5" r="1" />
                  <circle cx="12" cy="12" r="9" />
                </>
              }
              title="Keep a backup"
              subtitle="Clearing browser data can erase records."
            />
          </div>
        )}
      </ScrollArea>

      {/* Start over — only step 2 */}
      {step === "confirm" && (
        <div
          className="flex-none px-4.5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
          style={{
            background:
              "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
          }}
        >
          <Button variant="secondary" onClick={resetToEnter} disabled={loading}>
            Start over
          </Button>
        </div>
      )}
    </PhoneFrame>
  );
}
