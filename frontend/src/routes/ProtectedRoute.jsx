// Guard for authenticated-only routes, preserves intended destination.
import {Navigate, Outlet, useLocation} from "react-router-dom"
import {useSelector } from "react-redux";

function ProtectedRoute() {
    // Read login state from Redux.
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    // Capture current URL so we can redirect back after login.
    const location = useLocation();

    // If guest tries protected route, send to login.
    // We also store `from` to support "login then continue" flow.
    if(!isAuthenticated)
    {
        return(
            <Navigate to="/login" replace state = {{from: location.pathname}}/>
        );
    }

    // Authenticated users can access child route content.
    return <Outlet/>;
    
}

export default ProtectedRoute;
