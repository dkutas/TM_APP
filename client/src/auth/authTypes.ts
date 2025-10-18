export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type User = {
    id: string;
    name: string;
    email: string;
    role: Role
}