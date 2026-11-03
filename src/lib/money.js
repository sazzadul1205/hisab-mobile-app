export const toMinor = (amount) => Math.round(Number(amount) * 100);
export const fromMinor = (minor) => minor / 100;
export const formatBDT = (minor) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(fromMinor(minor));
