import { User, Person, Journey, Stage, Touchpoint, Note, ActivityLog, Attachment, Notification, UserRole, Sex, MaritalStatus, Urgency, TouchpointType, ArchiveReason } from '../types';

export const mockUsers: User[] = [
    { id: 'user-pastor-1', name: 'Pr. Carlos Almeida', email: 'carlos.almeida@ad.org', role: UserRole.Pastor },
    { id: 'user-lider-1', name: 'João Silva', email: 'joao.silva@example.com', role: UserRole.Lider },
    { id: 'user-lider-2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', role: UserRole.Lider },
    { id: 'user-lider-3', name: 'Pedro Souza', email: 'pedro.souza@example.com', role: UserRole.Lider },
    { id: 'user-usuario-1', name: 'Ana Voluntária', email: 'ana.voluntaria@example.com', role: UserRole.Usuario },
];

export const mockJourneys: Journey[] = [
    { id: 'novo-convertido', name: 'Jornada Novo Convertido' },
    { id: 'reconciliacao', name: 'Jornada Reconciliação' },
    { id: 'reativacao', name: 'Jornada Reativação' },
];

export const mockStages: Stage[] = [
    // Novo Convertido
    { id: 'contato-inicial', name: '1. Contato Inicial', journey_id: 'novo-convertido', order: 1 },
    { id: 'visita-acolhimento', name: '2. Visita de Acolhimento', journey_id: 'novo-convertido', order: 2 },
    { id: 'discipulado-1', name: '3. Discipulado Bloco 1', journey_id: 'novo-convertido', order: 3 },
    { id: 'discipulado-2', name: '4. Discipulado Bloco 2', journey_id: 'novo-convertido', order: 4 },
    { id: 'entrevista-pastoral', name: '5. Entrevista Pastoral', journey_id: 'novo-convertido', order: 5 },
    { id: 'integrado', name: '6. Integrado', journey_id: 'novo-convertido', order: 6 },
    { id: 'arquivado', name: 'Arquivado', journey_id: 'novo-convertido', order: 99 },
    // Reconciliação
    { id: 'acolhimento-inicial', name: 'Acolhimento Inicial', journey_id: 'reconciliacao', order: 1 },
    { id: 'conversa-lider', name: 'Conversa com Líder', journey_id: 'reconciliacao', order: 2 },
    { id: 'visita-pastoral', name: 'Visita Pastoral', journey_id: 'reconciliacao', order: 3 },
    { id: 'reintegrado', name: 'Reintegrado', journey_id: 'reconciliacao', order: 4 },
     // Reativação
    { id: 'primeiro-contato', name: 'Primeiro Contato', journey_id: 'reativacao', order: 1 },
    { id: 'visita-reativacao', name: 'Visita de Reativação', journey_id: 'reativacao', order: 2 },
    { id: 'frequencia-regular', name: 'Frequência Regular', journey_id: 'reativacao', order: 3 },
];

