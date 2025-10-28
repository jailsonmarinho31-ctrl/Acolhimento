import React, { useState } from 'react';
import { mockJourneys, mockUsers } from '../data/mockData';
import type { NewPersonData } from '../types';
import { Sex, UserRole, MaritalStatus } from '../types';
import { XMarkIcon, SpinnerIcon } from './Icons';

interface AddPersonModalProps {
    onClose: () => void;
    onAddPerson: (person: NewPersonData) => Promise<any>;
}

const today = new Date().toISOString().split('T')[0];

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ onClose, onAddPerson }) => {
    // FIX: Updated filter to include 'Usuario' as they can also be responsible for people.
    const leaders = mockUsers.filter(u => u.role === UserRole.Lider || u.role === UserRole.Usuario);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        sex: Sex.Masculino,
        age: '',
        phone: '',
        address: '',
        invited_by: '',
        journey_id: mockJourneys[0]?.id || '',
        responsible_id: leaders[0]?.id || '',
        decision_date: today,
        marital_status: MaritalStatus.Solteiro,
        birth_date: '',
        accepts_visit: 'nao',
        visit_availability: '',
    });

    const calculateAge = (birthDateString: string): string => {
        if (!birthDateString) return '';
        try {
            const birthDate = new Date(birthDateString);
            const today = new Date();
            if (isNaN(birthDate.getTime())) return '';
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 0 ? age.toString() : '';
        } catch (e) {
            return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'birth_date') {
            const newAge = calculateAge(value);
            setFormData(prev => ({ ...prev, birth_date: value, age: newAge }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const isFormValid = formData.name.trim() !== '' && formData.phone.trim() !== '' && formData.age.trim() !== '' && formData.journey_id && formData.responsible_id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) {
            alert('Por favor, preencha todos os campos obrigatórios (*).');
            return;
        }
        
        setIsSubmitting(true);
        const personData: NewPersonData = {
           ...formData,
           age: parseInt(formData.age, 10),
           accepts_visit: formData.accepts_visit === 'sim',
        };
        
        await onAddPerson(personData);
        // O modal é fechado pelo App.tsx, então não precisamos resetar isSubmitting
    };

    const inputStyle = "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-600";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="add-person-modal-title"
                className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            >
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="add-person-modal-title" className="text-2xl font-bold">Adicionar Nova Pessoa</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar modal">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo *</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle}/>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Celular / WhatsApp *</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputStyle}/>
                            </div>
                             <div>
                                <label htmlFor="sex" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sexo</label>
                                <select id="sex" name="sex" value={formData.sex} onChange={handleChange} className={inputStyle}>
                                    <option value={Sex.Masculino}>Masculino</option>
                                    <option value={Sex.Feminino}>Feminino</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Nascimento</label>
                                <input type="date" name="birth_date" id="birth_date" value={formData.birth_date} onChange={handleChange} className={inputStyle}/>
                            </div>
                             <div>
                                <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Idade *</label>
                                <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className={`${inputStyle} bg-slate-100 dark:bg-slate-700 cursor-not-allowed`} disabled/>
                            </div>
                            <div>
                                <label htmlFor="marital_status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado Civil</label>
                                <select id="marital_status" name="marital_status" value={formData.marital_status} onChange={handleChange} className={inputStyle}>
                                    {Object.values(MaritalStatus).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Endereço</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputStyle}/>
                        </div>
                        <div>
                            <label htmlFor="invited_by" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Convidado(a) por</label>
                            <input type="text" name="invited_by" id="invited_by" value={formData.invited_by} onChange={handleChange} className={inputStyle}/>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="journey_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jornada *</label>
                                <select id="journey_id" name="journey_id" value={formData.journey_id} onChange={handleChange} required className={inputStyle}>
                                    {mockJourneys.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="responsible_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Responsável Inicial *</label>
                                <select id="responsible_id" name="responsible_id" value={formData.responsible_id} onChange={handleChange} required className={inputStyle}>
                                    <option value="" disabled>Selecione um líder</option>
                                    {leaders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>

                         <div>
                            <label htmlFor="decision_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Decisão/Contato</label>
                            <input type="date" name="decision_date" id="decision_date" value={formData.decision_date} onChange={handleChange} className={inputStyle}/>
                        </div>

                        <div className="pt-2">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Aceita visita?</label>
                            <div className="mt-2 flex items-center space-x-6">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="accepts_visit"
                                        value="sim"
                                        checked={formData.accepts_visit === 'sim'}
                                        onChange={handleChange}
                                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-slate-300"
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Sim</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="accepts_visit"
                                        value="nao"
                                        checked={formData.accepts_visit === 'nao'}
                                        onChange={handleChange}
                                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-slate-300"
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Não</span>
                                </label>
                            </div>
                        </div>
                        
                        {formData.accepts_visit === 'sim' && (
                            <div>
                                <label htmlFor="visit_availability" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Qual o melhor horário para visita?</label>
                                <input
                                    type="text"
                                    name="visit_availability"
                                    id="visit_availability"
                                    value={formData.visit_availability}
                                    onChange={handleChange}
                                    placeholder="Ex: Finais de semana, à tarde"
                                    className={inputStyle}
                                />
                            </div>
                        )}
                        
                        <div className="pt-4 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                                Cancelar
                            </button>
                            <button type="submit" disabled={!isFormValid || isSubmitting} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed">
                                {isSubmitting ? <SpinnerIcon className="h-5 w-5" /> : 'Salvar Pessoa'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};