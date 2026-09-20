import React from "react";

export interface SearchFilterBarProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  totalCountText?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  icon?: string;
}

export default function SearchFilterBar({
  placeholder,
  value,
  onChange,
  totalCountText,
  isLoading,
  children,
  icon = "search",
}: SearchFilterBarProps) {
  const hasChildren = !!children;

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
      <div
        className={`relative focus-within:ring-2 focus-within:ring-secondary ${
          hasChildren
            ? "flex-1 min-w-[240px] rounded-lg"
            : "w-full max-w-md rounded-DEFAULT"
        }`}
      >
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
          {icon}
        </span>
        <input
          className={`w-full h-9 bg-background/70 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none ${
            hasChildren
              ? "border border-outline-variant rounded-lg pl-10 pr-4"
              : "border border-background-variant/80 rounded-lg pl-9 pr-4"
          }`}
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}

      {totalCountText && (
        <div className="h-9 px-3 flex items-center rounded-lg text-sm text-on-surface-variant font-medium border border-outline-variant bg-surface-container-lowest-variant whitespace-nowrap ml-auto">
          {isLoading ? "Carregando..." : totalCountText}
        </div>
      )}
    </div>
  );
}
