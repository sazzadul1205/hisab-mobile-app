export const CATEGORY_ICONS = {
  "inc-salary": <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  "inc-freelance": <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
  "inc-business": (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  "inc-gift": (
    <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1z" />
  ),
  "inc-side": <path d="M4 12h16M12 4v16" />,
  "inc-other": <path d="M4 12h16M12 4v16" />,

  "exp-groceries": (
    <>
      <path d="M6 7h12l-1 13H7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </>
  ),
  "exp-bills": (
    <>
      <path d="M4 6h16v12H4z" />
      <path d="M4 11h16" />
    </>
  ),
  "exp-transport": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  "exp-rent": (
    <>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  "exp-food": <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  "exp-health": (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  "exp-other": (
    <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1z" />
  ),
  "exp-transfer-fees": <path d="M4 8h13l-3-3M20 16H7l3 3" />,
};

export const DEFAULT_CATEGORY_ICON = <path d="M4 12h16M12 4v16" />;

export function getCategoryIcon(id) {
  return CATEGORY_ICONS[id] ?? DEFAULT_CATEGORY_ICON;
}
