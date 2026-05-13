import { useState } from "react";
import axios from "../../api/axios";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrencyINR, formatDateIN } from "../../utils/formatters";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import "./AdminReturns.css";

function AdminReturns() {
  const { data: returns = [], loading, error, reload } = useFetch(async () => {
    const { data } = await axios.get("/returns/admin/all");
    return data || [];
  });

  // Inline-edit state for the currently opened return.
  const [activeReturn, setActiveReturn] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editRefundAmount, setEditRefundAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (returnReq) => {
    setActiveReturn(returnReq._id);
    setEditStatus(returnReq.status);
    setEditNote(returnReq.adminNote || "");
    setEditRefundAmount(returnReq.refundAmount || "");
  };

  const handleCancelEdit = () => {
    setActiveReturn(null);
  };

  const handleSave = async (e, returnReq) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(`/returns/admin/${returnReq._id}/status`, {
        status: editStatus,
        refundAmount: editRefundAmount ? Number(editRefundAmount) : 0
      });
      await axios.put(`/returns/admin/${returnReq._id}/note`, {
        adminNote: editNote
      });
      setActiveReturn(null);
      reload();
    } catch (err) {
      alert("Failed to save return update");
    } finally {
      setSaving(false);
    }
  };

  if (loading && returns.length === 0) {
    return (
      <section className="admin-returns">
        <p>Loading returns...</p>
      </section>
    );
  }

  return (
    <section className="admin-returns">
      <AdminPageHeader
        kicker="Support Operations"
        title="Returns / RMAs"
        subtitle="Manage incoming return requests, authorise pickups, and process refunds."
      />

      {error && <p className="admin-returns-error">{error}</p>}

      <div className="admin-returns-list">
        {returns.length === 0 ? (
          <p className="admin-table-empty">No return requests found.</p>
        ) : (
          returns.map((req) => (
            <article key={req._id} className="admin-return-card">
              <div className="return-card-top">
                <div className="return-user-info">
                  <span className="return-kicker">Order #{req.order?._id?.slice(-8) || "N/A"}</span>
                  <h3 className="return-customer">{req.user?.name || "Unknown"}</h3>
                  <p className="return-meta">{req.user?.email}</p>
                </div>
                <div className="return-status-pack">
                  <span className={`status-chip status-${req.status.toLowerCase().replace(" ", "-")}`}>
                    {req.status}
                  </span>
                  <span className="return-date">{formatDateIN(req.createdAt)}</span>
                </div>
              </div>

              <div className="return-card-body">
                <div className="return-info-pack">
                  <span>Reason</span>
                  <p><strong>{req.reason}</strong></p>
                </div>
                {req.customerNote && (
                  <div className="return-info-pack">
                    <span>Customer Note</span>
                    <p>{req.customerNote}</p>
                  </div>
                )}
                {req.adminNote && (
                  <div className="return-info-pack">
                    <span>Internal Note</span>
                    <p><em>{req.adminNote}</em></p>
                  </div>
                )}
                <div className="return-info-pack">
                  <span>Items returning</span>
                  <p>{req.items?.length || 0} items from original order</p>
                </div>
              </div>

              {activeReturn === req._id ? (
                <form className="return-edit-form" onSubmit={(e) => handleSave(e, req)}>
                  <h4>Manage Request</h4>
                  <div className="return-form-grid">
                    <label>
                      <span>Update Status</span>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                        <option value="Requested">Requested</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </label>
                    <label>
                      <span>Refund Amount (₹)</span>
                      <input
                        type="number"
                        value={editRefundAmount}
                        onChange={(e) => setEditRefundAmount(e.target.value)}
                        placeholder={req.order?.totalAmount || "0"}
                      />
                    </label>
                  </div>
                  <label>
                    <span>Internal Note</span>
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      rows="2"
                    />
                  </label>
                  <div className="return-form-acts">
                    <button type="submit" className="save-btn" disabled={saving}>
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="return-card-acts">
                  <button className="manage-btn" onClick={() => handleOpenEdit(req)}>
                    Manage Request
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminReturns;
