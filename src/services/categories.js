import { db } from "../db/db";
import { encryptRecord, decryptRecord } from "./encryption";

const TABLE = "categories";

export async function listCategories(type) {
    const query =
        type === "income" || type === "expense"
            ? db.categories.where("type").equals(type)
            : db.categories.toArray();
    const rows = await (Array.isArray(query) ? query : query.toArray());
    return Promise.all(rows.map((r) => decryptRecord(TABLE, r)));
}

export async function getCategory(id) {
    if (!id) return null;
    const row = await db.categories.get(id);
    if (!row) return null;
    return decryptRecord(TABLE, row);
}

export async function createCategory({ name, type }) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) throw new Error("NAME_REQUIRED");
    if (type !== "income" && type !== "expense") throw new Error("TYPE_INVALID");

    const sameType = await listCategories(type);
    if (sameType.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        throw new Error("DUPLICATE_NAME");
    }

    const category = {
        id: `${type === "income" ? "inc" : "exp"}-${crypto.randomUUID()}`,
        name: trimmed,
        type,
        isDefault: false,
        createdAt: new Date().toISOString(),
    };
    await db.categories.add(await encryptRecord(TABLE, category));
    return category;
}

export async function updateCategory(id, { name }) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) throw new Error("NAME_REQUIRED");

    const row = await db.categories.get(id);
    if (!row) throw new Error("NOT_FOUND");
    const existing = await decryptRecord(TABLE, row);

    const sameType = await listCategories(existing.type);
    if (
        sameType.some(
            (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase(),
        )
    ) {
        throw new Error("DUPLICATE_NAME");
    }

    const merged = { ...existing, name: trimmed };
    await db.categories.put(await encryptRecord(TABLE, merged));
}