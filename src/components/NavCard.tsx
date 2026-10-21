import { Icon, type IconName } from './Icons';

interface NavCardProps {
  icon: IconName;
  title: string;
  description: string;
  /** Small label such as "Coming soon". Leave out for sections that are ready. */
  badge?: string;
  /** CSS colour used for the icon circle. */
  accent: string;
  onClick: () => void;
}

export function NavCard({
  icon,
  title,
  description,
  badge,
  accent,
  onClick,
}: NavCardProps) {
  return (
    <button
      type="button"
      className="nav-card"
      style={{ ['--accent' as string]: accent }}
      onClick={onClick}
    >
      <span className="nav-icon">
        <Icon name={icon} />
      </span>
      <span className="nav-title">{title}</span>
      <span className="nav-description">{description}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </button>
  );
}
