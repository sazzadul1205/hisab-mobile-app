import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { PinKeypad } from "../../components/PinKeypad";
import { useAuth } from "../../auth/authContext";
import { InvalidPinError } from "../../crypto/vault";
import { getThrottleState, recordFailure } from "../../auth/throttle";
import { PIN_LENGTH } from "../../constants/app";
import { logger } from "../../lib/logger";

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Unlock() {
  const navigate = useNavigate();
  const { unlockWithPin } = useAuth();

  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [throttle, setThrottle] = useState(getThrottleState());

  // Countdown ticker while locked
  useEffect(() => {
    if (!throttle.isLocked) return;
    const id = setInterval(() => setThrottle(getThrottleState()), 1000);
    return () => clearInterval(id);
  }, [throttle.isLocked]);

  const handleDigit = async (d) => {
    if (loading) return;
    if (getThrottleState().isLocked) return;
    if (digits.length >= PIN_LENGTH) return;

    const next = digits + d;
    setDigits(next);
    setError("");

    if (next.length === PIN_LENGTH) {
      await attemptUnlock(next);
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

  const attemptUnlock = async (pin) => {
    setLoading(true);
    try {
      await unlockWithPin(pin);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof InvalidPinError) {
        recordFailure();
        const t = getThrottleState();
        setThrottle(t);
        setError(t.isLocked ? "" : "Incorrect PIN");
      } else {
        logger.error("Unlock failed:", err);
        setError("Unlock failed");
      }
      setDigits("");
      setLoading(false);
    }
  };

  const isDisabled = throttle.isLocked || loading;

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        {/* Hero */}
        <div className="text-center pt-11 pb-5.5">
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
            Enter your PIN
          </h2>
          <p className="m-0 mx-auto text-[13px] leading-[1.6] text-(--muted)">
            Hisab is locked
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-3.75 justify-center">
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

        {/* Error / throttle / loading */}
        <div className="text-center mt-4 min-h-4.5">
          {throttle.isLocked && (
            <span className="text-[12px] font-semibold text-(--out)">
              Too many attempts · try again in{" "}
              {formatCountdown(throttle.secondsRemaining)}
            </span>
          )}
          {!throttle.isLocked && error && (
            <span className="text-[12px] font-semibold text-(--out)">
              {error}
            </span>
          )}
          {!throttle.isLocked && !error && loading && (
            <span className="text-[12px] font-semibold text-(--muted)">
              Verifying…
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="mt-8.5">
          <PinKeypad
            onDigit={handleDigit}
            onClear={handleClear}
            onBackspace={handleBackspace}
            disabled={isDisabled}
          />
        </div>

        <div className="text-center mt-5.5 pb-2">
          <span className="text-[12px] font-semibold text-(--muted)">
            Forgot PIN?
          </span>
        </div>
      </ScrollArea>
    </PhoneFrame>
  );
}
