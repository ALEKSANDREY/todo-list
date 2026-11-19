import { useEffect, useState } from 'react';
import registerSW from '../../utils/registerSW.js';

/**
 * Registers the service worker and shows a fixed bottom banner when a new
 * version is waiting to take over.
 */
export default function UpdatePrompt() {
  const [applyUpdate, setApplyUpdate] = useState(null);

  useEffect(() => {
    registerSW(setApplyUpdate);
  }, []);

  if (!applyUpdate) return null;

  const handleRefresh = () => {
    applyUpdate();
    // Give the new worker a moment to take over, then reload into the update.
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-[90] flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white/95 px-4 py-3 shadow-xl shadow-indigo-500/10 backdrop-blur dark:border-indigo-900/60 dark:bg-slate-900/95"
    >
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        A new version is available.
      </p>
      <button
        type="button"
        onClick={handleRefresh}
        className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 active:bg-indigo-700"
      >
        Refresh
      </button>
    </div>
  );
}
