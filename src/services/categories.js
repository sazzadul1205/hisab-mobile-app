import { db } from "../db/db";

export async function listCategories(type) {
    if (type === "income" || type === "expense") {
        return db.categories.where("type").equals(type).toArray();
    }
    return db.categories.toArray();
}

export async function getCategory(id) {
    if (!id) return null;
    return (await db.categories.get(id)) ?? null;
}

export async function createCategory({ name, type }) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) throw new Error("NAME_REQUIRED");
    if (type !== "income" && type !== "expense") {
        throw new Error("TYPE_INVALID");
    }

    // Prevent duplicate names within the same type
    const existing = await db.categories.where("type").equals(type).toArray();
    if (
        existing.some(
            (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
        )
    ) {
        throw new Error("DUPLICATE_NAME");
    }

    const category = {
        id: `${type === "income" ? "inc" : "exp"}-${crypto.randomUUID()}`,
        name: trimmed,
        type,
        isDefault: false,
        createdAt: new Date().toISOString(),
    };
    await db.categories.add(category);
    return category;
}

export async function updateCategory(id, { name }) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) throw new Error("NAME_REQUIRED");

    const existing = await db.categories.get(id);
    if (!existing) throw new Error("NOT_FOUND");

    const sameType = await db.categories
        .where("type")
        .equals(existing.type)
        .toArray();
    if (
        sameType.some(
            (c) =>
                c.id !== id &&
                c.name.toLowerCase() === trimmed.toLowerCase(),
        )
    ) {
        throw new Error("DUPLICATE_NAME");
    }

    await db.categories.update(id, { name: trimmed });
}
