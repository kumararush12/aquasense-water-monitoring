/**
 * AquaSense Toast Notification Banner
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { NotificationToast } from '../types/water';

interface ToastProps {
  toasts: NotificationToast[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-cyan-500" />;
        let borderClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
          borderClass = 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
          borderClass = 'border-amber-200 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-500" />;
          borderClass = 'border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm text-xs font-medium animate-in slide-in-from-bottom-2 fade-in duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
