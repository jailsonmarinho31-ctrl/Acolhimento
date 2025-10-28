import React from 'react';
import type { Journey, User } from '../types';
import { UserRole } from '../types';
import { HeartIcon } from './Icons';
import { HomeIcon, UserPlusIcon, ArrowPathIcon, UserGroupIcon, ChartPieIcon } from './Icons';

interface SidebarProps {
  currentView: string;
  onSetView: (view: string) => void;
  journeys: Journey[];
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSetView, journeys, currentUser }) => {
  const journeyLinks = journeys.map(j => ({
    id: `journey-${j.id}`,
    name: j.name.replace('Jornada ', ''),
    icon: j.id === 'novo-convertido' ? UserPlusIcon : j.id === 'reconciliacao' ? HeartIcon : ArrowPathIcon,
  }));

  const navLinks = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, roles: [UserRole.Pastor, UserRole.Lider, UserRole.Usuario] },
    ...journeyLinks.map(j => ({ ...j, roles: [UserRole.Pastor, UserRole.Lider, UserRole.Usuario] })),
    { id: 'users', name: 'Gerenciar Usuários', icon: UserGroupIcon, roles: [UserRole.Pastor] },
    { id: 'reports', name: 'Relatórios', icon: ChartPieIcon, roles: [UserRole.Pastor, UserRole.Lider] },
  ];
  
  const visibleLinks = navLinks.filter(link => link.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 flex flex-col border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-red-500" />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-400 text-transparent bg-clip-text">
                Acolher
            </span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {visibleLinks.map(link => (
            <li key={link.id}>
              <button
                onClick={() => onSetView(link.id)}
                className={`w-full flex items-center p-3 text-base font-semibold rounded-lg transition-all group ${
                  currentView === link.id
                    ? 'bg-gradient-to-r from-red-500 to-orange-400 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <link.icon className="h-6 w-6" />
                <span className="ml-3">{link.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};