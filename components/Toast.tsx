/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-24 md:bottom-32 right-6 z-[100] pointer-events-none flex flex-col gap-2 max-w-sm w-full sm:w-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/95',
          border: 'border-emerald-500/50',
          shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          icon: '✨',
          iconBg: 'bg-emerald-500/20 text-emerald-300',
        };
      case 'warning':
        return {
          bg: 'bg-rose-950/95',
          border: 'border-rose-500/50',
          shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
          icon: '⚠️',
          iconBg: 'bg-rose-500/20 text-rose-300',
        };
      default:
        return {
          bg: 'bg-indigo-950/95',
          border: 'border-amber-500/40',
          shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          icon: '📜',
          iconBg: 'bg-amber-500/20 text-amber-300',
        };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      layout
      className={`pointer-events-auto flex items-center justify-between gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 ${style.bg} ${style.border} ${style.shadow} backdrop-blur-md max-w-sm`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg md:rounded-xl flex items-center justify-center font-sans ${style.iconBg} text-sm md:text-base border border-current/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]`}>
          {style.icon}
        </div>
        <p className="text-white text-xs md:text-sm font-semibold font-serif tracking-wide leading-snug">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        aria-label="Dismiss Notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};
