import { CircleAlert, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-sun/30 bg-white/5 p-5 text-white backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-sun" />
        <p className="min-w-0 text-sm [overflow-wrap:anywhere]">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
        Tentar novamente
      </button>
    </div>
  );
}
