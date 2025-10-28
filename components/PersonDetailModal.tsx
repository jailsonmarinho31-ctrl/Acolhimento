import React, { useState, useEffect, useMemo } from 'react';
import type { Person, User, Touchpoint, Note, ActivityLog } from '../types';
import { UserRole, TouchpointType, MaritalStatus, ArchiveReason } from '../types';
import { mockStages, mockJourneys, mockUsers, mockAttachments } from '../data/mockData';
import { generateNextBestAction } from '../services/geminiService';
import { XMarkIcon, SparklesIcon, PaperClipIcon, ChatBubbleLeftEllipsisIcon, PhoneArrowUpRightIcon, MapPinIcon, UsersIcon, ChatBubbleLeftRightIcon, DocumentMagnifyingGlassIcon, PencilSquareIcon, ArrowRightCircleIcon, PencilIcon, ArchiveBoxIcon, SpinnerIcon } from './Icons';
import { Badge } from './ui/Badge';

interface PersonDetailModalProps {
  person: Person;
  onClose: () => void;
  currentUser: User;
  touchpoints: Touchpoint[];
  notes: Note[];
  activityLogs: ActivityLog[];
  onAddInteraction: (personId: string, body: string, type: TouchpointType | 'Note', confidential?: boolean) => Promise<any>;
  onUpdatePersonDetails: (personId: string, updatedDetails: Partial<Person>) => Promise<any>;
  onStartArchive: (person: Person) => void;
}

const NextBestAction: React.FC<{person: Person, touchpoints: Touchpoint[]}> = ({ person, touchpoints }) => {
    const [action, setAction] = useState('Analisando...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAction = async () => {
            const stage = mockStages.find(s => s.id === person.stage_id)!;
            const journey = mockJourneys.find(j => j.id === person.journey_id)!;
            const lastTouchpoint = touchpoints.sort((a,b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];

            setLoading(true);
            const generatedAction = await generateNextBestAction(person, stage, journey, lastTouchpoint?.at);
            setAction(generatedAction);
            setLoading(false);
        };

        fetchAction();
    }, [person, touchpoints]);

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Próxima Melhor Ação (sugerida por IA)
            </h3>
            <p className={`mt-2 text-yellow-700 dark:text-yellow-300 ${loading ? 'animate-pulse' : ''}`}>{action}</p>
        </div>
    )
}

const AddInteraction: React.FC<{personId: string, onAddInteraction: PersonDetailModalProps['onAddInteraction'], currentUser: User}> = ({ personId, onAddInteraction, currentUser }) => {
    const [body, setBody] = useState('');
    const [type, setType] = useState<TouchpointType | 'Note'>(currentUser.role === UserRole.Usuario ? 'Note' : TouchpointType.WhatsApp);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const canAddAllInteractionTypes = currentUser.role === UserRole.Pastor || currentUser.role === UserRole.Lider;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (body.trim() && !isSubmitting) {
            setIsSubmitting(true);
            await onAddInteraction(personId, body.trim(), type);
            setBody('');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center"><PencilSquareIcon className="h-5 w-5 mr-2"/>Adicionar Interação</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500"
                    placeholder="Descreva o contato, visita ou anotação..."
                />
                <div className="flex items-center justify-between mt-2">
                    {canAddAllInteractionTypes ? (
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as TouchpointType | 'Note')}
                            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value={TouchpointType.WhatsApp}>WhatsApp</option>
                            <option value={TouchpointType.Ligacao}>Ligação</option>
                            <option value={TouchpointType.Visita}>Visita</option>
                            <option value={TouchpointType.Encontro}>Encontro</option>
                            <option value="Note">Nota</option>
                        </select>
                    ) : (
                        <span className="text-sm font-medium p-2 bg-slate-200 dark:bg-slate-700 rounded-md">Tipo: Nota</span>
                    )}
                    <button type="submit" disabled={!body.trim() || isSubmitting} className="w-24 inline-flex justify-center items-center bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400">
                         {isSubmitting ? <SpinnerIcon className="h-5 w-5" /> : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    )
};


