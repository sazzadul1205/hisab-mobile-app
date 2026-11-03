import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const EXPENSE_CATEGORIES = [
  {
    id: "groceries",
    label: "Groceries",
    isDefault: true,
    icon: (
      <>
        <path d="M6 7h12l-1 13H7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
  {
    id: "bills",
    label: "Bills",
    icon: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="M4 11h16" />
      </>
    ),
  },
  {
    id: "transport",
    label: "Transport",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
  {
    id: "rent",
    label: "Rent",
    icon: (
      <>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
  },
  {
    id: "food",
    label: "Food & dining",
    icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  },
  {
    id: "health",
    label: "Health",
    icon: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
  },
];

const INCOME_CATEGORIES = [
  {
    id: "salary",
    label: "Salary",
    isDefault: true,
    icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  },
  {
    id: "freelance",
    label: "Freelance",
    icon: <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
  },
  {
    id: "business",
    label: "Business",
    icon: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
  },
  {
    id: "gift",
    label: "Gift",
    icon: (
      <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1z" />
    ),
  },
  { id: "side", label: "Side income", icon: <path d="M4 12h16M12 4v16" /> },
  { id: "other", label: "Other", icon: <path d="M4 12h16M12 4v16" /> },
];

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
          icon={c.icon}
          title={c.label}
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

function ManageEmpty() {
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
      <b className="block text-[13.5px] font-semibold mb-1.25">Bulk manage</b>
      <small className="block text-[12px] text-(--muted) leading-[1.55] max-w-[34ch] mx-auto">
        Reorder categories, merge duplicates, and archive unused ones. Available
        when the data layer is connected.
      </small>
    </div>
  );
}

export default function Categories() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("expense");
  const isManage = tab === "manage";
  const categories = tab === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="Categories"
          subtitle="8 income · 12 expense"
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
          <ManageEmpty />
        ) : (
          <>
            <CategoryList
              categories={categories}
              onSelect={(id) => navigate(`/categories/${id}/edit`)}
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
              Removing a category used by saved transactions is not finalized.
              Existing references will not silently break.
            </Alert>

            <Note>
              Category type must be income or expense. Default categories cannot
              be deleted, only renamed.
            </Note>
          </>
        )}
      </ScrollArea>
    </PhoneFrame>
  );
}
