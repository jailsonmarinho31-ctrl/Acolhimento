import React from 'react';
import type { Person, User, Notification, ActivityLog } from '../types';
import { Urgency } from '../types';
import { mockUsers, mockJourneys, mockStages } from '../data/mockData';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { UsersIcon, UserPlusIcon, HeartIcon, ArrowPathIcon, ClockIcon, ClipboardDocumentListIcon, DocumentMagnifyingGlassIcon, DocumentPlusIcon } from './Icons';
import { PieChart } from './PieChart';

interface DashboardProps {
  people: Person[];
  currentUser: User;
  onSelectPerson: (person: Person) => void;
  notifications: Notification[];
  activityLogs: ActivityLog[];
}

const getDaysDifference = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

const NotificationsTimeline: React.FC<{ notifications: Notification[], onSelectPerson: (person: Person) => void, people: Person[] }> = ({ notifications, onSelectPerson, people }) => {
    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><ClipboardDocumentListIcon className="h-6 w-6 mr-3 text-red-500"/>Notificações de Prazo</h3>
             <ol className="relative border-l border-slate-200 dark:border-slate-700">
                {notifications.map(item => {
                    const person = people.find(p => p.id === item.person_id);
                    return (
                        <li key={item.id} className="mb-6 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-red-100 rounded-full -left-3 ring-8 ring-white dark:ring-slate-900 dark:bg-red-900">
                                <ClockIcon className="w-4 h-4 text-red-800 dark:text-red-300" />
                            </span>
                            <h4 className="flex items-center mb-1 font-semibold text-slate-900 dark:text-white">
                                {item.title}
                            </h4>
                            <time className="block mb-2 text-sm font-normal leading-none text-slate-400 dark:text-slate-500">
                                {new Date(item.at).toLocaleString('pt-BR')}
                            </time>
                            <p className="mb-2 text-base font-normal text-slate-500 dark:text-slate-400">
                                {item.description}
                            </p>
                            {person && (
                                <button
                                    onClick={() => onSelectPerson(person)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-slate-200 focus:text-red-700 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600 dark:hover:text-white dark:hover:bg-slate-700 dark:focus:ring-slate-700"
                                >
                                    Ver Pessoa <svg className="w-3 h-3 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                </button>
                            )}
                        </li>
                    )
                })}
            </ol>
        </div>
    );
}

