export enum UserRole {
    Pastor = 'Pastor',
    Lider = 'Líder',
    Usuario = 'Usuário',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface NewUserData {
    name: string;
    email: string;
    role: UserRole;
}

export interface Journey {
    id: string;
    name: string;
}

export interface Stage {
    id: string;
    name: string;
    journey_id: string;
    order: number;
}

export enum Sex {
    Feminino = 'Feminino',
    Masculino = 'Masculino',
}

export enum MaritalStatus {
    Solteiro = 'Solteiro(a)',
    Casado = 'Casado(a)',
    Divorciado = 'Divorciado(a)',
    Viuvo = 'Viúvo(a)',
}

export enum Urgency {
    Baixa = 'Baixa',
    Normal = 'Normal',
    Alta = 'Alta',
    Urgente = 'Urgente',
}

export enum ArchiveReason {
    Integrado = 'Integrado(a) na igreja',
    MudouDeCidade = 'Mudou de cidade/igreja',
    NaoQuerContato = 'Não quer mais contato',
    SaiuDaIgreja = 'Afastou-se/Saiu da igreja',
    Outro = 'Outro motivo',
}

export enum TouchpointType {
    WhatsApp = 'WhatsApp',
    Ligacao = 'Ligação',
    Visita = 'Visita',
    Encontro = 'Encontro',
}

export interface Person {
    id: string;
    name: string;
    age: number;
    phone: string;
    address: string;
    sex: Sex;
    marital_status: MaritalStatus;
    created_at: string; // ISO date string
    decision_date: string; // ISO date string
    journey_id: string;
    stage_id: string;
    responsible_id: string;
    urgency: Urgency;
    invited_by?: string;
    birth_date?: string; // ISO date string
    accepts_visit?: boolean;
    visit_availability?: string;
    first_visit_due?: string; // ISO date string
    is_archived: boolean;
    archive_reason?: ArchiveReason;
}

export interface NewPersonData {
    name: string;
    sex: Sex;
    age: number;
    phone: string;
    address: string;
    invited_by: string;
    journey_id: string;
    responsible_id: string;
    decision_date: string;
    marital_status: MaritalStatus;
    birth_date: string;
    accepts_visit: boolean;
    visit_availability: string;
}

export interface Touchpoint {
    id: string;
    person_id: string;
    author_id: string;
    at: string; // ISO date string
    type: TouchpointType;
    body: string;
}

export interface Note {
    id: string;
    person_id: string;
    author_id: string;
    at: string; // ISO date string
    body: string;
    confidential: boolean;
}

export interface ActivityLog {
    id: string;
    person_id: string;
    user_id: string;
    at: string; // ISO date string
    details: string;
}

export interface Attachment {
    id: string;
    person_id: string;
    name: string;
    url: string;
    at: string; // ISO date string
}

export interface Notification {
    id: string;
    person_id: string;
    title: string;
    description: string;
    at: string; // ISO date string
}
