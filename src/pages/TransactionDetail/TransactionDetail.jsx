import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { StatusPill } from "../../components/StatusPill";
import { Button } from "../../components/Button";
import { Note } from "../../components/Note";
import { BootScreen } from "../../auth/RouteGuards";
import { useTransaction, useLookup } from "../../hooks/useTransactions";
import { deleteTransaction } from "../../services/transactions";
import { formatBDT } from "../../lib/money";

const HERO_META = {
  transfer: {
    tone: "tr",
    label: "Transfer",
    bg: "bg-(--tr-soft)",
    fg: "text-(--tr)",
    icon: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
    prefix: "",
    amountClass: "text-(--ink)",
  },
  income: {
    tone: "in",
    label: "Income",
    bg: "bg-(--in-soft)",
    fg: "text-(--in)",
    icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
    prefix: "+",
    amountClass: "text-(--in)",
  },
  expense: {
    tone: "out",
    label: "Expense",
    bg: "bg-(--out-soft)",
    fg: "text-(--out)",
    icon: (
      <>
        <path d="M5 12h14" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    prefix: "−",
    amountClass: "text-(--out)",
  },
};

function DetailField({ label, value, valueClass = "" }) {
  return (
    <div>
      <div className="text-[11px] text-(--muted) font-semibold uppercase tracking-wider">
        {label}
      </div>
      <div className={`font-bold mt-1 ${valueClass}`}>{value}</div>
    </div>
  );
}

function DeleteModal({ onCancel, onConfirm, busy, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-94.5 bg-(--card) rounded-[20px] p-5 shadow-2xl">
        <div className="w-12 h-12 rounded-[14px] mx-auto mb-4 grid place-items-center bg-(--danger-soft) text-(--danger)">
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
          </svg>
        </div>
        <h3 className="m-0 mb-2 text-center text-[17px] font-bold tracking-[-0.3px]">
          Delete this transaction?
        </h3>
        <p className="m-0 mb-4 text-center text-[12.5px] text-(--muted) leading-[1.55]">
          This will remove the transaction and update all affected account
          balances.
        </p>
        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            className="flex-[0_0_40%]"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transaction, loading } = useTransaction(id);
  const { accountMap, categoryMap, loading: lookupLoading } = useLookup();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (loading || lookupLoading) return <BootScreen />;

  if (!transaction) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="Transaction" />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">Not found</b>
            <small className="block text-[12px] text-(--muted) mb-4">
              This transaction may have been deleted.
            </small>
            <Button onClick={() => navigate("/transactions")}>
              Back to transactions
            </Button>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  const meta = HERO_META[transaction.type] ?? HERO_META.transfer;
  const hasFee = transaction.fee != null && transaction.fee > 0;
  const sourceName = accountMap.get(transaction.accountId)?.name ?? "—";
  const destName =
    accountMap.get(transaction.destinationAccountId)?.name ?? "—";
  const categoryName = categoryMap.get(transaction.categoryId)?.name ?? "—";
  const totalDebit = transaction.amount + (transaction.fee ?? 0);

  const handleDelete = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteTransaction(id);
      navigate("/transactions", { replace: true });
    } catch (err) {
      console.error(err);
      setDeleteError("Could not delete. Try again.");
      setDeleting(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="Transaction"
          right={
            <IconButton
              label="Edit"
              icon={
                <>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </>
              }
              onClick={() => navigate(`/transactions/${id}/edit`)}
            />
          }
        />

        <div className="bg-(--card) border border-(--line) rounded-[18px] shadow-[0_1px_2px_rgba(14,26,22,0.06)] text-center p-5.5 px-4">
          <div
            className={`w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center ${meta.bg} ${meta.fg}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
            >
              {meta.icon}
            </svg>
          </div>
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          <div
            className={`text-[28px] font-bold tracking-[-0.8px] num mt-2.5 ${meta.amountClass}`}
          >
            {meta.prefix}
            {formatBDT(transaction.amount)}
          </div>
          <div className="text-[12px] text-(--muted) mt-1">
            {format(new Date(transaction.date), "d MMM yyyy · h:mm a")}
          </div>
        </div>

        <div className="bg-(--card) border border-(--line) rounded-[18px] shadow-[0_1px_2px_rgba(14,26,22,0.06)] p-4 mt-3">
          {transaction.type === "transfer" ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <DetailField label="From" value={sourceName} />
                <DetailField label="To" value={destName} />
              </div>
              {hasFee && (
                <>
                  <div className="h-px bg-(--line-2) my-3.5" />
                  <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                    <DetailField
                      label="Fee"
                      value={formatBDT(transaction.fee)}
                      valueClass="text-(--out) num"
                    />
                    <DetailField
                      label="Total debit"
                      value={formatBDT(totalDebit)}
                      valueClass="num"
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              <DetailField
                label={transaction.type === "income" ? "To" : "From"}
                value={sourceName}
              />
              <DetailField label="Category" value={categoryName} />
            </div>
          )}

          <div className="h-px bg-(--line-2) my-3.5" />
          <div className="text-[12.5px] leading-[1.6]">
            <span className="text-(--muted)">Note:</span>{" "}
            {transaction.note || <span className="text-(--muted)">—</span>}
          </div>

          <div className="h-px bg-(--line-2) my-3.5" />
          <div className="grid grid-cols-2 gap-3 text-[11.5px] text-(--muted)">
            <div>
              Created:{" "}
              {format(new Date(transaction.createdAt), "d MMM · h:mm a")}
            </div>
            <div>
              Updated:{" "}
              {format(new Date(transaction.updatedAt), "d MMM · h:mm a")}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 mt-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/transactions/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            className="text-(--danger)"
            onClick={() => {
              setDeleteError("");
              setConfirmDelete(true);
            }}
          >
            Delete
          </Button>
        </div>

        <Note>
          Deleting a transaction updates every affected balance. Transfers
          restore both source and destination accounts to their pre-transfer
          state.
        </Note>
      </ScrollArea>

      {confirmDelete && (
        <DeleteModal
          busy={deleting}
          error={deleteError}
          onCancel={() => {
            if (deleting) return;
            setConfirmDelete(false);
          }}
          onConfirm={handleDelete}
        />
      )}
    </PhoneFrame>
  );
}
