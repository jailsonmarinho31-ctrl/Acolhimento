import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, children }) => {
  return (
    <div className="text-center p-6 sm:p-8 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};
