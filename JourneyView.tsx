import React, { useState, useMemo } from 'react';
// FIX: Import User type.
import type { Journey, Person, User } from '../types';
import { KanbanBoard } from './KanbanBoard';
import { PeopleTable } from './PeopleTable';
import { mockStages, mockUsers } from '../data/mockData';
// FIX: Import UserRole enum.
import { Urgency, UserRole } from '../types';
import { Squares2X2Icon, TableCellsIcon, ArrowDownTrayIcon, EyeIcon, EyeSlashIcon } from './Icons';

interface JourneyViewProps {
  journey: Journey;
  people: Person[];
  onSelectPerson: (person: Person) => void;
  onUpdatePersonStage: (personId: string, newStageId: string) => void;
  onUpdatePersonUrgency: (personId: string, newUrgency: Urgency) => void;
  onDeletePerson: (personId: string) => void;
  onStartArchive: (person: Person) => void;
  onUnarchivePerson: (personId: string) => void;
  // FIX: Added missing currentUser prop.
  currentUser: User;
}

// FIX: Added currentUser to props destructuring.
export const JourneyView: React.FC<JourneyViewProps> = ({ journey, people, onSelectPerson, onUpdatePersonStage, onUpdatePersonUrgency, onDeletePerson, onStartArchive, onUnarchivePerson, currentUser }) => {
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showArchived, setShowArchived] = useState(false);

  const stages = mockStages
    .filter(s => s.journey_id === journey.id)
    .sort((a, b) => a.order - b.order);
    
  // FIX: Correctly filter for both Lider and Usuario roles.
  const leaders = mockUsers.filter(u => u.role === UserRole.Lider || u.role === UserRole.Usuario);

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const responsibleMatch = responsibleFilter === 'all' || person.responsible_id === responsibleFilter;
      const urgencyMatch = urgencyFilter === 'all' || person.urgency === urgencyFilter;
      return responsibleMatch && urgencyMatch;
    });
  }, [people, responsibleFilter, urgencyFilter]);

  const activePeople = useMemo(() => {
    return filteredPeople.filter(p => !p.is_archived);
  }, [filteredPeople]);

  const archivedPeople = useMemo(() => {
      return filteredPeople.filter(p => p.is_archived);
  }, [filteredPeople]);

  const handleExport = () => {
    const headers = ['Nome', 'Responsável', 'Estágio', 'Urgência', 'Data da Decisão', 'Telefone', 'Endereço', 'Arquivado'];
    
    const csvContent = [
        headers.join(','),
        ...filteredPeople.map(person => { // Export all filtered people (active and archived)
            const responsible = mockUsers.find(u => u.id === person.responsible_id)?.name || 'N/A';
            const stage = mockStages.find(s => s.id === person.stage_id)?.name || 'N/A';
            const row = [
                `"${person.name}"`,
                `"${responsible}"`,
                `"${stage}"`,
                person.urgency,
                new Date(person.decision_date).toLocaleDateString('pt-BR'),
                `"${person.phone}"`,
                `"${person.address}"`,
                person.is_archived ? 'Sim' : 'Não'
            ];
            return row.join(',');
        })
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${journey.name.toLowerCase().replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">{journey.name}</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            {/* Filtros */}
            <div className="flex items-center space-x-4">
                <div>
                    <label htmlFor="responsible-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Responsável:</label>
                    <select
                        id="responsible-filter"
                        value={responsibleFilter}
                        onChange={(e) => setResponsibleFilter(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    >
                        <option value="all">Todos</option>
                        {leaders.map(leader => (
                            <option key={leader.id} value={leader.id}>{leader.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="urgency-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Urgência:</label>
                    <select
                        id="urgency-filter"
                        value={urgencyFilter}
                        onChange={(e) => setUrgencyFilter(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    >
                        <option value="all">Todas</option>
                        {Object.values(Urgency).map(urgency => (
                            <option key={urgency} value={urgency}>{urgency}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Controles de Visualização e Exportação */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('kanban')}
                        title="Visualização Kanban"
                        className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-800 shadow text-red-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        title="Visualização em Lista"
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-red-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        <TableCellsIcon className="h-5 w-5" />
                    </button>
                </div>
                {viewMode === 'kanban' && (
                  <button
                      onClick={() => setShowArchived(prev => !prev)}
                      title={showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}
                      className="flex items-center bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-medium py-2 px-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                      {showArchived ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      <span className="hidden sm:inline ml-2">{showArchived ? 'Ocultar' : 'Arquivados'}</span>
                  </button>
                )}
                <button 
                  onClick={handleExport}
                  className="flex items-center bg-green-600 text-white font-bold py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span className="hidden sm:inline ml-2">Exportar</span>
                </button>
            </div>
        </div>
      </div>
      
      {viewMode === 'kanban' ? (
         <KanbanBoard
            stages={stages}
            people={activePeople}
            archivedPeople={archivedPeople}
            showArchived={showArchived}
            onSelectPerson={onSelectPerson}
            onUpdatePersonStage={onUpdatePersonStage}
            onUpdatePersonUrgency={onUpdatePersonUrgency}
            onDeletePerson={onDeletePerson}
            onStartArchive={onStartArchive}
            onUnarchivePerson={onUnarchivePerson}
            // FIX: Pass currentUser prop to KanbanBoard.
            currentUser={currentUser}
          />
      ) : (
        <PeopleTable 
            people={activePeople}
            onSelectPerson={onSelectPerson}
        />
      )}
    </div>
  );
};
