export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default";

export interface BadgeProps {
  label: string;
  /** Cor HEX para badges de categoria (ex: "#0051d5"). Tem precedência sobre variant. */
  color?: string;
  /** Variante semântica para badges de status com cores fixas do design system. */
  variant?: BadgeVariant;
  /** Habilita o estilo de dado tabular no label (útil para contadores). */
  tabular?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success:
    "bg-tertiary-container/10 text-on-tertiary-container border-on-tertiary-container/20",
  warning: "bg-surface-container-high text-on-surface border-outline-variant",
  danger: "bg-error-container text-on-error-container border-error-container",
  info: "bg-surface-container text-on-surface-variant border-outline-variant/50",
  default:
    "bg-surface-container text-on-surface-variant border-outline-variant/50",
};

export default function Badge({
  label,
  color,
  variant = "default",
  tabular = false,
}: BadgeProps) {
  const baseClasses =
    `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
      tabular ? "font-data-tabular" : ""
    }`.trim();

  if (color) {
    return (
      <span
        className={baseClasses}
        style={{
          backgroundColor: color + "22",
          color: color,
          borderColor: color + "44",
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>{label}</span>
  );
}
