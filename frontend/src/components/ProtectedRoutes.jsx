import { useSelector } from "react-redux";


function ProtectedRoutes()
{
    const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
    
    return(
       <div>Routes</div>
    );
}