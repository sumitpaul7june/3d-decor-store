// Admin layout wrapper with sidebar, header, and nested route content.
import {Outlet} from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import "./AdminLayout.css";


function AdminLayout({ children }) {

    return (
    <div className="admin-container">
     {/* Left navigation for admin sections. */}
     <AdminSidebar/>

      <div className="admin-main">
      {/* Top bar with admin title + actions. */}
      <AdminHeader />
   
        <div className="admin-content">
        {/* Nested admin pages (dashboard/products/orders) render here. */}
        <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
