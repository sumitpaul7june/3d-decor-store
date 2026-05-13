// Guard for routes that should be hidden from logged-in users.
import {Navigate, Outlet} from "react-router-dom"
import {useSelector } from "react-redux";

function PublicRoute() {
    // Read login state from Redux.
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);


    // If already logged in, redirect away from login/signup pages.
    if(isAuthenticated)
    {
        return(
            <Navigate to="/" replace/>
        );
    }

    // Guests can view child public-auth pages.
    return <Outlet/>;
    
}

export default PublicRoute;
