import React, { useState } from 'react';
// FIX: Import User type
import type { Stage, Person, User } from '../types';
import { PersonCard } from './PersonCard';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
// FIX: Import UserRole enum
import { Urgency, UserRole } from '../types';
import { EmptyState } from './ui/EmptyState';
import { UsersIcon, ChevronDownIcon } from './Icons';


interface KanbanBoardProps {
  stages: Stage[];
  people: Person[];
  archivedPeople: Person[];
  showArchived: boolean;
  onSelectPerson: (person: Person) => void;
  onUpdatePersonStage: (personId: string, newStageId: string) => void;
  onUpdatePersonUrgency: (personId: string, newUrgency: Urgency) => void;
  onDeletePerson: (personId: string) => void;
  onStartArchive: (person: Person) => void;
  onUnarchivePerson: (personId: string) => void;
  // FIX: Add currentUser prop for permission checking
  currentUser: User;
}

// FIX: Add currentUser to props destructuring
export const KanbanBoard: React.FC<KanbanBoardProps> = ({ stages, people, archivedPeople, showArchived, onSelectPerson, onUpdatePersonStage, onUpdatePersonUrgency, onDeletePerson, onStartArchive, onUnarchivePerson, currentUser }) => {
  const [openMobileColumn, setOpenMobileColumn] = useState<string | null>(stages[0]?.id || null);

  // FIX: Add canDrag logic based on user role
  const canDrag = currentUser.role === UserRole.Pastor || currentUser.role === UserRole.Lider;

  const handleOnDragEnd = (result: DropResult) => {
    // FIX: Check for destination and canDrag permission
    if (!result.destination || !canDrag) return;

    const { source, destination, draggableId } = result;
    const allPeople = [...people, ...archivedPeople];
    const person = allPeople.find(p => p.id === draggableId);

    if (!person) return;

    // Card moved to the archive column -> trigger modal
    if (destination.droppableId === 'arquivados' && source.droppableId !== 'arquivados') {
        onStartArchive(person);
        return;
    }
    
    // Card moved from the archive column back to a stage
    if (source.droppableId === 'arquivados' && destination.droppableId !== 'arquivados') {
        onUnarchivePerson(draggableId);
        onUpdatePersonStage(draggableId, destination.droppableId);
        return;
    }

    // Card moved between regular stages
    if (source.droppableId !== destination.droppableId) {
      onUpdatePersonStage(draggableId, destination.droppableId);
    }
  };

  const MobileAccordionItem: React.FC<{title: string, peopleList: Person[], id: string}> = ({title, peopleList, id}) => {
    const isOpen = openMobileColumn === id;
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenMobileColumn(isOpen ? null : id)}
              className="w-full flex justify-between items-center p-4 bg-white dark:bg-slate-800"
              aria-expanded={isOpen}
            >
              <h3 className="font-semibold text-md">{title}</h3>
              <span className="flex items-center space-x-2">
                <span className="text-sm font-normal bg-slate-200 dark:bg-slate-700 rounded-full px-2 py-0.5">
                  {peopleList.length}
                </span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {isOpen && (
              <div className="p-2 space-y-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                {peopleList.length > 0 ? (
                  peopleList.map(person => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      onSelectPerson={onSelectPerson}
                      isDragging={false} // D&D disabled on mobile
                      onUpdatePersonUrgency={onUpdatePersonUrgency}
                      onDeletePerson={onDeletePerson}
                      onStartArchive={onStartArchive}
                      // FIX: Pass currentUser to PersonCard
                      currentUser={currentUser}
                    />
                  ))
                ) : (
                  <EmptyState 
                    icon={<UsersIcon className="h-6 w-6 text-slate-400" />}
                    title="Estágio Vazio"
                    message="Nenhuma pessoa neste estágio."
                  />
                )}
              </div>
            )}
        </div>
    );
  };


  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const peopleInStage = people.filter(p => p.stage_id === stage.id);
              return (
                <Droppable key={stage.id} droppableId={stage.id} isDropDisabled={!canDrag}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-shrink-0 w-80 bg-slate-100 dark:bg-slate-800/50 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-red-100 dark:bg-red-900/50' : ''}`}
                    >
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-md flex justify-between items-center">
                          {stage.name}
                          <span className="text-sm font-normal bg-slate-300 dark:bg-slate-700 rounded-full px-2 py-0.5">
                            {peopleInStage.length}
                          </span>
                        </h3>
                      </div>
                      <div className="p-2 space-y-2 h-[calc(100vh-220px)] overflow-y-auto">
                        {peopleInStage.length > 0 ? peopleInStage.map((person, index) => (
                          <Draggable key={person.id} draggableId={person.id} index={index} isDragDisabled={!canDrag}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{...provided.draggableProps.style}}
                              >
                                <PersonCard
                                  person={person}
                                  onSelectPerson={onSelectPerson}
                                  isDragging={snapshot.isDragging}
                                  onUpdatePersonUrgency={onUpdatePersonUrgency}
                                  onDeletePerson={onDeletePerson}
                                  onStartArchive={onStartArchive}
                                  // FIX: Pass currentUser to PersonCard
                                  currentUser={currentUser}
                                />
                              </div>
                            )}
                          </Draggable>
                        )) : (
                          <EmptyState 
                            icon={<UsersIcon className="h-6 w-6 text-slate-400" />}
                            title="Estágio Vazio"
                            message="Nenhuma pessoa neste estágio."
                          />
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}

            {showArchived && (
                <Droppable droppableId="arquivados" isDropDisabled={!canDrag}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-shrink-0 w-80 bg-slate-100 dark:bg-slate-800/50 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                    >
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-md flex justify-between items-center">
                          Arquivados
                          <span className="text-sm font-normal bg-slate-300 dark:bg-slate-700 rounded-full px-2 py-0.5">
                            {archivedPeople.length}
                          </span>
                        </h3>
                      </div>
                      <div className="p-2 space-y-2 h-[calc(100vh-220px)] overflow-y-auto">
                        {archivedPeople.map((person, index) => (
                          <Draggable key={person.id} draggableId={person.id} index={index} isDragDisabled={!canDrag}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{...provided.draggableProps.style}}
                              >
                                <PersonCard
                                  person={person}
                                  onSelectPerson={onSelectPerson}
                                  isDragging={snapshot.isDragging}
                                  onUpdatePersonUrgency={onUpdatePersonUrgency}
                                  onDeletePerson={onDeletePerson}
                                  onStartArchive={onStartArchive}
                                  // FIX: Pass currentUser to PersonCard
                                  currentUser={currentUser}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
            )}
          </div>
        </DragDropContext>
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden space-y-2">
        {stages.map(stage => (
          <MobileAccordionItem 
            key={stage.id}
            id={stage.id}
            title={stage.name}
            peopleList={people.filter(p => p.stage_id === stage.id)}
          />
        ))}
        {showArchived && (
          <MobileAccordionItem
            id="arquivados"
            title="Arquivados"
            peopleList={archivedPeople}
          />
        )}
      </div>
    </>
  );
};
