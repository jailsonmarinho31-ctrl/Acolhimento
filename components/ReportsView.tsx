import React, { useMemo } from 'react';
import type { Person, ActivityLog, User, Journey, Stage } from '../types';
import { ArchiveReason, UserRole } from '../types';
import { ChartPieIcon, ArrowTrendingUpIcon, UserCircleIcon, FunnelIcon, ArchiveBoxIcon, ArrowDownTrayIcon } from './Icons';

interface ReportsViewProps {
    people: Person[];
    activityLogs: ActivityLog[];
    users: User[];
    journeys: Journey[];
    stages: Stage[];
}

// Helper function to create and download CSV
const exportToCsv = (filename: string, headers: string[], data: (string | number)[][]) => {
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

interface ReportCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    onExport?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, icon, children, className = '', onExport }) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
                {icon}
                <span className="ml-3">{title}</span>
            </h3>
            {onExport && (
                <button 
                    onClick={onExport}
                    title={`Exportar dados de ${title}`}
                    className="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                    aria-label={`Exportar dados de ${title}`}
                >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
            )}
        </div>
        <div>{children}</div>
    </div>
);

export const ReportsView: React.FC<ReportsViewProps> = ({ people, activityLogs, users, journeys, stages }) => {
    
    // 1. Tempo médio que uma pessoa leva para completar cada jornada.
    const avgCompletionTime = useMemo(() => {
        const integratedLogs = activityLogs.filter(log => log.details.includes(ArchiveReason.Integrado));
        const completionTimes: { [journeyId: string]: number[] } = {};

        integratedLogs.forEach(log => {
            const person = people.find(p => p.id === log.person_id);
            if (person) {
                const startDate = new Date(person.created_at).getTime();
                const endDate = new Date(log.at).getTime();
                // FIX: Explicitly cast to Number to resolve potential type inference issues.
                const diffDays = Math.ceil((Number(endDate) - Number(startDate)) / (1000 * 3600 * 24));
                
                if (!completionTimes[person.journey_id]) {
                    completionTimes[person.journey_id] = [];
                }
                completionTimes[person.journey_id].push(diffDays);
            }
        });

        return journeys.map(journey => {
            const times = completionTimes[journey.id] || [];
            const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
            return {
                journeyName: journey.name,
                avgDays: avg,
                completedCount: times.length,
            };
        }).filter(item => item.completedCount > 0);

    }, [people, activityLogs, journeys]);
    
    // 2. Taxa de conversão entre os estágios (quantos passam do "1º Contato" para a "1ª Visita"?).
    const conversionRate = useMemo(() => {
        const ncJourneyId = 'novo-convertido';
        const contactStage = stages.find(s => s.journey_id === ncJourneyId && s.order === 1);
        const visitStage = stages.find(s => s.journey_id === ncJourneyId && s.order === 2);

        if (!contactStage || !visitStage) return { rate: 0, total: 0, converted: 0 };
        
        const peopleInNC = people.filter(p => p.journey_id === ncJourneyId);
        const total = peopleInNC.length;

        const converted = peopleInNC.filter(p => {
             const personStage = stages.find(s => s.id === p.stage_id);
             return personStage && personStage.order >= visitStage.order;
        }).length;
        
        const rate = total > 0 ? Math.round((converted / total) * 100) : 0;

        return { rate, total, converted };
    }, [people, stages]);
    
    // 3. Desempenho por líder
    const leaderPerformance = useMemo(() => {
        const leaders = users.filter(u => u.role === UserRole.Lider || u.role === UserRole.Usuario);
        
        return leaders.map(leader => {
            const assignedPeople = people.filter(p => p.responsible_id === leader.id && !p.is_archived);
            const total = assignedPeople.length;
            
            const byStage = assignedPeople.reduce((acc, person) => {
                const stage = stages.find(s => s.id === person.stage_id);
                const stageName = stage?.name || 'Desconhecido';
                acc[stageName] = (acc[stageName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            return {
                leaderId: leader.id,
                leaderName: leader.name,
                total,
                byStage: Object.entries(byStage).sort(([_, a], [__, b]) => b - a),
            };
        });

    }, [people, users, stages]);

    // 4. Funil da Jornada
    const funnelAnalysis = useMemo(() => {
        return journeys.map(journey => {
            const journeyStages = stages
                .filter(s => s.journey_id === journey.id && s.id !== 'arquivado')
                .sort((a, b) => a.order - b.order);
            
            let previousStageCount = people.filter(p => p.journey_id === journey.id).length;
            if (previousStageCount === 0) return null;

            const funnelStages = journeyStages.map(stage => {
                const peopleReachedStage = people.filter(p => {
                    if (p.journey_id !== journey.id) return false;
                    const personStage = stages.find(s => s.id === p.stage_id);
                    return personStage && personStage.order >= stage.order;
                });
                const count = peopleReachedStage.length;
                const conversion = previousStageCount > 0 ? Math.round((count / previousStageCount) * 100) : 0;
                
                const result = {
                    stageName: stage.name,
                    count: count,
                    conversion: conversion,
                };
                previousStageCount = count;
                return result;
            });

            return {
                journeyName: journey.name,
                stages: funnelStages.filter(s => s.count > 0)
            };
        }).filter(Boolean);
    }, [people, journeys, stages]);

    // 5. Motivos de Arquivamento
    const archiveReasonData = useMemo(() => {
        const archivedPeople = people.filter(p => p.is_archived && p.archive_reason);
        const reasonCounts = archivedPeople.reduce((acc, person) => {
            const reason = person.archive_reason!;
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(reasonCounts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);
    }, [people]);

    // 6. Visão Geral Mensal
    const monthlyOverview = useMemo(() => {
        const monthlyData: { [key: string]: { new: number; integrated: number; archived: number } } = {};

        people.forEach(person => {
            const date = new Date(person.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { new: 0, integrated: 0, archived: 0 };
            }
            monthlyData[key].new++;
        });

        const archiveLogs = activityLogs.filter(log => log.details.toLowerCase().includes('arquivado'));
        archiveLogs.forEach(log => {
            const date = new Date(log.at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { new: 0, integrated: 0, archived: 0 };
            }
            monthlyData[key].archived++;
            if (log.details.includes(ArchiveReason.Integrado)) {
                monthlyData[key].integrated++;
            }
        });

        return Object.entries(monthlyData)
            .map(([monthKey, data]) => ({
                month: monthKey,
                ...data
            }))
            .sort((a, b) => b.month.localeCompare(a.month));

    }, [people, activityLogs]);

    // Handlers for exporting data
    const handleExportConversion = () => {
        const headers = ['Métrica', 'Valor'];
        const data = [
            ['Total de Pessoas na Jornada (Novo Convertido)', conversionRate.total],
            ['Pessoas que chegaram na 1ª Visita ou posterior', conversionRate.converted],
            ['Taxa de Conversão (%)', conversionRate.rate]
        ];
        exportToCsv('relatorio_taxa_conversao', headers, data);
    };

    const handleExportAvgTime = () => {
        const headers = ['Jornada', 'Tempo Médio (dias)', 'Total de Pessoas Integradas'];
        const data = avgCompletionTime.map(item => [item.journeyName, item.avgDays, item.completedCount]);
        exportToCsv('relatorio_tempo_integracao', headers, data);
    };

    const handleExportMonthly = () => {
        const headers = ['Mês/Ano', 'Novas Pessoas', 'Integradas', 'Arquivadas (Total)'];
        const data = monthlyOverview.map(row => {
            const [year, month] = row.month.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
            const displayDate = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`;
            return [displayDate, row.new, row.integrated, row.archived];
        });
        exportToCsv('relatorio_visao_mensal', headers, data);
    };

    const handleExportFunnel = () => {
        const headers = ['Jornada', 'Estágio', 'Pessoas no Estágio', 'Conversão do Estágio Anterior (%)'];
        const data = (funnelAnalysis as NonNullable<typeof funnelAnalysis[0]>[]).flatMap(journey => 
            journey.stages.map((stage, index) => [
                journey.journeyName,
                stage.stageName,
                stage.count,
                index > 0 ? stage.conversion : 100
            ])
        );
        exportToCsv('relatorio_funil_jornada', headers, data);
    };
    
    const handleExportArchiveReasons = () => {
        const headers = ['Motivo de Arquivamento', 'Quantidade'];
        const data = archiveReasonData.map(item => [item.label, item.value]);
        exportToCsv('relatorio_motivos_arquivamento', headers, data);
    };

    const handleExportLeader = (leader: typeof leaderPerformance[0]) => {
        const headers = ['Estágio', 'Quantidade'];
        const data = leader.byStage.map(([stageName, count]) => [stageName, count]);
        exportToCsv(`relatorio_desempenho_${leader.leaderName.replace(/\s/g, '_')}`, headers, data);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Insights sobre o processo de acolhimento da igreja.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ReportCard title="Taxa de Conversão (Novo Convertido)" icon={<ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />} onExport={handleExportConversion}>
                     <p className="text-sm text-slate-500 mb-4">Progresso do "1º Contato" para a "1ª Visita".</p>
                     <div className="flex items-center space-x-6">
                        <div className="relative flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" className="text-slate-200 dark:text-slate-700" fill="transparent"/>
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" className="text-green-500" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 56}
                                    // FIX: Explicitly cast to Number to resolve potential type inference issues.
                                    strokeDashoffset={(2 * Math.PI * 56) * (1 - Number(conversionRate.rate) / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                             <span className="absolute text-3xl font-bold">{conversionRate.rate}%</span>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{conversionRate.converted} de {conversionRate.total} pessoas</p>
                            <p className="text-slate-500">avançaram para a visita.</p>
                        </div>
                     </div>
                 </ReportCard>
                 
                 <ReportCard title="Tempo Médio para Integração" icon={<ChartPieIcon className="h-6 w-6 text-blue-500" />} onExport={handleExportAvgTime}>
                    <p className="text-sm text-slate-500 mb-4">Dias desde o primeiro contato até a pessoa ser integrada.</p>
                    <div className="space-y-3">
                        {avgCompletionTime.length > 0 ? avgCompletionTime.map(item => (
                            <div key={item.journeyName}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.journeyName}</span>
                                    <span className="text-sm font-semibold">{item.avgDays} dias</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(item.avgDays / 90) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-right text-slate-400 mt-1">{item.completedCount} pessoa(s) integrada(s)</p>
                            </div>
                        )) : <p className="text-slate-500 text-center py-8">Nenhuma pessoa integrada ainda para calcular o tempo.</p>}
                    </div>
                 </ReportCard>
            </div>

            <ReportCard title="Visão Geral Mensal" icon={<ArrowTrendingUpIcon className="h-6 w-6 text-indigo-500"/>} className="lg:col-span-2" onExport={handleExportMonthly}>
                <p className="text-sm text-slate-500 mb-4">Novas pessoas, integrados e arquivados a cada mês.</p>
                <div className="max-h-80 overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="sticky top-0 bg-white dark:bg-slate-800 shadow-sm">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Mês/Ano</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Novas Pessoas</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Integradas</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Arquivadas (Total)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {monthlyOverview.map(row => {
                                const [year, month] = row.month.split('-');
                                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
                                const displayDate = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`;
                                
                                return (
                                    <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                       <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100">{displayDate}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-green-600 dark:text-green-400 font-medium">{row.new}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-blue-600 dark:text-blue-400 font-medium">{row.integrated}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-red-600 dark:text-red-400 font-medium">{row.archived}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {monthlyOverview.length === 0 && <p className="text-slate-500 text-center py-8">Ainda não há dados suficientes para exibir o resumo mensal.</p>}
                </div>
            </ReportCard>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportCard title="Funil da Jornada" icon={<FunnelIcon className="h-6 w-6 text-purple-500"/>} onExport={handleExportFunnel}>
                    <div className="space-y-6">
                        {funnelAnalysis.map(journey => journey && (
                            <div key={journey.journeyName}>
                                <h4 className="font-semibold text-md mb-3">{journey.journeyName}</h4>
                                <ul className="space-y-2">
                                    {journey.stages.map((stage, index) => (
                                        <li key={stage.stageName}>
                                            <div className="flex justify-between items-center text-sm mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{stage.stageName}</span>
                                                <span className="font-bold">{stage.count} <span className="font-normal text-slate-500">({index > 0 ? `${stage.conversion}%` : '100%'})</span></span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                                <div className="bg-purple-500 h-3 rounded-full" style={{width: `${stage.conversion}%`}}></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                         {funnelAnalysis.length === 0 && <p className="text-slate-500 text-center py-8">Sem dados para exibir o funil.</p>}
                    </div>
                </ReportCard>
                <ReportCard title="Motivos de Arquivamento" icon={<ArchiveBoxIcon className="h-6 w-6 text-yellow-500"/>} onExport={handleExportArchiveReasons}>
                    <div className="space-y-3">
                       {archiveReasonData.length > 0 ? (
                           archiveReasonData.map(reason => (
                               <div key={reason.label}>
                                   <div className="flex justify-between text-sm">
                                       <span>{reason.label}</span>
                                       <span>{reason.value}</span>
                                   </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(reason.value / people.filter(p => p.is_archived).length) * 100}%`}}></div>
                                    </div>
                               </div>
                           ))
                       ) : (
                           <p className="text-slate-500 text-center py-8">Nenhuma pessoa arquivada ainda.</p>
                       )}
                    </div>
                </ReportCard>
            </div>

            <div>
                 <h2 className="text-2xl font-bold mb-4">Desempenho por Líder</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leaderPerformance.map(leader => (
                        <ReportCard 
                            key={leader.leaderId} 
                            title={leader.leaderName} 
                            icon={<UserCircleIcon className="h-6 w-6 text-red-500"/>} 
                            className="flex flex-col"
                            onExport={() => handleExportLeader(leader)}
                        >
                           <div className="flex justify-between items-baseline border-b pb-2 mb-3 border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500">Total em Acompanhamento</p>
                                <p className="text-2xl font-bold">{leader.total}</p>
                           </div>
                           <div className="flex-1">
                               <h4 className="font-semibold text-sm mb-2">Distribuição por Estágio:</h4>
                               <ul className="space-y-1 text-sm">
                                  {leader.byStage.map(([stageName, count]) => (
                                      <li key={stageName} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                          <span>{stageName}</span>
                                          <span className="font-semibold bg-slate-100 dark:bg-slate-700 px-2 rounded">{count}</span>
                                      </li>
                                  ))}
                                  {leader.byStage.length === 0 && <p className="text-slate-400 text-center py-4">Nenhuma pessoa ativa.</p>}
                               </ul>
                           </div>
                        </ReportCard>
                    ))}
                 </div>
            </div>
        </div>
    );
};