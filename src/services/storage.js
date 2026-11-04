import { db } from "../db/db";

export async function getStorageEstimate() {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (!nav?.storage?.estimate) {
        return { supported: false, usage: 0, quota: 0, percentUsed: 0 };
    }
    try {
        const { usage = 0, quota = 0 } = await nav.storage.estimate();
        return {
            supported: true,
            usage,
            quota,
            percentUsed: quota > 0 ? (usage / quota) * 100 : 0,
        };
    } catch {
        return { supported: false, usage: 0, quota: 0, percentUsed: 0 };
    }
}

export async function getTableCounts() {
    const [accounts, transactions, categories, reconciliations, imports] =
        await Promise.all([
            db.accounts.count(),
            db.transactions.count(),
            db.categories.count(),
            db.reconciliationRecords.count(),
            db.importRecords.count(),
        ]);
    return { accounts, transactions, categories, reconciliations, imports };
}

export function formatBytes(bytes) {
    if (!bytes || bytes < 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}