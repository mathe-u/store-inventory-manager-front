"use client";

import { useState } from "react";

interface ProductImageProps {
  url: string | null | undefined;
  name: string;
}

export default function ProductImage({ url, name }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!url) {
    return (
      <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
          image_not_supported
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className="w-10 h-10 rounded-lg bg-error-container border border-error/30 flex items-center justify-center flex-shrink-0"
        title="Não foi possível carregar a imagem"
      >
        <span className="material-symbols-outlined text-error text-[20px]">
          broken_image
        </span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg bg-surface border border-outline-variant overflow-hidden flex-shrink-0">
      <img
        className="w-full h-full object-cover"
        src={url}
        alt={name}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
