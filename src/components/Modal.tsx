import React from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: string;
  titleIconColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  titleIcon,
  titleIconColor = "text-error",
  children,
  footer,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm w-full",
    md: "max-w-md w-full",
    lg: "max-w-lg w-full",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in duration-200 z-10 ${sizeClasses[size]}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {titleIcon && (
              <span className={`material-symbols-outlined text-[32px] ${titleIconColor}`}>
                {titleIcon}
              </span>
            )}
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-[22px]">
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow">{children}</div>

        {/* Footer */}
        {footer && <div className="flex justify-end gap-3 pt-1">{footer}</div>}
      </div>
    </div>
  );
}
