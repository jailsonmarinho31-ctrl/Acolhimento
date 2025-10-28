import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import type { NewUserData } from '../types';
import { UserRole } from '../types';
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon, SpinnerIcon } from './Icons';

interface UserManagementProps {
    users: User[];
    onAddUser: (user: NewUserData) => Promise<any>;
    onUpdateUser: (userId: string, updatedData: Partial<Omit<User, 'id'>>) => Promise<any>;
    onDeleteUser: (userId: string) => void;
    currentUser: User;
}

interface AddUserModalProps {
    onClose: () => void;
    onAddUser: (user: NewUserData) => Promise<any>;
    currentUser: User;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser, currentUser }) => {
    const [formData, setFormData] = useState<NewUserData>({ name: '', email: '', role: UserRole.Lider });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputStyle = "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-600";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email && !isSubmitting) {
            setIsSubmitting(true);
            await onAddUser(formData);
            onClose();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-user-modal-title"
                className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md"
            >
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="add-user-modal-title" className="text-xl font-bold">Adicionar Novo Usuário</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar modal">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle}/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputStyle}/>
                        </div>
                         <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil de Acesso</label>
                            <select name="role" id="role" value={formData.role} onChange={handleChange} required className={inputStyle}>
                                {currentUser.role === UserRole.Pastor && <option value={UserRole.Pastor}>Pastor</option>}
                                <option value={UserRole.Lider}>Líder</option>
                                <option value={UserRole.Usuario}>Usuário</option>
                            </select>
                        </div>
                    </main>
                    <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="w-28 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 disabled:from-slate-400">
                            {isSubmitting ? <SpinnerIcon className="h-5 w-5"/> : 'Salvar'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onUpdateUser: (userId: string, updatedData: Partial<Omit<User, 'id'>>) => Promise<any>;
    currentUser: User;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUpdateUser, currentUser }) => {
    const [formData, setFormData] = useState({ name: user.name, email: user.email, role: user.role });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputStyle = "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-600";


    useEffect(() => {
        setFormData({ name: user.name, email: user.email, role: user.role });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email && !isSubmitting) {
            setIsSubmitting(true);
            await onUpdateUser(user.id, formData);
            onClose();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-user-modal-title"
                className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md"
            >
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="edit-user-modal-title" className="text-xl font-bold">Editar Usuário</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar modal">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle}/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputStyle}/>
                        </div>
                         <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil de Acesso</label>
                            <select name="role" id="role" value={formData.role} onChange={handleChange} required className={inputStyle}>
                                {currentUser.role === UserRole.Pastor && <option value={UserRole.Pastor}>Pastor</option>}
                                <option value={UserRole.Lider}>Líder</option>
                                <option value={UserRole.Usuario}>Usuário</option>
                            </select>
                        </div>
                    </main>
                    <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="w-40 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 disabled:from-slate-400">
                            {isSubmitting ? <SpinnerIcon className="h-5 w-5" /> : 'Salvar Alterações'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, currentUser }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Adicione ou visualize os usuários com acesso ao sistema.</p>
                </div>
                {currentUser.role === UserRole.Pastor && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg hover:from-red-600 hover:to-orange-500 transition-all shadow hover:shadow-md"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Adicionar Usuário
                    </button>
                )}
            </div>
            
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">E-mail</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Função</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full" src={`https://i.pravatar.cc/150?u=${user.id}`} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.Pastor ? 'bg-red-100 text-red-800' : user.role === UserRole.Lider ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {currentUser.role === UserRole.Pastor && user.id !== currentUser.id && (
                                        <div className="flex items-center justify-end space-x-4">
                                            <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 flex items-center">
                                                <PencilIcon className="h-4 w-4 mr-1"/>
                                                Editar
                                            </button>
                                            <button onClick={() => onDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 flex items-center">
                                                <TrashIcon className="h-4 w-4 mr-1"/>
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <AddUserModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onAddUser={onAddUser}
                    currentUser={currentUser}
                />
            )}

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdateUser={onUpdateUser}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};