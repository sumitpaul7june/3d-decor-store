// Admin layout wrapper with sidebar, header, and nested route content.
import {Outlet} from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import "./AdminLayout.css"; // 👈 YOU WERE MISSING THIS


function AdminLayout({ children }) {

    return (
    <div className="admin-container">
     <AdminSidebar/>

      <div className="admin-main">
      <AdminHeader />
   
        <div className="admin-content">
        {/* Nested admin routes render here */}
        <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
