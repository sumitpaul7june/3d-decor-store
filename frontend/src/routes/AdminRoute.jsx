// Guard for admin-only routes.
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminRoute()
{
    // Read both auth flag and user details from Redux.
    const {isAuthenticated, user} = useSelector((state) => state.auth);

    // Unauthenticated users must login first.
    if(!isAuthenticated)
    {
        return <Navigate to = "/login" replace/>
    }

    // Non-admin users are redirected to the public home.
    if(user?.role !== "admin")
    {
        return <Navigate to = "/" replace/>
    }
    return <Outlet/>
        
}
export default AdminRoute;
