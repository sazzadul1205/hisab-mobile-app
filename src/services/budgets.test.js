import { describe, it, expect, beforeEach } from "vitest";
import { resetTestState } from "../test/helpers";
import {
  monthKeyFromDate,
  parseMonthKey,
  formatMonthKey,
  previousMonthKey,
  nextMonthKey,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudget,
  getBudgetByCategoryMonth,
  listBudgets,
  calculateBudgetActuals,
  calculateBudgetSummary,
} from "../services/budgets";
import { db } from "../db/db";
import { DEFAULT_CATEGORIES } from "../constants/categories";

describe("budgets service", () => {
  beforeEach(async () => {
    await resetTestState();
    // Seed categories
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  });

  describe("monthKey helpers", () => {
    it("formats month key correctly", () => {
      const key = monthKeyFromDate(new Date(2026, 10, 15)); // Nov 2026
      expect(key).toBe("2026-11");
    });

    it("parses month key", () => {
      const { year, month } = parseMonthKey("2026-11");
      expect(year).toBe(2026);
      expect(month).toBe(11);
    });

    it("formats month key for display", () => {
      const formatted = formatMonthKey("2026-11");
      expect(formatted).toBe("November 2026");
    });

    it("calculates previous month", () => {
      expect(previousMonthKey("2026-11")).toBe("2026-10");
      expect(previousMonthKey("2026-01")).toBe("2025-12");
    });

    it("calculates next month", () => {
      expect(nextMonthKey("2026-11")).toBe("2026-12");
      expect(nextMonthKey("2026-12")).toBe("2027-01");
    });
  });

  describe("createBudget", () => {
    it("creates a budget with valid data", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000, // 5000 BDT
      });

      expect(budget.id).toBeDefined();
      expect(budget.categoryId).toBe("exp-groceries");
      expect(budget.monthKey).toBe("2026-11");
      expect(budget.limitAmount).toBe(500000);
      expect(budget.createdAt).toBeDefined();
      expect(budget.updatedAt).toBeDefined();
    });

    it("rejects duplicate category/month", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          monthKey: "2026-11",
          limitAmount: 300000,
        })
      ).rejects.toThrow("BUDGET_EXISTS");
    });

    it("rejects invalid limit amount", async () => {
      await expect(
        createBudget({
          categoryId: "exp-groceries",
          monthKey: "2026-11",
          limitAmount: 0,
        })
      ).rejects.toThrow("LIMIT_INVALID");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          monthKey: "2026-11",
          limitAmount: -100,
        })
      ).rejects.toThrow("LIMIT_INVALID");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          monthKey: "2026-11",
          limitAmount: 123.45, // not integer
        })
      ).rejects.toThrow("LIMIT_INVALID");
    });

    it("requires categoryId and monthKey", async () => {
      await expect(
        createBudget({
          monthKey: "2026-11",
          limitAmount: 500000,
        })
      ).rejects.toThrow("CATEGORY_REQUIRED");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          limitAmount: 500000,
        })
      ).rejects.toThrow("MONTH_REQUIRED");
    });
  });

  describe("updateBudget", () => {
    it("updates limit amount", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });

      const updated = await updateBudget(budget.id, { limitAmount: 750000 });
      expect(updated.limitAmount).toBe(750000);
      expect(updated.updatedAt).not.toBe(budget.updatedAt);
    });

    it("rejects invalid limit amount", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });

      await expect(updateBudget(budget.id, { limitAmount: 0 })).rejects.toThrow(
        "LIMIT_INVALID"
      );
    });

    it("prevents duplicate category/month on update", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });
      const budget2 = await createBudget({
        categoryId: "exp-transport",
        monthKey: "2026-11",
        limitAmount: 300000,
      });

      await expect(
        updateBudget(budget2.id, { categoryId: "exp-groceries" })
      ).rejects.toThrow("BUDGET_EXISTS");
    });
  });

  describe("deleteBudget", () => {
    it("deletes a budget", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });

      await deleteBudget(budget.id);
      const found = await getBudget(budget.id);
      expect(found).toBeNull();
    });
  });

  describe("getBudgetByCategoryMonth", () => {
    it("finds budget by category and month", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });

      const found = await getBudgetByCategoryMonth("exp-groceries", "2026-11");
      expect(found).not.toBeNull();
      expect(found.categoryId).toBe("exp-groceries");
      expect(found.monthKey).toBe("2026-11");
    });

    it("returns null for non-existent budget", async () => {
      const found = await getBudgetByCategoryMonth("exp-groceries", "2026-11");
      expect(found).toBeNull();
    });
  });

  describe("listBudgets", () => {
    it("lists all budgets for a month", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });
      await createBudget({
        categoryId: "exp-transport",
        monthKey: "2026-11",
        limitAmount: 300000,
      });
      await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-10",
        limitAmount: 400000,
      });

      const budgets = await listBudgets("2026-11");
      expect(budgets.length).toBe(2);
      expect(budgets.every((b) => b.monthKey === "2026-11")).toBe(true);
    });

    it("lists all budgets when no month specified", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      });
      await createBudget({
        categoryId: "exp-transport",
        monthKey: "2026-10",
        limitAmount: 300000,
      });

      const budgets = await listBudgets();
      expect(budgets.length).toBe(2);
    });
  });

  describe("calculateBudgetActuals", () => {
    it("calculates actual spending from expense transactions", async () => {
      const monthKey = "2026-11";
      const { year, month } = parseMonthKey(monthKey);
      const from = new Date(year, month - 1, 1).toISOString();
      const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

      // Add expense transactions
      await db.transactions.bulkAdd([
        {
          id: "tx1",
          type: "expense",
          amount: 100000,
          categoryId: "exp-groceries",
          date: from,
          accountId: "acc1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tx2",
          type: "expense",
          amount: 50000,
          categoryId: "exp-groceries",
          date: to,
          accountId: "acc1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tx3",
          type: "expense",
          amount: 200000,
          categoryId: "exp-transport",
          date: from,
          accountId: "acc1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Income should not count
        {
          id: "tx4",
          type: "income",
          amount: 500000,
          categoryId: "inc-salary",
          date: from,
          accountId: "acc1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Transfer should not count
        {
          id: "tx5",
          type: "transfer",
          amount: 100000,
          fee: 500,
          categoryId: "exp-transfer-fees",
          date: from,
          accountId: "acc1",
          destinationAccountId: "acc2",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const transactions = await db.transactions.toArray();
      const actuals = calculateBudgetActuals(transactions, monthKey);

      expect(actuals.get("exp-groceries")).toBe(150000);
      expect(actuals.get("exp-transport")).toBe(200000);
      expect(actuals.get("inc-salary")).toBeUndefined();
      // Transfer fee should not be in expense actuals (handled separately)
      expect(actuals.get("exp-transfer-fees")).toBeUndefined();
    });

    it("excludes transactions outside the month", async () => {
      const monthKey = "2026-11";
      const { year, month } = parseMonthKey(monthKey);
      const from = new Date(year, month - 1, 1).toISOString();
      const prevMonth = new Date(year, month - 2, 15).toISOString();

      await db.transactions.bulkAdd([
        {
          id: "tx1",
          type: "expense",
          amount: 100000,
          categoryId: "exp-groceries",
          date: from,
          accountId: "acc1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tx2",
          type: "expense",
          amount: 50000,
          categoryId: "exp-groceries",
          date: prevMonth,
          accountId: "acc1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const transactions = await db.transactions.toArray();
      const actuals = calculateBudgetActuals(transactions, monthKey);

      expect(actuals.get("exp-groceries")).toBe(100000);
    });
  });

  describe("calculateBudgetSummary", () => {
    it("calculates summary with correct values", () => {
      const budget = {
        id: "budget1",
        categoryId: "exp-groceries",
        monthKey: "2026-11",
        limitAmount: 500000,
      };

      const summary = calculateBudgetSummary(budget, 300000);

      expect(summary.budgetId).toBe("budget1");
      expect(summary.categoryId).toBe("exp-groceries");
      expect(summary.limitAmount).toBe(500000);
      expect(summary.spent).toBe(300000);
      expect(summary.remaining).toBe(200000);
      expect(summary.usagePercent).toBe(60);
      expect(summary.status).toBe("under");
    });

    it("shows near status at 80%", () => {
      const budget = { id: "b1", categoryId: "exp-groceries", limitAmount: 500000 };
      const summary = calculateBudgetSummary(budget, 400000); // 80%
      expect(summary.status).toBe("near");
    });

    it("shows over status at 100%+", () => {
      const budget = { id: "b1", categoryId: "exp-groceries", limitAmount: 500000 };
      const summary = calculateBudgetSummary(budget, 500000); // 100%
      expect(summary.status).toBe("over");

      const summary2 = calculateBudgetSummary(budget, 600000); // 120%
      expect(summary2.status).toBe("over");
    });

    it("handles zero limit", () => {
      const budget = { id: "b1", categoryId: "exp-groceries", limitAmount: 0 };
      const summary = calculateBudgetSummary(budget, 100000);
      expect(summary.usagePercent).toBe(0);
      expect(summary.status).toBe("under");
    });

    it("handles zero spent", () => {
      const budget = { id: "b1", categoryId: "exp-groceries", limitAmount: 500000 };
      const summary = calculateBudgetSummary(budget, 0);
      expect(summary.spent).toBe(0);
      expect(summary.remaining).toBe(500000);
      expect(summary.usagePercent).toBe(0);
    });
  });
});