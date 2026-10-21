interface SummaryCardProps {
  label: string;
  value: string;
  /** CSS colour used for the left accent bar and the value. */
  accent: string;
}

export function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <div className="summary-card" style={{ ['--accent' as string]: accent }}>
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value}</span>
    </div>
  );
}
