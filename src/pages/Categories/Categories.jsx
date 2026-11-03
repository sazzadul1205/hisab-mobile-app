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

/* ----------------------------------------------------------------
   Default expense categories (mirror of the mock, real seed
   moves to a constants file once the DB wires)
   ---------------------------------------------------------------- */
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

export default function Categories() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="Categories"
          subtitle="8 income · 12 expense"
          right={
            <IconButton
              label="Add category"
              icon={<path d="M12 5v14M5 12h14" />}
            />
          }
        />

        <SegmentedControl
          value="expense"
          options={[
            { value: "expense", label: "Expense" },
            { value: "income", label: "Income" },
            { value: "manage", label: "Manage" },
          ]}
        />

        <div
          className="bg-white border border-(--line) rounded-[18px]
                        overflow-hidden mb-3"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <ListItem
              key={c.id}
              icon={c.icon}
              title={c.label}
              badge={
                c.isDefault ? (
                  <StatusPill tone="neutral">Default</StatusPill>
                ) : null
              }
              trailing={<Chevron />}
            />
          ))}
        </div>

        <Button variant="ghost" size="sm" className="mb-3">
          + Add expense category
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
          Category type must be income or expense. Default categories cannot be
          deleted, only renamed.
        </Note>
      </ScrollArea>
    </PhoneFrame>
  );
}
