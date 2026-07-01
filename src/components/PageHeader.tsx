import Link from "next/link";
import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string; icon?: string }>;
  onRefresh?: () => void;
  actionButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: string;
    variant?: "filled" | "outlined";
  };
  rightContent?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  onRefresh,
  actionButton,
  rightContent,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4 mb-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2 flex-wrap">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const content = (
                <span className="flex items-center gap-1.5">
                  {crumb.icon && (
                    <span className="material-symbols-outlined text-[16px]">
                      {crumb.icon}
                    </span>
                  )}
                  <span>{crumb.label}</span>
                </span>
              );

              return (
                <React.Fragment key={idx}>
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-secondary transition-colors"
                    >
                      {content}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-on-surface font-medium" : ""}>
                      {content}
                    </span>
                  )}
                  {!isLast && (
                    <span className="material-symbols-outlined text-[14px]">
                      chevron_right
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
        <h2 className="font-display-lg-mobile md:font-display-lg text-[24px] md:text-[32px] font-bold text-on-surface">
          {title}
        </h2>
        {description && (
          <p className="font-body-md text-[14px] text-on-surface-variant mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-DEFAULT border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
            title="Atualizar"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
          </button>
        )}

        {actionButton && (
          <>
            {actionButton.href ? (
              <Link
                href={actionButton.href}
                className={
                  actionButton.variant === "outlined"
                    ? "px-4 py-2.5 rounded-DEFAULT border border-outline text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-lowest transition-colors cursor-pointer flex items-center gap-2 shadow-sm font-semibold"
                    : "px-4 py-2.5 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm font-semibold cursor-pointer"
                }
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
                className={
                  actionButton.variant === "outlined"
                    ? "px-4 py-2.5 rounded-DEFAULT border border-outline text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-lowest transition-colors cursor-pointer flex items-center gap-2 shadow-sm font-semibold"
                    : "px-4 py-2.5 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm font-semibold cursor-pointer"
                }
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

        {rightContent}
      </div>
    </div>
  );
}