export const mockPeople: Person[] = [
    {
        id: 'person-1',
        name: 'Ana Beatriz Costa',
        age: 28,
        phone: '11987654321',
        address: 'Rua das Flores, 123, Jundiaí, SP',
        sex: Sex.Feminino,
        marital_status: MaritalStatus.Solteiro,
        created_at: '2024-07-20T10:00:00Z',
        decision_date: '2024-07-20T10:00:00Z',
        journey_id: 'novo-convertido',
        stage_id: 'contato-inicial',
        responsible_id: 'user-lider-2',
        urgency: Urgency.Urgente,
        invited_by: 'Amigo',
        birth_date: '1996-05-10T00:00:00Z',
        accepts_visit: true,
        visit_availability: 'Finais de semana, à tarde',
        first_visit_due: '2024-07-22T23:59:59Z',
        is_archived: false,
    },
    {
        id: 'person-2',
        name: 'Bruno Gomes',
        age: 35,
        phone: '11912345678',
        address: 'Avenida Principal, 456, Várzea Paulista, SP',
        sex: Sex.Masculino,
        marital_status: MaritalStatus.Casado,
        created_at: '2024-07-15T14:30:00Z',
        decision_date: '2024-07-15T14:30:00Z',
        journey_id: 'novo-convertido',
        stage_id: 'visita-acolhimento',
        responsible_id: 'user-lider-1',
        urgency: Urgency.Alta,
        invited_by: 'Família',
        is_archived: false,
        first_visit_due: '2024-07-10T23:59:59Z', // Atrasado
    },
    {
        id: 'person-3',
        name: 'Carla Dias',
        age: 42,
        phone: '11988887777',
        address: 'Rua da Paz, 789, Jundiaí, SP',
        sex: Sex.Feminino,
        marital_status: MaritalStatus.Divorciado,
        created_at: '2024-06-10T11:00:00Z',
        decision_date: '2024-06-10T11:00:00Z',
        journey_id: 'reconciliacao',
        stage_id: 'acolhimento-inicial',
        responsible_id: 'user-lider-3',
        urgency: Urgency.Normal,
        is_archived: false,
    },
     {
        id: 'person-4',
        name: 'Daniel Martins',
        age: 22,
        phone: '11977778888',
        address: 'Rua Nova, 101, Jundiaí, SP',
        sex: Sex.Masculino,
        marital_status: MaritalStatus.Solteiro,
        created_at: '2024-05-01T19:00:00Z',
        decision_date: '2024-05-01T19:00:00Z',
        journey_id: 'novo-convertido',
        stage_id: 'discipulado-2',
        responsible_id: 'user-lider-1',
        urgency: Urgency.Baixa,
        is_archived: false,
    },
    {
        id: 'person-5',
        name: 'Eduarda Lima',
        age: 55,
        phone: '11966665555',
        address: 'Alameda dos Anjos, 202, Itupeva, SP',
        sex: Sex.Feminino,
        marital_status: MaritalStatus.Viuvo,
        created_at: '2024-03-15T12:00:00Z',
        decision_date: '2024-03-15T12:00:00Z',
        journey_id: 'novo-convertido',
        stage_id: 'arquivado',
        responsible_id: 'user-lider-2',
        urgency: Urgency.Baixa,
        is_archived: true,
        archive_reason: ArchiveReason.Integrado,
    },
    {
        id: 'person-6',
        name: 'Fábio Pereira',
        age: 31,
        phone: '11955554444',
        address: 'Rua Antiga, 303, Jundiaí, SP',
        sex: Sex.Masculino,
        marital_status: MaritalStatus.Casado,
        created_at: '2024-01-20T10:00:00Z',
        decision_date: '2024-01-20T10:00:00Z',
        journey_id: 'novo-convertido',
        stage_id: 'arquivado',
        responsible_id: 'user-lider-1',
        urgency: Urgency.Normal,
        is_archived: true,
        archive_reason: ArchiveReason.SaiuDaIgreja,
    },
    {
        id: 'person-7',
        name: 'Gabriela Nunes',
        age: 25,
        phone: '11944443333',
        address: 'Avenida da Saudade, 505, Jundiaí, SP',
        sex: Sex.Feminino,
        marital_status: MaritalStatus.Solteiro,
        created_at: '2024-04-10T10:00:00Z',
        decision_date: '2024-04-10T10:00:00Z',
        journey_id: 'reconciliacao',
        stage_id: 'reintegrado',
        responsible_id: 'user-lider-3',
        urgency: Urgency.Normal,
        is_archived: true,
        archive_reason: ArchiveReason.Integrado,
    }
];

export const mockTouchpoints: Touchpoint[] = [
    { id: 'tp-1', person_id: 'person-2', author_id: 'user-lider-1', at: '2024-07-16T15:00:00Z', type: TouchpointType.WhatsApp, body: 'Enviei mensagem de boas-vindas. Respondeu animado.' },
    { id: 'tp-2', person_id: 'person-3', author_id: 'user-lider-3', at: '2024-06-12T18:00:00Z', type: TouchpointType.Ligacao, body: 'Conversei por telefone, expliquei sobre os pequenos grupos.' },
];

export const mockNotes: Note[] = [
    { id: 'note-1', person_id: 'person-1', author_id: 'user-pastor-1', at: '2024-07-21T09:00:00Z', body: 'Convidado pelo irmão Pedro. Parece ter um coração aberto e sincero. Precisa de atenção especial.', confidential: true },
];

export const mockActivityLogs: ActivityLog[] = [
    { id: 'log-1', person_id: 'person-2', user_id: 'user-lider-1', at: '2024-07-18T10:00:00Z', details: 'moveu para o estágio "Visita de Acolhimento"' },
    { id: 'log-2', person_id: 'person-4', user_id: 'user-lider-1', at: '2024-07-01T11:00:00Z', details: 'moveu para o estágio "Discipulado Bloco 2"' },
    { id: 'log-3', person_id: 'person-5', user_id: 'user-lider-2', at: '2024-07-28T11:00:00Z', details: 'arquivado com o motivo: Integrado' },
    { id: 'log-4', person_id: 'person-7', user_id: 'user-lider-3', at: '2024-07-20T11:00:00Z', details: 'arquivado com o motivo: Integrado' },
];

export const mockAttachments: Attachment[] = [
    { id: 'att-1', person_id: 'person-4', name: 'Ficha_Discipulado_Daniel.pdf', url: '#', at: '2024-05-10T10:00:00Z' },
];

export const mockNotifications: Notification[] = [
    { id: 'notif-1', person_id: 'person-1', title: 'Prazo para 1º Contato Expirando', description: 'O prazo de 48h para o primeiro contato com Ana Beatriz Costa está prestes a expirar.', at: '2024-07-21T10:00:00Z'},
    { id: 'notif-2', person_id: 'person-2', title: 'Visita de Acolhimento Atrasada', description: 'A primeira visita para Bruno Gomes está atrasada.', at: '2024-07-11T09:00:00Z'},
];