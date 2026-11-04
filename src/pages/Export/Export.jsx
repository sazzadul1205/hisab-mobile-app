import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";
import { buildCsvExport } from "../../services/export";
import { formatBytes } from "../../services/storage";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Export() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");
    setDone(null);
    setBusy(true);
    try {
      const { csv, filename, counts } = await buildCsvExport();
      if (counts.transactions === 0) {
        setError("No transactions to export yet.");
        return;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      downloadBlob(blob, filename);
      setDone({ filename, size: blob.size, counts });
    } catch (err) {
      console.error(err);
      setError("Could not export. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Export data" />

        <Alert
          tone="info"
          className="mb-3.5"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title="What gets exported"
        >
          All transactions with dates, amounts, accounts, and categories, as a
          CSV file you can open in Excel, Numbers, or Google Sheets.
        </Alert>

        <Note>
          This export is plaintext CSV — for analysis, not for backup. Use
          Backup &amp; restore for encrypted recovery files.
        </Note>

        {done && (
          <Alert
            tone="ok"
            className="mt-3"
            icon={
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M9 12l2 2 4-4" />
              </>
            }
            title="Export ready"
          >
            <span className="block">{done.filename}</span>
            <span className="block mt-1">
              {done.counts.transactions} transactions · {formatBytes(done.size)}
            </span>
          </Alert>
        )}

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mt-3 text-center">
            {error}
          </div>
        )}
      </ScrollArea>

      <div
        className="flex-none px-4.5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        {done ? (
          <Button variant="secondary" onClick={() => navigate("/settings")}>
            Back to settings
          </Button>
        ) : (
          <Button onClick={handleExport} disabled={busy}>
            {busy ? "Preparing…" : "Download CSV"}
          </Button>
        )}
      </div>
    </PhoneFrame>
  );
}
