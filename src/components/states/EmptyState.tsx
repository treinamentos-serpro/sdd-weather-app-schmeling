import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  hint = 'Tente buscar outra cidade.',
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-white backdrop-blur-md">
      <SearchX aria-hidden="true" className="mb-3 h-6 w-6 text-accent-400" />
      <h2 className="text-lg font-semibold [overflow-wrap:anywhere]">{title}</h2>
      <p className="mt-1 text-sm text-white/70 [overflow-wrap:anywhere]">{hint}</p>
    </div>
  );
}
