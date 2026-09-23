export default function TablePagination() {
  return (
    <div className="px-6 py-4 border-t border-outline-variant/60 bg-background/75 flex items-center justify-center sm:justify-end text-xs text-on-surface-variant font-medium">
      <div className="flex items-center gap-1.5">
        <button
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant-2/60 bg-surface-container-lowest cursor-not-allowed transition-colors"
          disabled
          type="button"
        >
          Anterior
        </button>

        <button
          className="w-8 h-8 rounded-lg bg-secondary text-on-secondary font-bold flex items-center justify-center shadow-sm cursor-pointer"
          type="button"
        >
          1
        </button>

        <button
          className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low font-medium flex items-center justify-center transition-colors cursor-pointer"
          type="button"
        >
          2
        </button>

        <button
          className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low font-medium flex items-center justify-center transition-colors cursor-pointer"
          type="button"
        >
          3
        </button>

        <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant font-medium select-none">
          ...
        </span>

        <button
          className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low font-medium flex items-center justify-center transition-colors cursor-pointer"
          type="button"
        >
          10
        </button>

        <button
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low font-medium transition-colors cursor-pointer"
          type="button"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
