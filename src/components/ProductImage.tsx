"use client";

import { useState } from "react";

interface ProductImageProps {
  url: string | null | undefined;
  name: string;
  size?: "sm" | "lg";
}

export default function ProductImage({
  url,
  name,
  size = "sm",
}: ProductImageProps) {
  const dim = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const iconSize = size === "lg" ? "text-[28px]" : "text-[20px]";
  const [hasError, setHasError] = useState(false);

  if (!url) {
    return (
      <div
        className={`${dim} rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center flex-shrink-0`}
      >
        <span
          className={`material-symbols-outlined text-on-surface-variant ${iconSize}`}
        >
          image_not_supported
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`${dim} rounded-lg bg-error-container border border-error/30 flex items-center justify-center flex-shrink-0`}
        title="Não foi possível carregar a imagem"
      >
        <span className={`material-symbols-outlined text-error ${iconSize}`}>
          broken_image
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${dim} rounded-lg bg-surface border border-outline-variant overflow-hidden flex-shrink-0`}
    >
      <img
        className="w-full h-full object-cover"
        src={url}
        alt={name}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