const InteractionsTimeline: React.FC<{notes: Note[], touchpoints: Touchpoint[], currentUser: User}> = ({notes, touchpoints, currentUser}) => {
    const historyItems = useMemo(() => {
        const touchpointItems = touchpoints.map(t => ({
                id: t.id,
                type: 'touchpoint' as const,
                subType: t.type,
                at: new Date(t.at),
                authorId: t.author_id,
                body: t.body,
            }));
        
        const noteItems = notes.map(n => ({
                id: n.id,
                type: 'note' as const,
                at: new Date(n.at),
                authorId: n.author_id,
                body: n.body,
                confidential: n.confidential,
            }));
            
        const allItems = [...touchpointItems, ...noteItems];
        return allItems.sort((a, b) => b.at.getTime() - a.at.getTime());
    }, [notes, touchpoints]);

    const getIcon = (item: typeof historyItems[0]) => {
        if (item.type === 'note') return <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-white" />;
        switch (item.subType) {
            case TouchpointType.Ligacao: return <PhoneArrowUpRightIcon className="h-5 w-5 text-white" />;
            case TouchpointType.Visita: return <MapPinIcon className="h-5 w-5 text-white" />;
            case TouchpointType.Encontro: return <UsersIcon className="h-5 w-5 text-white" />;
            default: return <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-white" />;
        }
    }

    const getTitle = (item: typeof historyItems[0]) => {
        if (item.type === 'note') return 'Nota Adicionada';
        return item.subType;
    }
    
    if (historyItems.length === 0) {
        return <p className="text-gray-500 p-4 text-center">Nenhuma interação registrada.</p>;
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {historyItems.map((item, itemIdx) => {
                    const author = mockUsers.find(u => u.id === item.authorId);
                    const canViewConfidential = currentUser.role === UserRole.Pastor;
                    const isConfidential = 'confidential' in item && item.confidential;
                    const bodyToShow = isConfidential && !canViewConfidential ? '[Nota confidencial - Apenas para Pastor]' : item.body;

                    return (
                        <li key={item.id}>
                            <div className="relative pb-8">
                                {itemIdx !== historyItems.length - 1 ? (
                                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    <img className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white dark:ring-gray-900" src={`https://i.pravatar.cc/150?u=${author?.id}`} alt={author?.name} />
                                    <div className="min-w-0 flex-1">
                                        <div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900 dark:text-white">{author?.name || 'Sistema'}</p>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                                {getTitle(item)} em {item.at.toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                            <p>{bodyToShow}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

const ActivityLogTimeline: React.FC<{activityLogs: ActivityLog[], person: Person}> = ({ activityLogs, person }) => {
    if (activityLogs.length === 0) {
        return <p className="text-gray-500 p-4 text-center">Nenhum histórico de atividades.</p>;
    }
    return (
         <div className="flow-root">
            <ul className="-mb-8">
                {activityLogs.map((log, logIdx) => {
                    const author = mockUsers.find(u => u.id === log.user_id);
                    return (
                        <li key={log.id}>
                            <div className="relative pb-8">
                                {logIdx !== activityLogs.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className={`bg-gray-400 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900`}>
                                            <ArrowRightCircleIcon className="h-5 w-5 text-white" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-medium text-gray-900 dark:text-white">{author?.name || 'Sistema'}</span> {log.details.toLowerCase()}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            <time dateTime={log.at}>{new Date(log.at).toLocaleDateString('pt-BR')}</time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}


export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({ person, onClose, currentUser, touchpoints, notes, activityLogs, onAddInteraction, onUpdatePersonDetails, onStartArchive }) => {
  const journey = mockJourneys.find(j => j.id === person.journey_id);
  const stage = mockStages.find(s => s.id === person.stage_id);
  
  const [activeTab, setActiveTab] = useState('informacoes');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editablePerson, setEditablePerson] = useState<Person>(person);
  
  const leaders = mockUsers.filter(u => u.role === UserRole.Lider || u.role === UserRole.Usuario);
  
  const canManagePerson = currentUser.role === UserRole.Pastor || currentUser.role === UserRole.Lider;

  useEffect(() => {
    setEditablePerson(person);
  }, [person]);

  const attachments = mockAttachments.filter(a => a.person_id === person.id);

  const calculateAge = (birthDateString?: string): number => {
    if (!birthDateString) return 0;
    try {
        const birthDate = new Date(birthDateString);
        const today = new Date();
        if (isNaN(birthDate.getTime())) return 0;
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : 0;
    } catch (e) {
        return 0;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    console.log('Uploading file:', selectedFile.name);
    alert(`Arquivo "${selectedFile.name}" enviado com sucesso! (simulação)`);
    setSelectedFile(null);
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'birth_date') {
        const newAge = calculateAge(value);
        setEditablePerson(prev => ({...prev, birth_date: value, age: newAge}));
        return;
    }

    let finalValue: string | number | boolean | undefined = value;
    if (name === 'age') {
        finalValue = parseInt(value, 10) || 0;
    }
     if (name === 'accepts_visit') {
        finalValue = value === 'true';
    }
    setEditablePerson(prev => ({...prev, [name]: finalValue}));
  }
  
  const handleSave = async () => {
    setIsSaving(true);
    await onUpdatePersonDetails(person.id, editablePerson);
    setIsSaving(false);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditablePerson(person);
    setIsEditing(false);
  }
  
  const TabButton: React.FC<{tabName: string; label: string; icon: React.ReactNode}> = ({tabName, label, icon}) => (
    <button
        onClick={() => setActiveTab(tabName)}
        role="tab"
        aria-selected={activeTab === tabName}
        className={`${
        activeTab === tabName
            ? 'border-red-500 text-red-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
        } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
    >
        {icon}
        <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-detail-modal-title"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[95vh] flex flex-col"
      >
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <div>
                <h2 id="person-detail-modal-title" className="text-2xl font-bold">{person.name}</h2>
                <p className="text-sm text-gray-500">{journey?.name} / {person.is_archived ? 'Arquivado' : stage?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="w-40 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400">
                             {isSaving ? <SpinnerIcon className="h-5 w-5" /> : 'Salvar Alterações'}
                        </button>
                    </>
                ) : (
                    <>
                      {canManagePerson && !person.is_archived && (
                        <button onClick={() => onStartArchive(person)} className="flex items-center bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <ArchiveBoxIcon className="h-4 w-4 mr-2"/>
                            Arquivar
                        </button>
                      )}
                      {canManagePerson && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <PencilIcon className="h-4 w-4 mr-2"/>
                            Editar
                        </button>
                      )}
                    </>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Fechar modal">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
        </header>
        <main className="p-6 flex-1 overflow-y-auto">
            {!isEditing && !person.is_archived && canManagePerson && <NextBestAction person={person} touchpoints={touchpoints} />}
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8" role="tablist" aria-label="Tabs">
                <TabButton tabName="informacoes" label="Informações" icon={<UsersIcon className="h-5 w-5"/>} />
                <TabButton tabName="interacoes" label="Interações" icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} />
                <TabButton tabName="historico" label="Histórico" icon={<DocumentMagnifyingGlassIcon className="h-5 w-5"/>} />
                <TabButton tabName="anexos" label="Anexos" icon={<PaperClipIcon className="h-5 w-5" />} />
              </nav>
            </div>

            <div role="tabpanel" tabIndex={0} hidden={activeTab !== 'informacoes'}>
              {activeTab === 'informacoes' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {isEditing ? (
                        <>
                            <div className="md:col-span-2">
                                <label className="font-bold">Endereço:</label>
                                <input type="text" name="address" value={editablePerson.address} onChange={handleEditChange} className="mt-1 block w-full input-style"/>
                            </div>
                            <div>
                                <label className="font-bold">Telefone:</label>
                                <input type="tel" name="phone" value={editablePerson.phone} onChange={handleEditChange} className="mt-1 block w-full input-style"/>
                            </div>
                            <div>
                                <label className="font-bold">Data de Nasc.:</label>
                                <input type="date" name="birth_date" value={editablePerson.birth_date ? editablePerson.birth_date.split('T')[0] : ''} onChange={handleEditChange} className="mt-1 block w-full input-style"/>
                            </div>
                             <div>
                                <label className="font-bold">Idade:</label>
                                <input type="number" name="age" value={editablePerson.age} onChange={handleEditChange} className="mt-1 block w-full input-style bg-slate-100 dark:bg-slate-700 cursor-not-allowed" disabled/>
                            </div>
                            <div>
                                <label className="font-bold">Estado Civil:</label>
                                <select name="marital_status" value={editablePerson.marital_status} onChange={handleEditChange} className="mt-1 block w-full input-style">
                                    {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Responsável:</label>
                                <select name="responsible_id" value={editablePerson.responsible_id} onChange={handleEditChange} className="mt-1 block w-full input-style">
                                    {leaders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Convidado por:</label>
                                <input type="text" name="invited_by" value={editablePerson.invited_by || ''} onChange={handleEditChange} className="mt-1 block w-full input-style"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="font-bold">Aceita Visita:</label>
                                <div className="mt-1 space-x-4">
                                    <label><input type="radio" name="accepts_visit" value="true" checked={editablePerson.accepts_visit === true} onChange={handleEditChange} className="mr-1"/> Sim</label>
                                    <label><input type="radio" name="accepts_visit" value="false" checked={editablePerson.accepts_visit === false} onChange={handleEditChange} className="mr-1"/> Não</label>
                                </div>
                            </div>
                            {editablePerson.accepts_visit && <div className="md:col-span-2">
                                <label className="font-bold">Disponibilidade:</label>
                                <input type="text" name="visit_availability" value={editablePerson.visit_availability || ''} onChange={handleEditChange} className="mt-1 block w-full input-style"/>
                            </div>}
                             <style>{`.input-style { border-radius: 0.375rem; border: 1px solid #D1D5DB; padding: 0.5rem 0.75rem; background-color: #fff; } .dark .input-style { background-color: #374151; border-color: #4B5563; }`}</style>
                        </>
                    ) : (
                         <>
                            <p><strong>Idade:</strong> {person.age} anos</p>
                            <p><strong>Telefone:</strong> {person.phone}</p>
                            <p><strong>Data de Nasc.:</strong> {person.birth_date ? new Date(person.birth_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</p>
                            <p><strong>Estado Civil:</strong> {person.marital_status || 'N/A'}</p>
                            <p className="md:col-span-2"><strong>Endereço:</strong> {person.address}</p>
                            <p><strong>Responsável:</strong> {mockUsers.find(u=>u.id === person.responsible_id)?.name}</p>
                            <p><strong>Convidado por:</strong> {person.invited_by || 'N/A'}</p>
                            <p><strong>Decisão em:</strong> {new Date(person.decision_date).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Aceita Visita:</strong> {person.accepts_visit === undefined ? 'N/A' : (person.accepts_visit ? 'Sim' : 'Não')}</p>
                            {person.accepts_visit && <p className="md:col-span-2"><strong>Disponibilidade:</strong> {person.visit_availability || 'N/A'}</p>}
                            <div className="mt-2 md:col-span-2"><strong>Urgência:</strong> <Badge urgency={person.urgency} /></div>
                            {person.is_archived && <p className="md:col-span-2 text-blue-600 dark:text-blue-400"><strong>Motivo do Arquivamento:</strong> {person.archive_reason}</p>}
                        </>
                    )}
                </div>
              )}
            </div>
            <div role="tabpanel" tabIndex={0} hidden={activeTab !== 'interacoes'}>
              {activeTab === 'interacoes' && (
                  <div>
                    {!person.is_archived && <AddInteraction personId={person.id} onAddInteraction={onAddInteraction} currentUser={currentUser} />}
                    <InteractionsTimeline notes={notes} touchpoints={touchpoints} currentUser={currentUser}/>
                  </div>
              )}
            </div>
            <div role="tabpanel" tabIndex={0} hidden={activeTab !== 'historico'}>
              {activeTab === 'historico' && (
                  <ActivityLogTimeline activityLogs={activityLogs} person={person} />
              )}
            </div>
            <div role="tabpanel" tabIndex={0} hidden={activeTab !== 'anexos'}>
              {activeTab === 'anexos' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4 text-lg">Adicionar Novo Anexo</h3>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        Escolher Arquivo
                      </label>
                      <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                      {selectedFile && <span className="text-sm text-gray-600 dark:text-gray-300">{selectedFile.name}</span>}
                      <button
                        onClick={handleUpload}
                        disabled={!selectedFile}
                        className="ml-auto bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Salvar Anexo
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4 text-lg">Anexos Existentes</h3>
                    {attachments.length > 0 ? (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {attachments.map(attachment => (
                          <li key={attachment.id} className="p-4 flex justify-between items-center">
                            <div className="flex items-center">
                              <PaperClipIcon className="h-5 w-5 mr-3 text-gray-400" />
                              <div>
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-md font-medium text-red-600 hover:underline">{attachment.name}</a>
                                <p className="text-sm text-gray-500">Adicionado em {new Date(attachment.at).toLocaleDateString('pt-BR')}</p>
                              </div>
                            </div>
                             <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700">Ver</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">Nenhum anexo encontrado para esta pessoa.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
        </main>
      </div>
    </div>
  );
};