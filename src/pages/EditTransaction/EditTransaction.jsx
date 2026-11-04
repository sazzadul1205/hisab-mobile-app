import { useParams } from "react-router-dom";
import AddIncome from "../AddIncome/AddIncome";
import AddExpense from "../AddExpense/AddExpense";
import AddTransfer from "../AddTransfer/AddTransfer";
import { useTransaction } from "../../hooks/useTransactions";
import { BootScreen } from "../../auth/RouteGuards";

export default function EditTransaction() {
  const { id } = useParams();
  const { transaction, loading } = useTransaction(id);

  if (loading) return <BootScreen />;
  if (!transaction) return <AddTransfer mode="edit" />; // fallback
  if (transaction.type === "income") return <AddIncome mode="edit" />;
  if (transaction.type === "expense") return <AddExpense mode="edit" />;
  return <AddTransfer mode="edit" />;
}
