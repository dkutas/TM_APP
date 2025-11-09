import axios from "axios";

let accessGetter: (() => string | null) | null = null;

export function setAccessTokenGetter(getter: () => string | null) {
    accessGetter = getter;
}

export const api = axios.create({
    // @ts-expect-error vite env
    baseURL: import.meta.env.VITE_API_BASE,
});

api.interceptors.request.use((config) => {
    if (accessGetter) {
        const token = accessGetter();
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers).Authorization = `Bearer ${token}`;
        }
    }
    return config;
});