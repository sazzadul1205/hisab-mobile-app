import { useParams } from "react-router-dom";
import AddIncome from "../AddIncome/AddIncome";
import AddExpense from "../AddExpense/AddExpense";
import AddTransfer from "../AddTransfer/AddTransfer";
import { getDemoTransaction } from "../../data/demoTransactions";

export default function EditTransaction() {
  const { id } = useParams();
  const tx = getDemoTransaction(id);

  if (tx.type === "income") return <AddIncome mode="edit" />;
  if (tx.type === "expense") return <AddExpense mode="edit" />;
  return <AddTransfer mode="edit" />;
}
