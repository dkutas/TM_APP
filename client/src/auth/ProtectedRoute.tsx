import {Outlet, useNavigate} from "react-router-dom";
import {useAuth} from "./authContext.tsx";
import {useEffect} from "react";

const PrivateRoute = () => {
    const context = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!context.user?.id && context.isAuthReady) {
            navigate("/welcome");
        }
    })

    return <Outlet/>;
};

export default PrivateRoute;