// Admin overview with summary stats.
import "./AdminDashboard.css";


function AdminDashboard() {
    return (
      <section className="dashboard">
        <h1 className="dashboard-title">Dashboard</h1>
  
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <p className="card-label">Total Orders</p>
            <h2 className="card-value">128</h2>
          </div>
  
          <div className="dashboard-card">
            <p className="card-label">Products</p>
            <h2 className="card-value">54</h2>
          </div>
  
          <div className="dashboard-card">
            <p className="card-label">Customers</p>
            <h2 className="card-value">89</h2>
          </div>
  
          <div className="dashboard-card">
            <p className="card-label">Revenue</p>
            <h2 className="card-value">₹42,500</h2>
          </div>
        </div>
      </section>
    );
  }
  
  export default AdminDashboard;
  
