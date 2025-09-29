export type Role = 'ADMIN' | 'USER' | 'MANAGER';

export interface User {
    id: string;
    email: string;
    name: string;
    roles: Role[];
}

export interface Session {
    user: User | null;
    accessToken: string | null;   // csak memóriában
    expiresAt: number | null;     // epoch ms (access token lejárata)
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    expiresIn: number; // sec
    user: User;
}