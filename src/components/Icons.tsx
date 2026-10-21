export type IconName =
  | 'sales'
  | 'purchase'
  | 'inventory'
  | 'customers'
  | 'reports';

interface IconProps {
  name: IconName;
  size?: number;
}

/** Simple, large line icons. Decorative only (hidden from screen readers). */
export function Icon({ name, size = 44 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'sales' && (
        <>
          <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
          <path d="M9 8h6M9 12h6" />
        </>
      )}
      {name === 'purchase' && (
        <>
          <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
        </>
      )}
      {name === 'inventory' && (
        <>
          <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
          <path d="M3 7.5 12 12l9-4.5M12 12v9" />
        </>
      )}
      {name === 'customers' && (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 14.2c2.9.2 5 2.5 5 5.3" />
        </>
      )}
      {name === 'reports' && (
        <>
          <path d="M3 21h18" />
          <path d="M6 21V12M11 21V6M16 21v-6" />
        </>
      )}
    </svg>
  );
}
