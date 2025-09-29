import React, {createContext, useMemo, useState} from 'react';
import type {Session, User} from './auth.types';

type AuthState = {
    session: Session;
    setSession: (s: Session) => void;
    setUser: (u: User) => void;
    clearSession: () => void;
};

const empty: Session = {user: null, accessToken: null, expiresAt: null};

export const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [session, setSessionState] = useState<Session>(empty);
    const setSession = (s: Session) => setSessionState(s);
    const setUser = (u: User) => setSessionState((prev) => ({...prev, user: u}));
    const clearSession = () => setSessionState(empty);

    const value = useMemo(() => ({session, setSession, setUser, clearSession}), [session]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const authStore = {
    // helper a service-nek (Context nélkül is elérhetővé tesszük)
    _state: empty as Session,
    getState() {
        // egyszerű megoldás: a service a Context helyett ezt használja runtime-ban.
        return {
            session: this._state,
            setSession: (s: Session) => (this._state = s),
            setUser: (u: User) => (this._state = {...this._state, user: u}),
            clearSession: () => (this._state = empty),
        };
    },
};