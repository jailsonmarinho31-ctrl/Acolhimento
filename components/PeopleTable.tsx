import React from 'react';
import type { Person } from '../types';
import { mockUsers, mockStages } from '../data/mockData';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { DocumentPlusIcon } from './Icons';

interface PeopleTableProps {
    people: Person[];
    onSelectPerson: (person: Person) => void;
}

export const PeopleTable: React.FC<PeopleTableProps> = ({ people, onSelectPerson }) => {
    if (people.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <EmptyState 
                    icon={<DocumentPlusIcon className="h-8 w-8 text-slate-400" />}
                    title="Nenhuma Pessoa Encontrada"
                    message="Nenhuma pessoa corresponde aos filtros selecionados. Tente ajustar sua busca."
                />
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Nome</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Responsável</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Estágio Atual</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Urgência</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Data Decisão</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {people.map(person => {
                        const responsible = mockUsers.find(u => u.id === person.responsible_id);
                        const stage = mockStages.find(s => s.id === person.stage_id);

                        return (
                            <tr key={person.id} onClick={() => onSelectPerson(person)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{person.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                            <img className="h-8 w-8 rounded-full" src={`https://i.pravatar.cc/150?u=${responsible?.id}`} alt={responsible?.name} />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm text-slate-900 dark:text-slate-200">{responsible?.name || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{stage?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge urgency={person.urgency} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                                    {new Date(person.decision_date).toLocaleDateString('pt-BR')}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};