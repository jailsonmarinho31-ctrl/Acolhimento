import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import { ChevronDownIcon, PlusIcon, ArrowRightOnRectangleIcon, BellIcon, MagnifyingGlassIcon } from './Icons';

interface HeaderProps {
  currentUser: User;
  onAddPersonClick: () => void;
  onLogout: () => void;
  notificationCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onAddPersonClick, onLogout, notificationCount, searchTerm, onSearchChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const canAddPerson = currentUser.role === UserRole.Pastor || currentUser.role === UserRole.Lider;

  return (
    <header className="flex items-center justify-between h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6">
       <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-red-500 focus:border-red-500 transition-all"
              aria-label="Buscar pessoa por nome"
          />
      </div>
      <div className="flex items-center space-x-4">
        {canAddPerson && (
            <button
              onClick={onAddPersonClick}
              className="flex items-center bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg hover:from-red-600 hover:to-orange-500 transition-all shadow hover:shadow-md"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Adicionar Pessoa</span>
            </button>
        )}
        <button
          className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label={`Notificações: ${notificationCount} novas`}
        >
          <BellIcon className="h-6 w-6" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-800" />
          )}
        </button>
        <div className="relative" ref={dropdownRef}>
            <button 
                id="user-menu-button"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="flex items-center focus:outline-none p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
                <div className="text-right">
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.role}</p>
                </div>
                <img
                className="h-10 w-10 rounded-full object-cover ml-3"
                src={`https://i.pravatar.cc/150?u=${currentUser.id}`}
                alt={currentUser.name}
                />
                <ChevronDownIcon className={`h-5 w-5 ml-1 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div 
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl py-1 z-20 border border-slate-200 dark:border-slate-700"
                >
                    <button
                        role="menuitem"
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Sair
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};