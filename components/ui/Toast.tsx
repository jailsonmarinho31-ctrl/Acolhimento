import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '../Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // O toast desaparecerá após 4 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  const containerClasses = isSuccess
    ? 'bg-green-50 border-green-300 dark:bg-green-900/50 dark:border-green-700'
    : 'bg-red-50 border-red-300 dark:bg-red-900/50 dark:border-red-700';
  
  const iconClasses = isSuccess ? 'text-green-500' : 'text-red-500';
  const textClasses = isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';

  return (
    <div 
        role="status"
        aria-live="polite"
        className={`fixed top-5 right-5 z-[100] max-w-sm w-full p-4 rounded-lg border shadow-lg animate-fade-in-down ${containerClasses}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isSuccess ? <CheckCircleIcon className={`h-6 w-6 ${iconClasses}`} /> : <XCircleIcon className={`h-6 w-6 ${iconClasses}`} />}
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className={`text-sm font-medium ${textClasses}`}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={onClose} className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSuccess ? 'hover:bg-green-100 dark:hover:bg-green-800 focus:ring-green-600' : 'hover:bg-red-100 dark:hover:bg-red-800 focus:ring-red-600'}`}>
            <span className="sr-only">Fechar</span>
            <XMarkIcon className={`h-5 w-5 ${textClasses}`} />
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-down {
            0% {
                opacity: 0;
                transform: translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.5s ease-out forwards;
        }
    `}</style>
    </div>
  );
};
