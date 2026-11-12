import { describe, it, expect, beforeEach } from "vitest";
import { resetTestState } from "../test/helpers";
import {
  getPeriodKey,
  parsePeriodKey,
  formatPeriodKey,
  getPreviousPeriodKey,
  getNextPeriodKey,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudget,
  getBudgetByCategoryPeriod,
  listBudgets,
  calculateBudgetActuals,
  calculateBudgetSummary,
  BUDGET_TYPES,
  BUDGET_PERIODS,
} from "../services/budgets";
import { db } from "../db/db";
import { DEFAULT_CATEGORIES } from "../constants/categories";

describe("budgets service", () => {
  beforeEach(async () => {
    await resetTestState();
    // Seed categories
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  });

  describe("period helpers", () => {
    it("formats monthly period key correctly", () => {
      const key = getPeriodKey(new Date(2026, 10, 15), BUDGET_PERIODS.monthly); // Nov 2026
      expect(key).toBe("2026-11");
    });

    it("formats daily period key correctly", () => {
      const key = getPeriodKey(new Date(2026, 10, 15), BUDGET_PERIODS.daily); // Nov 15, 2026
      expect(key).toBe("2026-11-15");
    });

    it("parses monthly period key", () => {
      const { year, month } = parsePeriodKey("2026-11", BUDGET_PERIODS.monthly);
      expect(year).toBe(2026);
      expect(month).toBe(11);
    });

    it("parses daily period key", () => {
      const { year, month, day } = parsePeriodKey("2026-11-15", BUDGET_PERIODS.daily);
      expect(year).toBe(2026);
      expect(month).toBe(11);
      expect(day).toBe(15);
    });

    it("formats monthly period key for display", () => {
      const formatted = formatPeriodKey("2026-11", BUDGET_PERIODS.monthly);
      expect(formatted).toBe("November 2026");
    });

    it("calculates previous monthly period", () => {
      expect(getPreviousPeriodKey("2026-11", BUDGET_PERIODS.monthly)).toBe("2026-10");
      expect(getPreviousPeriodKey("2026-01", BUDGET_PERIODS.monthly)).toBe("2025-12");
    });

    it("calculates next monthly period", () => {
      expect(getNextPeriodKey("2026-11", BUDGET_PERIODS.monthly)).toBe("2026-12");
      expect(getNextPeriodKey("2026-12", BUDGET_PERIODS.monthly)).toBe("2027-01");
    });
  });

  describe("createBudget", () => {
    it("creates a budget with valid data", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000, // 5000 BDT
        budgetType: BUDGET_TYPES.recurring,
      });

      expect(budget.id).toBeDefined();
      expect(budget.categoryId).toBe("exp-groceries");
      expect(budget.periodKey).toBe("2026-11");
      expect(budget.limitAmount).toBe(500000);
      expect(budget.budgetType).toBe(BUDGET_TYPES.recurring);
      expect(budget.createdAt).toBeDefined();
      expect(budget.updatedAt).toBeDefined();
    });

    it("creates a one-time budget", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.daily,
        periodKey: "2026-11-15",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.onetime,
      });

      expect(budget.budgetType).toBe(BUDGET_TYPES.onetime);
    });

    it("rejects duplicate category/period", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          period: BUDGET_PERIODS.monthly,
          periodKey: "2026-11",
          limitAmount: 300000,
          budgetType: BUDGET_TYPES.recurring,
        })
      ).rejects.toThrow("BUDGET_EXISTS");
    });

    it("rejects invalid limit amount", async () => {
      await expect(
        createBudget({
          categoryId: "exp-groceries",
          period: BUDGET_PERIODS.monthly,
          periodKey: "2026-11",
          limitAmount: 0,
          budgetType: BUDGET_TYPES.recurring,
        })
      ).rejects.toThrow("LIMIT_INVALID");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          period: BUDGET_PERIODS.monthly,
          periodKey: "2026-11",
          limitAmount: -100,
          budgetType: BUDGET_TYPES.recurring,
        })
      ).rejects.toThrow("LIMIT_INVALID");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          period: BUDGET_PERIODS.monthly,
          periodKey: "2026-11",
          limitAmount: 123.45, // not integer
          budgetType: BUDGET_TYPES.recurring,
        })
      ).rejects.toThrow("LIMIT_INVALID");
    });

    it("requires categoryId, period, periodKey, and budgetType", async () => {
      await expect(
        createBudget({
          period: BUDGET_PERIODS.monthly,
          periodKey: "2026-11",
          limitAmount: 500000,
          budgetType: BUDGET_TYPES.recurring,
        })
      ).rejects.toThrow("CATEGORY_REQUIRED");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          periodKey: "2026-11",
          limitAmount: 500000,
          budgetType: BUDGET_TYPES.recurring,
        })
      ).rejects.toThrow("PERIOD_REQUIRED");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          period: BUDGET_PERIODS.monthly,
          limitAmount: 500000,
          budgetType: BUDGET_TYPES.recurring,
        })
      ).rejects.toThrow("PERIOD_KEY_REQUIRED");

      await expect(
        createBudget({
          categoryId: "exp-groceries",
          period: BUDGET_PERIODS.monthly,
          periodKey: "2026-11",
          limitAmount: 500000,
        })
      ).rejects.toThrow("BUDGET_TYPE_REQUIRED");
    });
  });

  describe("updateBudget", () => {
    it("updates limit amount", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });

      const updated = await updateBudget(budget.id, { limitAmount: 750000 });
      expect(updated.limitAmount).toBe(750000);
      expect(updated.updatedAt).not.toBe(budget.updatedAt);
    });

    it("rejects invalid limit amount", async () => {
      const budget = await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });

      await expect(updateBudget(budget.id, { limitAmount: 0 })).rejects.toThrow(
        "LIMIT_INVALID"
      );
    });

    it("prevents duplicate category/period on update", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });
      const budget2 = await createBudget({
        categoryId: "exp-transport",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 300000,
        budgetType: BUDGET_TYPES.recurring,
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
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });

      await deleteBudget(budget.id);
      const found = await getBudget(budget.id);
      expect(found).toBeNull();
    });
  });

  describe("getBudgetByCategoryPeriod", () => {
    it("finds budget by category and period", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });

      const found = await getBudgetByCategoryPeriod(
        "exp-groceries",
        BUDGET_PERIODS.monthly,
        "2026-11"
      );
      expect(found).not.toBeNull();
      expect(found.categoryId).toBe("exp-groceries");
      expect(found.periodKey).toBe("2026-11");
    });

    it("returns null for non-existent budget", async () => {
      const found = await getBudgetByCategoryPeriod(
        "exp-groceries",
        BUDGET_PERIODS.monthly,
        "2026-11"
      );
      expect(found).toBeNull();
    });
  });

  describe("listBudgets", () => {
    it("lists all budgets for a period", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });
      await createBudget({
        categoryId: "exp-transport",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 300000,
        budgetType: BUDGET_TYPES.recurring,
      });
      await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-10",
        limitAmount: 400000,
        budgetType: BUDGET_TYPES.recurring,
      });

      const budgets = await listBudgets(BUDGET_PERIODS.monthly, "2026-11");
      expect(budgets.length).toBe(2);
      expect(budgets.every((b) => b.periodKey === "2026-11")).toBe(true);
    });

    it("lists all budgets when no period specified", async () => {
      await createBudget({
        categoryId: "exp-groceries",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-11",
        limitAmount: 500000,
        budgetType: BUDGET_TYPES.recurring,
      });
      await createBudget({
        categoryId: "exp-transport",
        period: BUDGET_PERIODS.monthly,
        periodKey: "2026-10",
        limitAmount: 300000,
        budgetType: BUDGET_TYPES.recurring,
      });

      const budgets = await listBudgets();
      expect(budgets.length).toBe(2);
    });
  });

  describe("calculateBudgetActuals", () => {
    it("calculates actual spending from expense transactions", async () => {
      const periodKey = "2026-11";
      const from = new Date(2026, 10, 1).toISOString();
      const to = new Date(2026, 11, 0, 23, 59, 59, 999).toISOString();

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
      const actuals = calculateBudgetActuals(transactions, periodKey, BUDGET_PERIODS.monthly);

      expect(actuals.get("exp-groceries")).toBe(150000);
      expect(actuals.get("exp-transport")).toBe(200000);
      expect(actuals.get("inc-salary")).toBeUndefined();
      // Transfer fee should not be in expense actuals (handled separately)
      expect(actuals.get("exp-transfer-fees")).toBeUndefined();
    });

    it("excludes transactions outside the period", async () => {
      const periodKey = "2026-11";
      const from = new Date(2026, 10, 1).toISOString();
      const prevMonth = new Date(2026, 9, 15).toISOString(); // October

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
      const actuals = calculateBudgetActuals(transactions, periodKey, BUDGET_PERIODS.monthly);

      expect(actuals.get("exp-groceries")).toBe(100000);
    });
  });

  describe("calculateBudgetSummary", () => {
    it("calculates summary with correct values", () => {
      const budget = {
        id: "budget1",
        categoryId: "exp-groceries",
        periodKey: "2026-11",
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