const RecentActivityTimeline: React.FC<{ activityLogs: ActivityLog[], people: Person[], users: User[], onSelectPerson: (person: Person) => void }> = ({ activityLogs, people, users, onSelectPerson }) => {
    
    const recentLogs = activityLogs
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 30);

    if (recentLogs.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
                <DocumentMagnifyingGlassIcon className="h-6 w-6 mr-3 text-red-500" />
                Últimas Alterações
            </h3>
            <div className="max-h-96 overflow-y-auto pr-2">
                <ol className="relative border-l border-slate-200 dark:border-slate-700">
                    {recentLogs.map(log => {
                        const person = people.find(p => p.id === log.person_id);
                        const user = users.find(u => u.id === log.user_id);
                        if (!person || !user) return null;

                        return (
                            <li key={log.id} className="mb-4 ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-slate-900 dark:bg-blue-900">
                                    <img className="rounded-full w-6 h-6 object-cover" src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                                </span>
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>{' '}
                                        {log.details.toLowerCase()} em{' '}
                                        <button onClick={() => onSelectPerson(person)} className="font-semibold text-red-600 hover:underline">
                                            {person.name}
                                        </button>.
                                    </p>
                                    <time className="block text-xs font-normal text-slate-400 dark:text-slate-500 mt-1">
                                        {new Date(log.at).toLocaleString('pt-BR')}
                                    </time>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ people, currentUser, onSelectPerson, notifications, activityLogs }) => {

  const stats = {
    total: people.filter(p => !p.is_archived).length,
    novoConvertido: people.filter(p => p.journey_id === 'novo-convertido' && !p.is_archived).length,
    reconciliacao: people.filter(p => p.journey_id === 'reconciliacao' && !p.is_archived).length,
    reativacao: people.filter(p => p.journey_id === 'reativacao' && !p.is_archived).length,
  };

  const urgentPeople = people
    .filter(p => !p.is_archived && (p.urgency === Urgency.Urgente || p.urgency === Urgency.Alta))
    .sort((a, b) => (a.urgency === Urgency.Urgente ? -1 : 1));

  const overduePeople = people
    .filter(p => !p.is_archived && p.first_visit_due && new Date(p.first_visit_due) < new Date())
    .sort((a,b) => new Date(a.first_visit_due!).getTime() - new Date(b.first_visit_due!).getTime());

  const chartedJourneyIds = ['novo-convertido', 'reconciliacao', 'reativacao'];

  const chartDataByJourney = chartedJourneyIds.map(journeyId => {
    const journey = mockJourneys.find(j => j.id === journeyId)!;
    const peopleInJourney = people.filter(p => p.journey_id === journeyId && !p.is_archived);
    const stagesInJourney = mockStages.filter(s => s.journey_id === journeyId);

    const data = stagesInJourney.map(stage => {
        const count = peopleInJourney.filter(p => p.stage_id === stage.id).length;
        return { label: stage.name, value: count };
    }).filter(item => item.value > 0);

    return {
        title: journey.name,
        data,
    };
  });

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-105">
      {icon}
      <div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
      </div>
    </div>
  );

  const PersonListCard: React.FC<{title: string; peopleList: Person[]; isOverdue?: boolean; emptyState: React.ReactNode}> = ({title, peopleList, isOverdue = false, emptyState}) => (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          {peopleList.length === 0 ? emptyState : (
            <ul className="space-y-3 max-h-80 overflow-y-auto">
                {peopleList.map(person => {
                    const responsible = mockUsers.find(u => u.id === person.responsible_id);
                    const daysOverdue = isOverdue && person.first_visit_due ? getDaysDifference(person.first_visit_due) : 0;
                    return (
                        <li key={person.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={`https://i.pravatar.cc/150?u=${responsible?.id}`}
                                    alt={responsible?.name}
                                />
                                <div>
                                    <button onClick={() => onSelectPerson(person)} className="text-md font-semibold text-red-600 hover:underline">{person.name}</button>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Responsável: {responsible?.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                               <Badge urgency={person.urgency} />
                               {isOverdue && daysOverdue > 0 && (
                                   <p className="text-xs text-red-500 mt-1 flex items-center justify-end">
                                        <ClockIcon className="h-4 w-4 mr-1"/>
                                        {daysOverdue} dia(s) atrasado
                                    </p>
                               )}
                            </div>
                        </li>
                    )
                })}
            </ul>
          )}
      </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo de volta, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Aqui está um resumo do trabalho de acolhimento.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total em Acompanhamento" value={stats.total} icon={<UsersIcon className="h-8 w-8 text-blue-500"/>} />
        <StatCard title="Novos Convertidos" value={stats.novoConvertido} icon={<UserPlusIcon className="h-8 w-8 text-green-500"/>} />
        <StatCard title="Reconciliações" value={stats.reconciliacao} icon={<HeartIcon className="h-8 w-8 text-red-500"/>} />
        <StatCard title="Reativações" value={stats.reativacao} icon={<ArrowPathIcon className="h-8 w-8 text-yellow-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonListCard 
            title="Pessoas com Urgência" 
            peopleList={urgentPeople} 
            emptyState={
                <EmptyState 
                    icon={<UsersIcon className="h-8 w-8 text-slate-400"/>}
                    title="Tudo em Ordem"
                    message="Nenhuma pessoa marcada com urgência alta ou crítica no momento."
                />
            }
          />
          <PersonListCard 
            title="1ª Visita Atrasada" 
            peopleList={overduePeople} 
            isOverdue 
            emptyState={
                <EmptyState 
                    icon={<ClockIcon className="h-8 w-8 text-slate-400"/>}
                    title="Nenhum Atraso"
                    message="Ótimo trabalho! Nenhuma primeira visita está atrasada."
                />
            }
          />
      </div>

      <NotificationsTimeline notifications={notifications} onSelectPerson={onSelectPerson} people={people} />

      <RecentActivityTimeline 
        activityLogs={activityLogs} 
        people={people} 
        users={mockUsers} 
        onSelectPerson={onSelectPerson} 
      />

      <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Distribuição por Jornada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chartDataByJourney.map(chart => (
                  <PieChart key={chart.title} title={chart.title} data={chart.data} />
              ))}
          </div>
      </div>

    </div>
  );
};
