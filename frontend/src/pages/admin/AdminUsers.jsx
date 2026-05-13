// Admin users page: view registered users and simple login activity metrics.
import { useMemo, useState } from "react";
import axios from "../../api/axios";
import { useFetch } from "../../hooks/useFetch";
import { formatDateIN } from "../../utils/formatters";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import "./AdminUsers.css";

function AdminUsers() {
  const [query, setQuery] = useState("");

  const { data: rawUsers = [], loading, error } = useFetch(async () => {
    const { data } = await axios.get("/users/admin/all");
    return Array.isArray(data) ? data : [];
  });
  const users = rawUsers || [];

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      if (!normalizedQuery) return true;
      return (
        user.name?.toLowerCase().includes(normalizedQuery) ||
        user.email?.toLowerCase().includes(normalizedQuery) ||
        user.role?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [users, query]);

  const stats = useMemo(() => {
    const googleUsers = users.filter((user) => Boolean(user.googleId)).length;
    const activeLogins = users.filter((user) => Number(user.loginCount || 0) > 0).length;
    const admins = users.filter((user) => user.role === "admin").length;
    return { total: users.length, googleUsers, activeLogins, admins };
  }, [users]);

  return (
    <section className="admin-users">
      <AdminPageHeader
        kicker="Customers"
        title="Users"
        subtitle="See registered accounts, login activity, and authentication source."
      />

      {error && <p className="admin-users-error">{error}</p>}

      <div className="admin-users-stats">
        <article className="admin-user-stat">
          <span>Total Users</span>
          <strong>{loading ? "..." : stats.total}</strong>
        </article>
        <article className="admin-user-stat">
          <span>Logged In At Least Once</span>
          <strong>{loading ? "..." : stats.activeLogins}</strong>
        </article>
        <article className="admin-user-stat">
          <span>Google Accounts</span>
          <strong>{loading ? "..." : stats.googleUsers}</strong>
        </article>
        <article className="admin-user-stat">
          <span>Admins</span>
          <strong>{loading ? "..." : stats.admins}</strong>
        </article>
      </div>

      <div className="admin-users-toolbar">
        <p className="admin-toolbar-meta">
          Showing {filteredUsers.length} of {users.length}
        </p>
        <input
          className="users-search-input"
          type="text"
          placeholder="Search by name, email, or role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="users-table">
          <div className="users-table-head">
            <span>User</span>
            <span>Role</span>
            <span>Source</span>
            <span>Logins</span>
            <span>Last Login</span>
            <span>Joined</span>
          </div>

          {filteredUsers.map((user) => (
            <div key={user._id} className="users-table-row">
              <span className="users-primary-cell">
                <span className="users-avatar">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} />
                  ) : (
                    <span>{(user.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </span>
                <span className="users-primary-copy">
                  <strong>{user.name || "Unnamed User"}</strong>
                  <small>{user.email}</small>
                </span>
              </span>
              <span>
                <span className={`users-role-chip role-${user.role}`}>{user.role}</span>
              </span>
              <span>{user.googleId ? "Google" : "Email + Password"}</span>
              <span>{Number(user.loginCount || 0)}</span>
              <span>{user.lastLoginAt ? formatDateIN(user.lastLoginAt) : "Never"}</span>
              <span>{formatDateIN(user.createdAt)}</span>
            </div>
          ))}

          {!filteredUsers.length && (
            <p className="admin-table-empty">
              No users matched your search.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default AdminUsers;
