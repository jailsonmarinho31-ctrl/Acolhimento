import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { JourneyView } from './components/JourneyView';
import { UserManagement } from './components/UserManagement';
import { AddPersonModal } from './components/AddPersonModal';
import { ArchiveReasonModal } from './components/ArchiveReasonModal';
import { PersonDetailModal } from './components/PersonDetailModal';
import { ReportsView } from './components/ReportsView';
import { Toast } from './components/ui/Toast';
import {
  mockUsers,
  mockPeople,
  mockJourneys,
  mockStages,
  mockNotes,
  mockTouchpoints,
  mockActivityLogs,
  mockNotifications
} from './data/mockData';
import type { User, Person, NewPersonData, Touchpoint, Note, ActivityLog, Notification, NewUserData, Journey } from './types';
import { UserRole, TouchpointType, ArchiveReason, Urgency } from './types';

type View = 'dashboard' | 'journey-novo-convertido' | 'journey-reconciliacao' | 'journey-reativacao' | 'users' | 'reports';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // State for data
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [people, setPeople] = useState<Person[]>(mockPeople);
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>(mockTouchpoints);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  // UI State
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [personToArchive, setPersonToArchive] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addActivityLog = (personId: string, details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      person_id: personId,
      user_id: currentUser.id,
      at: new Date().toISOString(),
      details: details,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleAddPerson = (personData: NewPersonData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newPerson: Person = {
              ...personData,
              id: `person-${Date.now()}`,
              created_at: new Date().toISOString(),
              stage_id: mockJourneys.find(j => j.id === personData.journey_id)?.id === 'novo-convertido' ? 'contato-inicial' : 'acolhimento-inicial',
              urgency: Urgency.Normal,
              is_archived: false,
              first_visit_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };
            setPeople(prev => [newPerson, ...prev]);
            addActivityLog(newPerson.id, `adicionou ${newPerson.name}`);
            setIsAddPersonModalOpen(false);
            showToast('Pessoa adicionada com sucesso!', 'success');
            resolve(true);
        }, 1000);
    });
  };

  const handleUpdatePersonStage = (personId: string, newStageId: string) => {
    const stageName = mockStages.find(s => s.id === newStageId)?.name || newStageId;
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, stage_id: newStageId } : p));
    addActivityLog(personId, `moveu para o estágio "${stageName}"`);
  };
  
  const handleUpdatePersonUrgency = (personId: string, newUrgency: Person['urgency']) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, urgency: newUrgency } : p));
    addActivityLog(personId, `alterou a urgência para ${newUrgency}`);
    showToast('Urgência da pessoa atualizada!', 'success');
  };

  const handleDeletePerson = (personId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pessoa permanentemente? Esta ação não pode ser desfeita.')) {
        setTimeout(() => {
            setPeople(prev => prev.filter(p => p.id !== personId));
            showToast('Pessoa excluída com sucesso.', 'success');
        }, 500);
    }
  };

  const handleStartArchive = (person: Person) => {
      setPersonToArchive(person);
      setIsArchiveModalOpen(true);
      setSelectedPerson(null);
  };

  const handleConfirmArchive = (personId: string, reason: ArchiveReason) => {
      return new Promise(resolve => {
        setTimeout(() => {
            setPeople(prev => prev.map(p => p.id === personId ? { ...p, is_archived: true, archive_reason: reason, stage_id: 'arquivado' } : p));
            addActivityLog(personId, `arquivado com o motivo: ${reason}`);
            setIsArchiveModalOpen(false);
            setPersonToArchive(null);
            showToast('Pessoa arquivada com sucesso!', 'success');
            resolve(true);
        }, 1000);
      });
  };
  
  const handleUnarchivePerson = (personId: string) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, is_archived: false, archive_reason: undefined, journey_id: p.journey_id || 'novo-convertido', stage_id: 'contato-inicial' } : p));
    addActivityLog(personId, 'foi desarquivado');
    showToast('Pessoa desarquivada com sucesso!', 'success');
  };

  const handleAddInteraction = (personId: string, body: string, type: TouchpointType | 'Note', confidential?: boolean) => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (!currentUser) return resolve(false);

            if (type === 'Note') {
              const newNote: Note = { id: `note-${Date.now()}`, person_id: personId, author_id: currentUser.id, at: new Date().toISOString(), body, confidential: confidential || false };
              setNotes(prev => [...prev, newNote]);
            } else {
              const newTouchpoint: Touchpoint = { id: `touch-${Date.now()}`, person_id: personId, author_id: currentUser.id, at: new Date().toISOString(), body, type };
              setTouchpoints(prev => [...prev, newTouchpoint]);
            }
            setSelectedPerson(prev => (prev ? { ...people.find(p => p.id === personId)! } : null));
            showToast('Interação adicionada com sucesso!', 'success');
            resolve(true);
        }, 700);
    });
  };
  
  const handleUpdatePersonDetails = (personId: string, updatedDetails: Partial<Person>) => {
    return new Promise(resolve => {
        setTimeout(() => {
            setPeople(prev => prev.map(p => p.id === personId ? { ...p, ...updatedDetails } : p));
            setSelectedPerson(prev => (prev ? { ...prev, ...updatedDetails } : null));
            addActivityLog(personId, 'atualizou os detalhes');
            showToast('Detalhes da pessoa atualizados!', 'success');
            resolve(true);
        }, 1000);
    });
  };

  const handleAddUser = (userData: NewUserData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newUser: User = { ...userData, id: `user-${Date.now()}` };
            setUsers(prev => [newUser, ...prev]);
            showToast('Novo usuário adicionado com sucesso!', 'success');
            resolve(true);
        }, 800);
    });
  };

  const handleUpdateUser = (userId: string, updatedData: Partial<Omit<User, 'id'>>) => {
     return new Promise(resolve => {
        setTimeout(() => {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
            showToast('Usuário atualizado com sucesso!', 'success');
            resolve(true);
        }, 800);
    });
  };

  const onDeleteUser = (userId: string) => {
     setTimeout(() => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast('Usuário excluído com sucesso!', 'success');
    }, 500);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  const filteredPeople = people.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderView = () => {
    const journey = mockJourneys.find(j => `journey-${j.id}` === currentView);
    if (journey) {
      return (
        <JourneyView
          journey={journey}
          people={filteredPeople.filter(p => p.journey_id === journey.id)}
          onSelectPerson={setSelectedPerson}
          onUpdatePersonStage={handleUpdatePersonStage}
          onUpdatePersonUrgency={handleUpdatePersonUrgency}
          onDeletePerson={handleDeletePerson}
          onStartArchive={handleStartArchive}
          onUnarchivePerson={handleUnarchivePerson}
          currentUser={currentUser}
        />
      );
    }
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                  people={filteredPeople} 
                  currentUser={currentUser} 
                  onSelectPerson={setSelectedPerson} 
                  notifications={notifications}
                  activityLogs={activityLogs}
                />;
      case 'users':
        return <UserManagement 
                currentUser={currentUser}
                users={users} 
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={onDeleteUser}
              />;
      case 'reports':
        return <ReportsView 
                people={people}
                activityLogs={activityLogs}
                users={users}
                journeys={mockJourneys}
                stages={mockStages}
               />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Sidebar
        currentView={currentView}
        onSetView={(view) => setCurrentView(view as View)}
        journeys={mockJourneys}
        currentUser={currentUser}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          currentUser={currentUser}
          onAddPersonClick={() => setIsAddPersonModalOpen(true)}
          onLogout={handleLogout}
          notificationCount={notifications.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {isAddPersonModalOpen && (
        <AddPersonModal
          onClose={() => setIsAddPersonModalOpen(false)}
          onAddPerson={handleAddPerson}
        />
      )}
      {isArchiveModalOpen && personToArchive && (
          <ArchiveReasonModal
              person={personToArchive}
              onClose={() => setIsArchiveModalOpen(false)}
              onConfirm={handleConfirmArchive}
          />
      )}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          currentUser={currentUser}
          touchpoints={touchpoints.filter(t => t.person_id === selectedPerson.id)}
          notes={notes.filter(n => n.person_id === selectedPerson.id)}
          activityLogs={activityLogs.filter(a => a.person_id === selectedPerson.id)}
          onAddInteraction={handleAddInteraction}
          onUpdatePersonDetails={handleUpdatePersonDetails}
          onStartArchive={handleStartArchive}
        />
      )}
    </div>
  );
};

export default App;