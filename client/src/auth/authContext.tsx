// src/auth/AuthContext.tsx
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import axios, {AxiosError, type AxiosInstance, type AxiosRequestConfig} from "axios";
import type {User} from "./authTypes.ts";
import {useNavigate} from "react-router-dom";
import {setAccessTokenGetter} from "../lib/apiClient.ts";
import type {CreateUserDto} from "../lib/types.ts";
// AuthProvider-ben

type Tokens = { accessToken: string; refreshToken: string };

type AuthContextValue = {
    user: User | null;
    isAuthReady: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: CreateUserDto) => Promise<void>;
    logout: () => void;
    getAccessToken: () => string | null;
};


const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_KEY = "refresh_token";

function getStoredRefresh(): string | null {
    try {
        return localStorage.getItem(REFRESH_KEY);
    } catch {
        return null;
    }
}

function setStoredRefresh(token: string | null) {
    try {
        if (token) localStorage.setItem(REFRESH_KEY, token);
        else localStorage.removeItem(REFRESH_KEY);
    } catch { /* ignore */
    }
}

export const AuthProvider: React.FC<React.PropsWithChildren<{ baseURL: string }>> = ({
                                                                                         baseURL,
                                                                                         children
                                                                                     }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    useEffect(() => {
        setAccessTokenGetter(() => accessRef.current);

    }, []);

    const accessRef = useRef<string | null>(null);
    const refreshRef = useRef<string | null>(getStoredRefresh());
    const isRefreshingRef = useRef(false);
    const refreshQueueRef = useRef<Array<(t?: string | null) => void>>([]);
    const navigate = useNavigate();

    useEffect(() => {
        accessRef.current = accessToken;
    }, [accessToken]);

    const setTokens = useCallback((t: Tokens) => {
        setAccessToken(t.accessToken);
        accessRef.current = t.accessToken;
        refreshRef.current = t.refreshToken;
        setStoredRefresh(t.refreshToken);
    }, []);

    const clearTokens = useCallback(() => {
        setAccessToken(null);
        accessRef.current = null;
        refreshRef.current = null;
        setStoredRefresh(null);
    }, []);

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL,
            withCredentials: false,
        });

        instance.interceptors.request.use((config) => {
            const token = accessRef.current;
            if (token) {
                config.headers = config.headers ?? {};
                (config.headers).Authorization = `Bearer ${token}`;
            }
            return config;
        });

        instance.interceptors.response.use(
            (res) => res,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
                const status = error.response?.status;

                if (status !== 401 || originalRequest?._retry) {
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                if (isRefreshingRef.current) {
                    return new Promise((resolve, reject) => {
                        refreshQueueRef.current.push((newToken) => {
                            if (!newToken) return reject(error);
                            originalRequest.headers = originalRequest.headers ?? {};
                            (originalRequest.headers).Authorization = `Bearer ${newToken}`;
                            resolve(instance(originalRequest));
                        });
                    });
                }

                isRefreshingRef.current = true;

                try {
                    const refreshData = await doRefresh(instance, refreshRef.current);
                    if (!refreshData) {
                        throw new Error("Unable to refresh");
                    }

                    accessRef.current = refreshData.accessToken;
                    refreshRef.current = refreshData.refreshToken;
                    setAccessToken(refreshData.accessToken);
                    setStoredRefresh(refreshData.refreshToken);
                    try {
                        const {data: me} = await instance.get("/auth/me", {
                            headers: {Authorization: `Bearer ${refreshData.accessToken}`},
                        });
                        setUser(me);
                    } catch { /* ha ez itt 401 lenne, az már nagyobb gond – de ne indíts új refresh-t */
                    }

                    refreshQueueRef.current.forEach((cb) => cb(refreshData.accessToken));
                    refreshQueueRef.current = [];

                    originalRequest.headers = originalRequest.headers ?? {};
                    (originalRequest.headers).Authorization = `Bearer ${refreshData.accessToken}`;
                    return instance(originalRequest);
                } catch (e) {
                    refreshQueueRef.current.forEach((cb) => cb(null));
                    refreshQueueRef.current = [];
                    clearTokens();
                    setUser(null);
                    return Promise.reject(e);
                } finally {
                    isRefreshingRef.current = false;
                }
            }
        );

        return instance;
    }, [baseURL, clearTokens]);

    const login = useCallback(
        async (email: string, password: string) => {
            const {data} = await axios.post<Tokens & { user?: User }>(`${baseURL}/auth/login`, {email, password});
            setTokens({accessToken: data.accessToken, refreshToken: data.refreshToken});
            if (data.user) setUser(data.user);
            navigate("/profile");
        },
        []
    );
    const register = useCallback(
        async (userDate: CreateUserDto) => {
            const {data} = await axios.post<Tokens & { user?: User }>(`${baseURL}/auth/register`, userDate);
            setTokens({accessToken: data.accessToken, refreshToken: data.refreshToken});
            if (data.user) setUser(data.user);
            navigate("/profile");
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout")
        } catch (e) {
            console.log(e)
        }
        clearTokens();
        setUser(null);
    }, [api, clearTokens]);

    useEffect(() => {
        (async () => {
            const rt = refreshRef.current;
            try {
                if (!rt) {
                    return;
                }
                // prevent parallel refresh while bootstrapping
                isRefreshingRef.current = true;

                const tokens = await doRefresh(api, rt);
                if (tokens) {
                    // set tokens immediately into refs and state
                    accessRef.current = tokens.accessToken;
                    refreshRef.current = tokens.refreshToken;
                    setAccessToken(tokens.accessToken);
                    setStoredRefresh(tokens.refreshToken);

                    // now we can safely load the user with the new token
                    try {
                        const {data: me} = await api.get("/auth/me", {
                            headers: {Authorization: `Bearer ${tokens.accessToken}`},
                        });
                        setUser(me);
                    } catch {
                        // ignore profile load errors at boot
                    }
                } else {
                    // no tokens -> clear any leftovers
                    clearTokens();
                }
            } catch {
                clearTokens();
            } finally {
                isRefreshingRef.current = false;
                setIsAuthReady(true);
            }
        })();
    }, []);

    const getAccessToken = useCallback(() => accessRef.current, []);

    const value = useMemo<AuthContextValue>(
        () => ({user, isAuthReady, login, logout, api, getAccessToken, register}),
        [user, isAuthReady, login, logout, api, getAccessToken, register]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

async function doRefresh(transport: AxiosInstance, refreshToken: string | null): Promise<{
    accessToken: string;
    refreshToken: string
} | null> {
    if (!refreshToken) return null;
    const {data} = await transport.post<{ accessToken: string; refreshToken: string }>("/auth/refresh", {refreshToken});
    return data ?? null;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
    return ctx;
}