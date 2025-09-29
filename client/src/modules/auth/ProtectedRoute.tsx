import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from './useAuth';

export default function ProtectedRoute({roles}: { roles?: string[] }) {
    const {isAuthenticated, user} = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace/>;

    if (roles && roles.length > 0) {
        const ok = user?.roles?.some(r => roles.includes(r));
        if (!ok) return <Navigate to="/403" replace/>;
    }

    return <Outlet/>;
}