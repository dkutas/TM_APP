import {api} from '../../lib/apiClient.ts';
import type {LoginDto, LoginResponse} from './auth.types';
import {authStore} from './auth.store.tsx';

class AuthService {
    getAccessToken() {
        return authStore.getState().session.accessToken;
    }

    async login(dto: LoginDto) {
        const {data} = await api.post<LoginResponse>('/auth/login', dto);
        const expiresAt = Date.now() + data.expiresIn * 1000;
        authStore.getState().setSession({
            user: data.user,
            accessToken: data.accessToken,
            expiresAt,
        });
        return data.user;
    }

    async refresh() {
        // refresh httpOnly cookie-ból, nincs body kell (backend implementációtól függ)
        const {data} = await api.post<LoginResponse>('/auth/refresh');
        const expiresAt = Date.now() + data.expiresIn * 1000;
        authStore.getState().setSession({
            user: data.user,
            accessToken: data.accessToken,
            expiresAt,
        });
    }

    async fetchMe() {
        const {data} = await api.get('/auth/me');
        authStore.getState().setUser(data);
        return data;
    }

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch { /* empty */
        }
        authStore.getState().clearSession();
    }

    // Ha a refresh 401-et ad vissza, ne loop-oljon:
    async logoutSilently() {
        authStore.getState().clearSession();
    }
}

export const authService = new AuthService();