import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-5 text-white backdrop-blur-md"
    >
      <LoaderCircle
        aria-hidden="true"
        className="h-5 w-5 shrink-0 animate-spin text-accent-400 motion-reduce:animate-none"
      />
      <p className="min-w-0 text-sm [overflow-wrap:anywhere]">{message}</p>
    </div>
  );
}
