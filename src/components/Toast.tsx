import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { ToastItem } from '../types';
import { useFlowStore } from '../store/useFlowStore';

const TOAST_DURATION = 4000;

const iconProps = { size: 18, strokeWidth: 1.75 };
const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

function ToastItemComponent({ id, message, type }: ToastItem) {
  const removeToast = useFlowStore((s) => s.removeToast);
  const Icon = icons[type];

  useEffect(() => {
    const t = setTimeout(() => removeToast(id), TOAST_DURATION);
    return () => clearTimeout(t);
  }, [id, removeToast]);

  const bg =
    type === 'success'
      ? 'bg-[var(--color-success)]/12 text-[var(--color-success)] border-[var(--color-success)]/20'
      : type === 'error'
        ? 'bg-[var(--color-danger)]/12 text-[var(--color-danger)] border-[var(--color-danger)]/20'
        : 'bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] text-[var(--text-secondary)] border-[var(--border-color)]';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] border shadow-[var(--shadow-dropdown)] ${bg} transition-[var(--transition-base)]`}
      style={{ minWidth: '260px' }}
      role="status"
    >
      <Icon {...iconProps} className="shrink-0" />
      <span className="text-[13px] font-medium flex-1">{message}</span>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="p-1.5 rounded-[var(--radius-sm)] hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-[var(--transition-fast)]"
        aria-label="Dismiss"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function Toast() {
  const toasts = useFlowStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItemComponent key={t.id} {...t} />
      ))}
    </div>
  );
}
