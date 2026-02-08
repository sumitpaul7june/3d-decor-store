import {Navigate, Outlet, useLocation} from "react-router-dom"
import {useSelector } from "react-redux";

function ProtectedRoute() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const location = useLocation();

    if(!isAuthenticated)
    {
        return(
            <Navigate to="/login" replace state = {{from: location.pathname}}/>
        );
    }

    return <Outlet/>;
    
}

export default ProtectedRoute;