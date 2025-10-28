import React, { useState, useRef, useEffect } from 'react';
import type { Person, User } from '../types';
import { Urgency, UserRole } from '../types';
import { mockUsers } from '../data/mockData';
import { Badge } from './ui/Badge';
import { PhoneIcon, EllipsisVerticalIcon, TrashIcon, ArchiveBoxIcon } from './Icons';

interface PersonCardProps {
  person: Person;
  onSelectPerson: (person: Person) => void;
  isDragging: boolean;
  onUpdatePersonUrgency: (personId: string, newUrgency: Urgency) => void;
  onDeletePerson: (personId: string) => void;
  onStartArchive: (person: Person) => void;
  currentUser: User;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person, onSelectPerson, isDragging, onUpdatePersonUrgency, onDeletePerson, onStartArchive, currentUser }) => {
  const responsible = mockUsers.find(u => u.id === person.responsible_id);
  const daysSinceCreation = Math.ceil((new Date().getTime() - new Date(person.created_at).getTime()) / (1000 * 3600 * 24));
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const canManagePerson = currentUser.role === UserRole.Pastor || currentUser.role === UserRole.Lider;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUrgencyChange = (newUrgency: Urgency) => {
    onUpdatePersonUrgency(person.id, newUrgency);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = () => {
    onDeletePerson(person.id);
    setIsMenuOpen(false);
  }

  return (
    <div
      onClick={() => onSelectPerson(person)}
      className={`bg-white dark:bg-slate-900 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all relative border-l-4 ${
        person.urgency === Urgency.Urgente ? 'border-red-500' :
        person.urgency === Urgency.Alta ? 'border-yellow-500' :
        person.urgency === Urgency.Normal ? 'border-green-500' :
        'border-blue-500'
      } ${isDragging ? 'shadow-2xl scale-105' : 'shadow-md'}`}
    >
      <div className="flex justify-between items-start">
        <div className="pr-8">
            <h4 className="font-bold text-lg">{person.name}</h4>
        </div>
        {!person.is_archived && <Badge urgency={person.urgency} />}
      </div>

      {canManagePerson && (
        <div className="absolute top-2 right-2">
              <button
                  aria-label={`Opções para ${person.name}`}
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                  onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(prev => !prev);
                  }}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                  <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
              {isMenuOpen && (
                  <div ref={menuRef} role="menu" className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                      {!person.is_archived && (
                          <>
                              <div className="px-3 py-2 text-xs font-semibold text-gray-500">Alterar Urgência</div>
                              {Object.values(Urgency).map(urgency => (
                                  <button
                                      key={urgency}
                                      role="menuitem"
                                      onClick={(e) => { e.stopPropagation(); handleUrgencyChange(urgency); }}
                                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                  <span className={`h-2 w-2 rounded-full mr-3 ${
                                      urgency === Urgency.Baixa ? 'bg-blue-500' :
                                      urgency === Urgency.Normal ? 'bg-green-500' :
                                      urgency === Urgency.Alta ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></span>
                                  {urgency}
                                  </button>
                              ))}
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          </>
                      )}
                      
                      {!person.is_archived && (
                          <button
                              role="menuitem"
                              onClick={(e) => { e.stopPropagation(); onStartArchive(person); setIsMenuOpen(false); }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                              <ArchiveBoxIcon className="h-4 w-4 mr-3" />
                              Arquivar
                          </button>
                      )}

                       <button
                          role="menuitem"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
                      >
                          <TrashIcon className="h-4 w-4 mr-3" />
                          Excluir
                      </button>
                  </div>
              )}
          </div>
        )}

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Responsável: {responsible?.name || 'Não definido'}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Há {daysSinceCreation} dia(s)
      </p>
      <div className="flex justify-end mt-2">
        <a href={`https://wa.me/${person.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
           onClick={(e) => e.stopPropagation()}
           aria-label={`Enviar mensagem no WhatsApp para ${person.name}`}
           className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 text-green-500">
             <PhoneIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};
