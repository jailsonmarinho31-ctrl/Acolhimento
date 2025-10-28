import React, { useState } from 'react';
import type { Person } from '../types';
import { ArchiveReason } from '../types';
import { XMarkIcon, SpinnerIcon } from './Icons';

interface ArchiveReasonModalProps {
    person: Person;
    onClose: () => void;
    onConfirm: (personId: string, reason: ArchiveReason) => Promise<any>;
}

export const ArchiveReasonModal: React.FC<ArchiveReasonModalProps> = ({ person, onClose, onConfirm }) => {
    const [reason, setReason] = useState<ArchiveReason | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (reason && !isSubmitting) {
            setIsSubmitting(true);
            await onConfirm(person.id, reason);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="archive-modal-title"
                className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md"
            >
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="archive-modal-title" className="text-xl font-bold">Arquivar {person.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar modal">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="archive_reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Por favor, selecione o motivo para arquivar esta pessoa:
                        </label>
                        <select
                            id="archive_reason"
                            name="archive_reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value as ArchiveReason)}
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-600"
                        >
                            <option value="" disabled>Selecione um motivo...</option>
                            {Object.values(ArchiveReason).map(reasonValue => (
                                <option key={reasonValue} value={reasonValue}>{reasonValue}</option>
                            ))}
                        </select>
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!reason || isSubmitting}
                        className="inline-flex justify-center items-center w-48 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <SpinnerIcon className="h-5 w-5" /> : 'Confirmar Arquivamento'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
