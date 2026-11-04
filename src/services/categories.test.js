import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/db";
import { resetTestState } from "../test/helpers";
import {
    createCategory,
    listCategories,
    getCategory,
    updateCategory,
} from "./categories";
import { isEncrypted } from "./encryption";

beforeEach(resetTestState);

describe("createCategory", () => {
    it("creates an income category", async () => {
        const cat = await createCategory({ name: "Bonus", type: "income" });
        expect(cat.type).toBe("income");
        expect(cat.isDefault).toBe(false);
        expect(cat.id.startsWith("inc-")).toBe(true);
    });

    it("creates an expense category", async () => {
        const cat = await createCategory({ name: "Coffee", type: "expense" });
        expect(cat.type).toBe("expense");
        expect(cat.id.startsWith("exp-")).toBe(true);
    });

    it("rejects empty name", async () => {
        await expect(createCategory({ name: "", type: "expense" })).rejects.toThrow(
            "NAME_REQUIRED",
        );
    });

    it("rejects invalid type", async () => {
        await expect(
            createCategory({ name: "X", type: "other" }),
        ).rejects.toThrow("TYPE_INVALID");
    });

    it("rejects duplicate name within the same type", async () => {
        await createCategory({ name: "Coffee", type: "expense" });
        await expect(
            createCategory({ name: "coffee", type: "expense" }),
        ).rejects.toThrow("DUPLICATE_NAME");
    });

    it("allows same name across different types", async () => {
        await createCategory({ name: "Other", type: "expense" });
        const inc = await createCategory({ name: "Other", type: "income" });
        expect(inc.type).toBe("income");
    });

    it("stores the row encrypted with type and isDefault plaintext", async () => {
        const cat = await createCategory({ name: "Coffee", type: "expense" });
        const raw = await db.categories.get(cat.id);
        expect(isEncrypted(raw)).toBe(true);
        expect(raw.name).toBeUndefined();
        expect(raw.type).toBe("expense");
        expect(raw.isDefault).toBe(false);
    });
});

describe("listCategories", () => {
    it("returns all categories when type omitted", async () => {
        await createCategory({ name: "A", type: "income" });
        await createCategory({ name: "B", type: "expense" });
        expect(await listCategories()).toHaveLength(2);
    });

    it("filters by type", async () => {
        await createCategory({ name: "A", type: "income" });
        await createCategory({ name: "B", type: "expense" });
        const income = await listCategories("income");
        expect(income).toHaveLength(1);
        expect(income[0].name).toBe("A");
    });
});

describe("getCategory", () => {
    it("returns null for missing id", async () => {
        expect(await getCategory("nope")).toBeNull();
    });

    it("returns decrypted category", async () => {
        const created = await createCategory({ name: "Coffee", type: "expense" });
        const fetched = await getCategory(created.id);
        expect(fetched.name).toBe("Coffee");
    });
});

describe("updateCategory", () => {
    it("renames a category", async () => {
        const cat = await createCategory({ name: "Coffee", type: "expense" });
        await updateCategory(cat.id, { name: "Coffee & tea" });
        const fetched = await getCategory(cat.id);
        expect(fetched.name).toBe("Coffee & tea");
    });

    it("preserves type and isDefault", async () => {
        const cat = await createCategory({ name: "Coffee", type: "expense" });
        await updateCategory(cat.id, { name: "Coffee 2" });
        const fetched = await getCategory(cat.id);
        expect(fetched.type).toBe("expense");
        expect(fetched.isDefault).toBe(false);
    });

    it("rejects duplicate name within type", async () => {
        await createCategory({ name: "Coffee", type: "expense" });
        const cat2 = await createCategory({ name: "Tea", type: "expense" });
        await expect(updateCategory(cat2.id, { name: "Coffee" })).rejects.toThrow(
            "DUPLICATE_NAME",
        );
    });

    it("allows keeping the same name (self-match)", async () => {
        const cat = await createCategory({ name: "Coffee", type: "expense" });
        await updateCategory(cat.id, { name: "Coffee" });
        expect((await getCategory(cat.id)).name).toBe("Coffee");
    });
});