import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./AdminStorePolicies.css";

const defaultShippingInfo = [
  "Ships within 3-5 business days with secure packaging for premium decor pieces.",
  "- Delivery available across India",
  "- Transit-safe packaging included",
  "- Delivery updates shared once your order is dispatched"
].join("\n");

const defaultReturnPolicy = [
  "Returns are accepted within 7 days for unused pieces in original condition.",
  "- Replacement support is available for transit damage",
  "- Custom or final-sale pieces can be marked non-returnable",
  "- Reach our concierge team for return assistance"
].join("\n");

function AdminStorePolicies() {
  const [form, setForm] = useState({
    shippingInfo: defaultShippingInfo,
    returnPolicy: defaultReturnPolicy
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get("/store-policies");

        setForm({
          shippingInfo: data?.shippingInfo || defaultShippingInfo,
          returnPolicy: data?.returnPolicy || defaultReturnPolicy
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load store policies");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
  };

  const handleReset = () => {
    setForm({
      shippingInfo: defaultShippingInfo,
      returnPolicy: defaultReturnPolicy
    });
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      shippingInfo: form.shippingInfo.trim(),
      returnPolicy: form.returnPolicy.trim()
    };

    if (!payload.shippingInfo || !payload.returnPolicy) {
      setError("Please fill both shipping information and return policy");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const { data } = await axios.put("/store-policies", payload);

      setForm({
        shippingInfo: data?.shippingInfo || payload.shippingInfo,
        returnPolicy: data?.returnPolicy || payload.returnPolicy
      });
      setSuccess("Store policies updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save store policies");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-store-policies">
        <div className="admin-store-policies__panel">
          <p className="admin-store-policies__status">Loading store policies...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-store-policies">
      <div className="admin-store-policies__head">
        <div>
          <p className="admin-store-policies__kicker">Storefront</p>
          <h1 className="admin-store-policies__title">Store Policies</h1>
          <p className="admin-store-policies__subtitle">
            Set one shared shipping and return policy that appears across all product pages.
          </p>
        </div>
      </div>

      <form className="admin-store-policies__panel" onSubmit={handleSubmit}>
        <div className="admin-store-policies__field-block">
          <div>
            <p className="admin-store-policies__panel-kicker">Global Policy</p>
            <h2 className="admin-store-policies__panel-title">Shipping Information</h2>
            <p className="admin-store-policies__field-note">
              This content appears in the shipping section for every product page.
            </p>
          </div>

          <label>
            Shipping Information
            <textarea
              name="shippingInfo"
              rows={8}
              value={form.shippingInfo}
              onChange={handleChange}
              placeholder="Enter your store-wide shipping information"
            />
          </label>
        </div>

        <div className="admin-store-policies__field-block">
          <div>
            <p className="admin-store-policies__panel-kicker">Global Policy</p>
            <h2 className="admin-store-policies__panel-title">Return Policy</h2>
            <p className="admin-store-policies__field-note">
              This content appears in the return policy section for every product page.
            </p>
          </div>

          <label>
            Return Policy
            <textarea
              name="returnPolicy"
              rows={8}
              value={form.returnPolicy}
              onChange={handleChange}
              placeholder="Enter your store-wide return policy"
            />
          </label>
        </div>

        {(error || success) && (
          <div className="admin-store-policies__messages">
            {error && <p className="admin-store-policies__error">{error}</p>}
            {success && <p className="admin-store-policies__success">{success}</p>}
          </div>
        )}

        <div className="admin-store-policies__actions">
          <button
            type="button"
            className="admin-store-policies__secondary-btn"
            onClick={handleReset}
            disabled={saving}
          >
            Reset Copy
          </button>
          <button
            type="submit"
            className="admin-store-policies__primary-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Policies"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminStorePolicies;
