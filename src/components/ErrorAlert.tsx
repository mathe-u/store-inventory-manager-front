export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({
  title = "Algo deu errado",
  message,
  onRetry,
}: ErrorAlertProps) {
  return (
    <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 flex items-center gap-3">
      <span className="material-symbols-outlined text-error text-[24px] flex-shrink-0">
        error
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-label-sm font-semibold">{title}</p>
        <p className="font-body-md text-sm mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-auto flex-shrink-0 px-3 py-1.5 rounded-lg border border-error text-error font-label-sm text-label-sm hover:bg-error hover:text-on-error transition-colors cursor-pointer"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
