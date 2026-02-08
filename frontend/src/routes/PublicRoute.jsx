import {Navigate, Outlet, useLocation} from "react-router-dom"
import {useSelector } from "react-redux";

function PublicRoute() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const location = useLocation();

    if(isAuthenticated)
    {
        return(
            <Navigate to="/" replace/>
        );
    }

    return <Outlet/>;
    
}

export default PublicRoute;