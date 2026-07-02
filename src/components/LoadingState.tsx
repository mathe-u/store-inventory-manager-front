export interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Carregando...",
}: LoadingStateProps) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
      <span className="material-symbols-outlined text-secondary text-[48px] animate-spin">
        progress_activity
      </span>
      <p className="font-body-md text-on-surface-variant">{message}</p>
    </div>
  );
}
