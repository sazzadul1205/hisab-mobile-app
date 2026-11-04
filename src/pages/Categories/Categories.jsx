import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { SegmentedControl } from "../../components/SegmentedControl";
import { ListItem } from "../../components/ListItem";
import { Chevron } from "../../components/Chevron";
import { StatusPill } from "../../components/StatusPill";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";
import { Button } from "../../components/Button";
import { BootScreen } from "../../auth/RouteGuards";
import { useCategories } from "../../hooks/useTransactions";
import { getCategoryIcon } from "../../constants/categoryIcons";

const TABS = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "manage", label: "Manage" },
];

function CategoryList({ categories, onSelect }) {
  return (
    <div className="bg-white border border-(--line) rounded-[18px] overflow-hidden mb-3">
      {categories.map((c) => (
        <ListItem
          key={c.id}
          icon={getCategoryIcon(c.id)}
          title={c.name}
          badge={
            c.isDefault ? <StatusPill tone="neutral">Default</StatusPill> : null
          }
          trailing={<Chevron />}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}

function ManageInfo() {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center bg-(--app) border border-dashed border-(--line) text-(--muted)">
        <svg
          viewBox="0 0 24 24"
          className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </div>
      <b className="block text-[13.5px] font-semibold mb-1.25">
        No bulk operations in v1
      </b>
      <small className="block text-[12px] text-(--muted) leading-[1.55] max-w-[34ch] mx-auto">
        Reorder, merge, and archive are planned for a future release. Use the
        Expense and Income tabs to add or rename categories.
      </small>
    </div>
  );
}

function EmptyState({ type }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center bg-(--app) border border-dashed border-(--line) text-(--muted)">
        <svg
          viewBox="0 0 24 24"
          className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <b className="block text-[13.5px] font-semibold mb-1.25">
        No {type} categories
      </b>
      <small className="block text-[12px] text-(--muted) leading-[1.55]">
        Add one to use it when recording transactions.
      </small>
    </div>
  );
}

export default function Categories() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const rawTab = params.get("tab");
  const tab = rawTab === "income" || rawTab === "manage" ? rawTab : "expense";

  const setTab = (v) => setParams({ tab: v }, { replace: true });

  const { categories, loading } = useCategories();

  const counts = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const c of categories) {
      if (c.type === "income") income++;
      else if (c.type === "expense") expense++;
    }
    return { income, expense };
  }, [categories]);

  const visible = useMemo(() => {
    if (tab === "manage") return [];
    return categories
      .filter((c) => c.type === tab)
      .sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [categories, tab]);

  if (loading) return <BootScreen />;

  const isManage = tab === "manage";

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="Categories"
          subtitle={`${counts.income} income · ${counts.expense} expense`}
          right={
            !isManage ? (
              <IconButton
                label="Add category"
                icon={<path d="M12 5v14M5 12h14" />}
                onClick={() => navigate(`/categories/new?type=${tab}`)}
              />
            ) : null
          }
        />

        <SegmentedControl value={tab} options={TABS} onChange={setTab} />

        {isManage ? (
          <ManageInfo />
        ) : visible.length === 0 ? (
          <EmptyState type={tab} />
        ) : (
          <>
            <CategoryList
              categories={visible}
              onSelect={(id) => navigate(`/categories/${id}/edit?from=${tab}`)}
            />

            <Button
              variant="ghost"
              size="sm"
              className="mb-3"
              onClick={() => navigate(`/categories/new?type=${tab}`)}
            >
              + Add {tab} category
            </Button>

            <Alert
              tone="warn"
              icon={
                <>
                  <path d="M12 9v4" />
                  <circle cx="12" cy="17" r=".6" fill="currentColor" />
                  <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </>
              }
              title="Deletion behavior"
            >
              Deleting a category used by saved transactions is not supported in
              v1. Existing references will not silently break.
            </Alert>

            <Note>
              Category type is fixed after creation. Default categories can be
              renamed but not deleted.
            </Note>
          </>
        )}
      </ScrollArea>
    </PhoneFrame>
  );
}
