import axios from 'axios';
import {authService} from '../modules/auth/auth.service.ts';

export const api = axios.create({
// @ts-expect-error vite env
    baseURL: import.meta.env.VITE_API_BASE || '/api',
    withCredentials: true, // fontos a httpOnly refresh cookie-hoz
});

// ====== Interceptorok ======
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

api.interceptors.request.use((config) => {
    const token = authService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // ha 401 és még nem próbáltuk frissíteni
        if (error?.response?.status === 401 && !original._retry) {
            if (isRefreshing) {
                // várakozás a folyamatban lévő refreshre
                await new Promise<void>((resolve) => pendingRequests.push(resolve));
                original.headers.Authorization = `Bearer ${authService.getAccessToken()}`;
                return api(original);
            }

            original._retry = true;
            isRefreshing = true;
            try {
                await authService.refresh(); // kéri új access tokent a refresh cookie-ból
                pendingRequests.forEach((cb) => cb());
                pendingRequests = [];
                original.headers.Authorization = `Bearer ${authService.getAccessToken()}`;
                return api(original);
            } catch (e) {
                pendingRequests = [];
                await authService.logoutSilently();
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);