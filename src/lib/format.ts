export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
