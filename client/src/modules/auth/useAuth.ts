import {useContext, useEffect} from 'react';
import {AuthContext} from './auth.store';
import {authService} from './auth.service';

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('AuthProvider missing.');
    const {session, setSession, setUser, clearSession} = ctx;

    // induláskor megpróbálhatod a /me-t (ha van refresh cookie, a refresh interceptor megoldja):
    useEffect(() => {
        if (!session.user) {
            authService.fetchMe().catch(() => {/* vendég marad */
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        user: session.user,
        accessToken: session.accessToken,
        isAuthenticated: !!session.user && !!session.accessToken,
        setSession,
        setUser,
        clearSession,
        login: authService.login.bind(authService),
        logout: authService.logout.bind(authService),
    };
}