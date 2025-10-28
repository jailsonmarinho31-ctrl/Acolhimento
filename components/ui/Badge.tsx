import React from 'react';
import { Urgency } from '../../types';

interface BadgeProps {
  urgency: Urgency;
}

const urgencyColors: Record<Urgency, string> = {
  'Baixa': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'Normal': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  'Alta': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Urgente': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

export const Badge: React.FC<BadgeProps> = ({ urgency }) => {
  return (
    <span className={`px-3 py-1 text-xs font-semibold leading-none rounded-full ${urgencyColors[urgency]}`}>
      {urgency}
    </span>
  );
};