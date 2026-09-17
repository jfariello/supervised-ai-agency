export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          {description}
        </p>
      </div>
      {actions ? <div className="toolbar">{actions}</div> : null}
    </header>
  );
}
