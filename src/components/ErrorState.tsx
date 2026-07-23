interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Erro ao carregar os dados",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="bg-error-container/60 p-5 rounded-full mb-4 flex items-center justify-center">
        <span className="material-symbols-outlined text-error text-4xl">
          warning
        </span>
      </div>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-2 font-semibold">
        {title}
      </h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-inverse-surface transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            refresh
          </span>
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
