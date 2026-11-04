import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { PinKeypad } from "../../components/PinKeypad";
import { useAuth } from "../../auth/authContext";
import { InvalidPinError } from "../../crypto/vault";
import { PIN_LENGTH } from "../../constants/app";

const STEPS = {
  verify: {
    title: "Enter your current PIN",
    subtitle: "Verify it's you before changing the PIN.",
    busyLabel: "Verifying…",
  },
  new: {
    title: "Choose a new PIN",
    subtitle: `Enter ${PIN_LENGTH} digits. Pick something you'll remember.`,
    busyLabel: "",
  },
  confirm: {
    title: "Confirm new PIN",
    subtitle: "Enter the same digits to confirm.",
    busyLabel: "Saving…",
  },
};

export default function ChangePin() {
  const navigate = useNavigate();
  const { verifyPin, applyNewPin } = useAuth();

  const [step, setStep] = useState("verify");
  const [digits, setDigits] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const meta = STEPS[step];

  const handleDigit = async (d) => {
    if (loading || digits.length >= PIN_LENGTH) return;
    const next = digits + d;
    setDigits(next);
    setError("");
    if (next.length === PIN_LENGTH) {
      await advance(next);
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setDigits((s) => s.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    if (loading) return;
    setDigits("");
    setError("");
  };

  const advance = async (pin) => {
    if (step === "verify") {
      setLoading(true);
      try {
        await verifyPin(pin);
        setDigits("");
        setStep("new");
      } catch (err) {
        if (err instanceof InvalidPinError) {
          setError("Incorrect PIN. Try again.");
        } else {
          console.error(err);
          setError("Could not verify. Try again.");
        }
        setDigits("");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === "new") {
      setNewPin(pin);
      setDigits("");
      setStep("confirm");
      return;
    }

    // confirm
    if (pin !== newPin) {
      setError("PINs don't match. Try again.");
      setDigits("");
      setNewPin("");
      setStep("new");
      return;
    }

    setLoading(true);
    try {
      await applyNewPin(pin);
      navigate("/security", { replace: true });
    } catch (err) {
      console.error(err);
      if (err.message === "Not unlocked") {
        setError("Session expired. Please unlock again.");
      } else {
        setError("Could not change PIN. Try again.");
      }
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    if (step === "confirm") {
      setStep("new");
      setNewPin("");
      setDigits("");
      return;
    }
    if (step === "new") {
      setStep("verify");
      setDigits("");
      return;
    }
    navigate(-1);
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Change PIN" />

        <div className="text-center pt-8 pb-6">
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
            {meta.title}
          </h2>
          <p className="m-0 mx-auto text-[13px] leading-[1.6] text-(--muted) max-w-[30ch]">
            {meta.subtitle}
          </p>
        </div>

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

        <div className="text-center mt-4 min-h-4.5">
          {error && (
            <span className="text-[12px] font-semibold text-(--out)">
              {error}
            </span>
          )}
          {!error && loading && meta.busyLabel && (
            <span className="text-[12px] font-semibold text-(--muted)">
              {meta.busyLabel}
            </span>
          )}
        </div>

        <div className="mt-8">
          <PinKeypad
            onDigit={handleDigit}
            onClear={handleClear}
            onBackspace={handleBackspace}
            disabled={loading}
          />
        </div>

        <div className="text-center mt-6 pb-2">
          <button
            type="button"
            onClick={goBack}
            disabled={loading}
            className="text-[12px] font-semibold text-(--muted)
                       bg-transparent border-0 cursor-pointer font-[inherit]
                       disabled:opacity-40"
          >
            {step === "verify" ? "Cancel" : "Back"}
          </button>
        </div>
      </ScrollArea>
    </PhoneFrame>
  );
}
