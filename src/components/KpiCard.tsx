import React from "react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  delta?: number;
  deltaLabel?: string;
  iconColorClass?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  delta,
  deltaLabel = "vs ultimo período",
  iconColorClass = "text-secondary",
}: KpiCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-sm transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          {title}
        </p>
        <span className={`material-symbols-outlined ${iconColorClass}`}>
          {icon}
        </span>
      </div>
      <div>
        <h3 className="font-display-lg text-display-lg text-on-surface font-data-tabular font-bold">
          {value}
        </h3>
        {delta !== undefined && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`inline-flex items-center font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                isPositive
                  ? "text-on-tertiary-container bg-tertiary-fixed"
                  : "text-on-error-container bg-error-container"
              }`}
            >
              <span
                className="material-symbols-outlined mr-0.5"
                style={{ fontSize: "14px" }}
              >
                {isPositive ? "trending_up" : "trending_down"}
              </span>
              {Math.abs(delta * 100).toFixed(1)}%
            </span>
            {deltaLabel && (
              <span className="font-body-md text-body-md text-on-surface-variant text-xs">
                {deltaLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
