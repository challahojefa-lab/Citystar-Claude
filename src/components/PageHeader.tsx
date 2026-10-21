interface PageHeaderProps {
  title: string;
  backLabel: string;
  onBack: () => void;
}

/** Blue header with a large Back button, used by every screen except the dashboard. */
export function PageHeader({ title, backLabel, onBack }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-inner">
        <button type="button" className="back-button" onClick={onBack}>
          ← {backLabel}
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
    </header>
  );
}
