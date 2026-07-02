import Link from "next/link";

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: string;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  actionButton,
}: EmptyStateProps) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
      <span className="material-symbols-outlined text-outline-variant text-[48px]">
        {icon}
      </span>
      <p className="font-headline-md text-on-surface font-semibold">{title}</p>
      <p className="font-body-md text-on-surface-variant max-w-sm">
        {description}
      </p>
      {actionButton && (
        <>
          {actionButton.href ? (
            <Link
              href={actionButton.href}
              className="mt-2 px-4 py-2 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:opacity-90 transition-all font-semibold flex items-center gap-2"
            >
              {actionButton.icon && (
                <span className="material-symbols-outlined text-[18px]">
                  {actionButton.icon}
                </span>
              )}
              {actionButton.label}
            </Link>
          ) : (
            <button
              onClick={actionButton.onClick}
              className="mt-2 px-4 py-2 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:opacity-90 transition-all font-semibold flex items-center gap-2 cursor-pointer"
            >
              {actionButton.icon && (
                <span className="material-symbols-outlined text-[18px]">
                  {actionButton.icon}
                </span>
              )}
              {actionButton.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}
