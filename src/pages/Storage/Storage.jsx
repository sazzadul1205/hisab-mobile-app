import { useEffect, useState } from "react";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SectionLabel } from "../../components/SectionLabel";
import { Note } from "../../components/Note";
import { BootScreen } from "../../auth/RouteGuards";
import {
  getStorageEstimate,
  getTableCounts,
  formatBytes,
} from "../../services/storage";

function InfoRow({ label, value, last }) {
  return (
    <div
      className={
        "flex items-center justify-between py-2.5 " +
        (last ? "" : "border-b border-(--line-2)")
      }
    >
      <span className="text-[12px] text-(--muted)">{label}</span>
      <span className="text-[13px] font-semibold text-(--ink) num">
        {value}
      </span>
    </div>
  );
}

export default function Storage() {
  const [estimate, setEstimate] = useState(null);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [est, cnt] = await Promise.all([
        getStorageEstimate(),
        getTableCounts(),
      ]);
      if (cancelled) return;
      setEstimate(est);
      setCounts(cnt);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!estimate || !counts) return <BootScreen />;

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Storage" />

        <div className="stagger">
        <div
          className="rounded-[18px] p-5 text-white mb-3"
          style={{ background: "linear-gradient(150deg, #118A64, #0A5A41)" }}
        >
          <div className="text-[11.5px] font-semibold tracking-[0.06em] uppercase text-white/70">
            Used on this device
          </div>
          <div className="num text-[29px] font-bold tracking-[-1px] mt-1.5">
            {formatBytes(estimate.usage)}
          </div>
          {estimate.supported && estimate.quota > 0 && (
            <div className="text-[11.5px] text-white/65 mt-1">
              {estimate.percentUsed.toFixed(2)}% of{" "}
              {formatBytes(estimate.quota)} available
            </div>
          )}
        </div>

        <SectionLabel>Records</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] px-4 py-1 mb-3">
          <InfoRow label="Accounts" value={counts.accounts} />
          <InfoRow label="Transactions" value={counts.transactions} />
          <InfoRow label="Categories" value={counts.categories} />
          <InfoRow label="Reconciliations" value={counts.reconciliations} />
          <InfoRow label="Import history" value={counts.imports} last />
        </div>

        {!estimate.supported && (
          <Note>
            This browser doesn't expose storage quota information. The size
            above may include cached app assets, not just your records.
          </Note>
        )}

        {estimate.supported && (
          <Note>
            Browser storage can be evicted if space runs low. Keep an encrypted
            backup in Backup &amp; restore.
          </Note>
        )}
      </div>
      </ScrollArea>
    </PhoneFrame>
  );
}
