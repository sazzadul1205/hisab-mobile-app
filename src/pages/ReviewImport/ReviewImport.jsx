import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Chip, ChipStrip } from "../../components/Chip";
import { StatusPill } from "../../components/StatusPill";
import { Note } from "../../components/Note";
import { Button, ButtonRow } from "../../components/Button";
import { BootScreen } from "../../auth/RouteGuards";
import { useCategories } from "../../hooks/useTransactions";
import { commitImport } from "../../services/importCommit";
import { formatBDT } from "../../lib/money";
import { logger } from "../../lib/logger";

/* ================================================================
   Row
   ================================================================ */
const AMOUNT_COLOR = {
  in: "text-(--in)",
  out: "text-(--out)",
};

function ImportCheckbox({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      aria-label={checked ? "Exclude row" : "Include row"}
      className={
        "w-4.75 h-4.75 rounded-md flex-none mt-0.5 flex items-center justify-center " +
        (disabled
          ? "bg-(--app) border border-dashed border-[#C9D4CF] opacity-60 cursor-not-allowed"
          : checked
            ? "bg-(--brand) border border-(--brand) cursor-pointer"
            : "bg-(--card) border border-[#C9D4CF] cursor-pointer")
      }
    >
      {checked && !disabled && (
        <svg
          viewBox="0 0 24 24"
          className="w-2.75 h-2.75 stroke-white fill-none stroke-3 [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

function ImportRow({ row, categories, onChange }) {
  const isInvalid = row.status === "invalid";
  const isDuplicate = row.status === "duplicate";
  const needsCat = row.status === "needs-category";

  const amountClass = AMOUNT_COLOR[row.direction] ?? "text-(--ink)";
  const amountStr = isInvalid
    ? "—"
    : row.direction === "in"
      ? `+${formatBDT(row.amount)}`
      : `−${formatBDT(row.amount)}`;

  const dateStr = row.date
    ? format(new Date(row.date), "d MMM yyyy · h:mm a")
    : "—";

  const cat = categories.find((c) => c.id === row.categoryId);

  const tags = [];
  if (isInvalid) {
    tags.push({ tone: "danger", label: "Invalid" });
  } else if (isDuplicate) {
    tags.push({ tone: "warn", label: "Possible duplicate" });
  } else if (needsCat) {
    tags.push({ tone: "warn", label: "Choose category" });
  } else {
    tags.push({
      tone: "ok",
      label: `${row.direction === "in" ? "Income" : "Expense"} · mapped`,
    });
  }
  if (!isInvalid && cat) tags.push({ tone: "neutral", label: cat.name });

  return (
    <div className="flex items-start gap-2.75 py-3 border-b border-(--line-2) last:border-b-0">
      <ImportCheckbox
        checked={row.included}
        disabled={isInvalid}
        onChange={() => onChange({ included: !row.included })}
      />

      <div className="flex-1 min-w-0">
        <b
          className={
            "block text-[13px] font-semibold tracking-[-0.1px] " +
            (isInvalid ? "text-(--muted)" : "text-(--ink)")
          }
        >
          {row.description || "(no description)"}
        </b>
        <small
          className={
            "block text-[11.5px] mt-0.75 " +
            (isInvalid ? "text-(--out)" : "text-(--muted)")
          }
        >
          {row.error ? row.error : dateStr}
        </small>

        <div className="flex flex-wrap gap-1.5 mt-1.75">
          {tags.map((t, i) => (
            <StatusPill key={i} tone={t.tone}>
              {t.label}
            </StatusPill>
          ))}
        </div>

        {needsCat && !isInvalid && (
          <select
            value={row.categoryId ?? ""}
            onChange={(e) => onChange({ categoryId: e.target.value || null })}
            className="mt-2 w-full bg-(--card) border border-(--line)
                       rounded-[10px] px-2.5 py-1.5 text-[12px]
                       text-(--ink) font-[inherit] outline-none
                       focus:border-(--brand)"
          >
            <option value="">Choose category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        className={
          "text-[13px] font-bold num whitespace-nowrap mt-0.5 tracking-[-0.2px] " +
          (isInvalid ? "text-(--muted)" : amountClass)
        }
      >
        {amountStr}
      </div>
    </div>
  );
}

/* ================================================================
   Page
   ================================================================ */
export default function ReviewImport() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = location.state ?? null;

  /* ---------- ALL HOOKS FIRST (no early returns above this line) ---------- */
  const { categories: allCategories, loading: catLoading } = useCategories();

  const [rows, setRows] = useState(() => initial?.rows ?? []);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => {
    if (filter === "needs-review") {
      return rows.filter(
        (r) =>
          r.status === "duplicate" ||
          r.status === "needs-category" ||
          r.status === "invalid",
      );
    }
    if (filter === "included") return rows.filter((r) => r.included);
    return rows;
  }, [rows, filter]);

  const summary = useMemo(
    () => ({
      parsed: rows.length,
      flagged: rows.filter(
        (r) => r.status === "duplicate" || r.status === "needs-category",
      ).length,
      invalid: rows.filter((r) => r.status === "invalid").length,
    }),
    [rows],
  );

  const categoriesByDirection = useMemo(
    () => ({
      in: allCategories.filter((c) => c.type === "income"),
      out: allCategories.filter((c) => c.type === "expense"),
    }),
    [allCategories],
  );

  /* ---------- Guards ---------- */
  if (!initial) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="Review import" />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">
              Nothing to review
            </b>
            <small className="block text-[12px] text-(--muted) mb-4">
              Choose a file to start an import.
            </small>
            <Button onClick={() => navigate("/import", { replace: true })}>
              Back to import
            </Button>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  if (catLoading) return <BootScreen />;

  /* ---------- Derived, non-hook ---------- */
  const includedRows = rows.filter((r) => r.included && r.categoryId);
  const includedCount = includedRows.length;

  /* ---------- Handlers ---------- */
  const updateRow = (id, patch) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch };
        if (patch.categoryId && r.status === "needs-category") {
          merged.status = "ok";
          merged.included = true;
        }
        if (patch.categoryId === null && r.status === "ok") {
          merged.status = "needs-category";
          merged.included = false;
        }
        return merged;
      }),
    );
  };

  const handleSave = async () => {
    setError("");
    if (includedCount === 0) {
      setError("Include at least one row with a category.");
      return;
    }
    setSaving(true);
    try {
      await commitImport({
        rows: includedRows,
        accountId: initial.accountId,
      });
      navigate("/transactions", { replace: true });
    } catch (err) {
      logger.error(err);
      setError("Could not save. Try again.");
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="Review import"
          subtitle={`${initial.formatName} statement → ${initial.fileName}`}
        />

        <div className="grid grid-cols-3 bg-(--card) border border-(--line) rounded-[14px] overflow-hidden mb-3.5">
          {[
            { label: "Parsed", value: summary.parsed, cls: "text-(--ink)" },
            { label: "Flagged", value: summary.flagged, cls: "text-(--warn)" },
            { label: "Invalid", value: summary.invalid, cls: "text-(--out)" },
          ].map(({ label, value, cls }, i, arr) => (
            <div
              key={label}
              className={
                "text-center py-3.25 px-2 " +
                (i < arr.length - 1 ? "border-r border-(--line-2)" : "")
              }
            >
              <b
                className={
                  "block text-[17px] font-bold tracking-[-0.4px] num " + cls
                }
              >
                {value}
              </b>
              <small className="block text-[10.5px] text-(--muted) mt-0.75 font-semibold uppercase tracking-wider">
                {label}
              </small>
            </div>
          ))}
        </div>

        <ChipStrip>
          <Chip on={filter === "all"} onClick={() => setFilter("all")}>
            All {rows.length}
          </Chip>
          <Chip
            on={filter === "needs-review"}
            onClick={() => setFilter("needs-review")}
          >
            Needs review {summary.flagged + summary.invalid}
          </Chip>
          <Chip
            on={filter === "included"}
            onClick={() => setFilter("included")}
          >
            Included {includedCount}
          </Chip>
        </ChipStrip>

        <div className="bg-(--card) border border-(--line) rounded-[18px] py-1 px-3.5 mt-3">
          {filteredRows.length === 0 && (
            <div className="text-center py-6 text-[12px] text-(--muted)">
              No rows match this filter.
            </div>
          )}
          {filteredRows.map((row) => (
            <ImportRow
              key={row.id}
              row={row}
              categories={categoriesByDirection[row.direction] ?? []}
              onChange={(patch) => updateRow(row.id, patch)}
            />
          ))}
        </div>

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mt-3 text-center">
            {error}
          </div>
        )}

        <Note>
          <b className="text-(--ink-2) font-semibold">Safety:</b> parsed rows
          live in memory only. Cancel or failure leaves zero partial
          transactions in local storage.
        </Note>
      </ScrollArea>

      <div
        className="flex-none px-4.5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        <ButtonRow>
          <Button
            variant="secondary"
            className="flex-[0_0_34%]"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || includedCount === 0}>
            {saving ? "Saving…" : `Confirm import · ${includedCount}`}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
