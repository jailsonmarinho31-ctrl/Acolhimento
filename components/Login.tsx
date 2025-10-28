import React from 'react';
import { HeartIcon } from './Icons';
import { mockUsers } from '../data/mockData';
import { UserRole } from '../types';
import type { User } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {

    const handleGoogleLogin = () => {
        // Simula o retorno de um login bem-sucedido com o usuário Pastor.
        // Em uma aplicação real, aqui seria o callback do fluxo OAuth do Google.
        const pastorUser = mockUsers.find(u => u.role === UserRole.Pastor);
        if (pastorUser) {
            onLogin(pastorUser);
        } else {
            alert("Usuário Pastor não encontrado nos dados de simulação.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-sm p-8 space-y-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl text-center">
                <div className="flex justify-center">
                     <HeartIcon className="h-20 w-20 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    Sistema de Acolhimento
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Faça login para continuar e gerenciar a jornada dos novos membros.
                </p>
                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full inline-flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                    <svg className="w-4 h-auto mr-3" width="46" height="47" viewBox="0 0 46 47" fill="none">
                        <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.3184C35.7664 30.8801 34.1357 33.373 31.6361 35.0019V40.8191H38.6558C43.3556 36.4741 46 30.8282 46 24.0287Z" fill="#4285F4" />
                        <path d="M23.4694 47C29.8061 47 35.1161 44.9144 38.6558 40.8191L31.6361 35.0019C29.4955 36.4283 26.7158 37.3319 23.4694 37.3319C17.7011 37.3319 12.7801 33.5653 11.0807 28.2887H3.90991V34.1825C7.45953 41.6247 14.8698 47 23.4694 47Z" fill="#34A853" />
                        <path d="M11.0807 28.2887C10.5181 26.66 10.2311 24.8918 10.2311 23.05C10.2311 21.2082 10.5181 19.4399 11.0807 17.8112V11.9175H3.90991C1.43215 16.7359 0 21.6155 0 27.05C0 32.4845 1.43215 37.3641 3.90991 42.1825L11.0807 36.2887V28.2887Z" fill="#FBBC05" />
                        <path d="M23.4694 8.76818C27.0094 8.76818 29.9881 10.0336 32.4284 12.3336L38.8132 5.94886C35.1028 2.61227 29.8061 0 23.4694 0C14.8698 0 7.45953 5.37532 3.90991 12.8175L11.0807 18.7112C12.7801 13.4347 17.7011 8.76818 23.4694 8.76818Z" fill="#EB4335" />
                    </svg>
                    Entrar com Google
                </button>
            </div>
        </div>
    );
};