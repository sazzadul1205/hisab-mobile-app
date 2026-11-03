import { useParams } from "react-router-dom";
import AddIncome from "../AddIncome/AddIncome";
import AddExpense from "../AddExpense/AddExpense";
import AddTransfer from "../AddTransfer/AddTransfer";

/* ----------------------------------------------------------------
   Demo type map — matches the Transactions list and Dashboard rows
   so direct URLs resolve to the right form while we're static.
   When DB lands: replaced by a store lookup on :id.
   ---------------------------------------------------------------- */
const DEMO_TYPES = {
  // Dashboard recent
  1: "expense", // Groceries
  2: "income", // Salary
  3: "transfer", // Transfer to bKash
  // Transactions list
  t1: "income", // Salary
  t2: "expense", // Groceries
  t4: "transfer", // Transfer to bKash
  t5: "expense", // Electricity
  t6: "income", // Freelance
  t7: "expense", // Mobile recharge
  // Account detail
  a1: "income", // Salary
  a2: "transfer", // Transfer to bKash
  a3: "expense", // Internet bill
  // The demo id used by TransactionDetail itself
  demo: "transfer",
};

// Matches what TransactionDetail currently renders for unknown ids
const FALLBACK = "transfer";

export default function EditTransaction() {
  const { id } = useParams();
  const type = DEMO_TYPES[id] ?? FALLBACK;

  if (type === "income") return <AddIncome mode="edit" />;
  if (type === "expense") return <AddExpense mode="edit" />;
  return <AddTransfer mode="edit" />;
}
