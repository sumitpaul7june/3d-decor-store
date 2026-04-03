// Single-page checkout screen:
// 1) select/add/delete delivery address
// 2) review cart items and totals
// 3) place order
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import countries from "../data/countries";
import axios from "../api/axios";
import { clearCart, setCartFromServer } from "../store/cartSlice";
import { normalizeServerCart } from "../utils/cartHelpers";
import { formatCurrencyINR } from "../utils/formatters";
import { openRazorpayCheckout } from "../utils/razorpayCheckout";
import "./Address.css";

// Shared client-side address validator so user gets instant feedback
// before API call. Backend validation is still the final authority.
const validateAddressForm = (form) => {
  const nextErrors = {};

  const fullName = (form.fullName || "").trim();
  const phone = (form.phone || "").trim();
  const line1 = (form.line1 || "").trim();
  const city = (form.city || "").trim();
  const state = (form.state || "").trim();
  const postalCode = (form.postalCode || "").trim();
  const country = (form.country || "").trim();

  if (!fullName) {
    nextErrors.fullName = "Full name is required";
  } else if (fullName.length < 2 || fullName.length > 80) {
    nextErrors.fullName = "Full name must be between 2 and 80 characters";
  }

  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  if (!phone) {
    nextErrors.phone = "Phone number is required";
  } else if (!/^\+?[0-9]{7,15}$/.test(normalizedPhone)) {
    nextErrors.phone = "Phone must be 7 to 15 digits (optional + prefix)";
  }

  if (!line1) {
    nextErrors.line1 = "Address line is required";
  } else if (line1.length < 5 || line1.length > 200) {
    nextErrors.line1 = "Address line must be between 5 and 200 characters";
  }

  if (!city) {
    nextErrors.city = "City is required";
  } else if (!/^[a-zA-Z\s.'-]{2,80}$/.test(city)) {
    nextErrors.city = "City can contain only letters and spaces";
  }

  if (state && !/^[a-zA-Z\s.'-]{2,80}$/.test(state)) {
    nextErrors.state = "State can contain only letters and spaces";
  }

  if (!postalCode) {
    nextErrors.postalCode = "Postal code is required";
  } else if (!/^[a-zA-Z0-9\s-]{3,12}$/.test(postalCode)) {
    nextErrors.postalCode = "Postal code format is invalid";
  }

  if (!country) {
    nextErrors.country = "Country is required";
  } else if (!/^[a-zA-Z\s.'-]{2,80}$/.test(country)) {
    nextErrors.country = "Country can contain only letters and spaces";
  }

  return {
    errors: nextErrors,
    data: {
      fullName,
      phone: normalizedPhone,
      line1,
      city,
      state,
      postalCode,
      country
    }
  };
};

function Address() {
  // Which saved address card is currently selected for placing order.
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  // Toggle for showing/hiding the "Add new address" form.
  const [showForm, setShowForm] = useState(false);
  // All addresses fetched from backend for current user.
  const [savedAddress, setSavedAddress] = useState([]);
  // Page-level loading state while initial checkout data is fetched.
  const [loadingCheckout, setLoadingCheckout] = useState(true);
  // Loading state while new address is being saved.
  const [savingAddress, setSavingAddress] = useState(false);
  // Holds address id currently being deleted (for per-button loading UI).
  const [deletingAddressId, setDeletingAddressId] = useState("");
  // Loading state for "Place order" action.
  const [placingOrder, setPlacingOrder] = useState(false);
  // General API error shown at top of page.
  const [apiError, setApiError] = useState("");

  // Read cart from Redux (single source of truth for checkout totals and items).
  const cartItems = useSelector((state) => state.cart.items);

  // Redux + router helpers.
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // Controlled form state for new address inputs.
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  // Field-level validation errors for address form.
  const [errors, setErrors] = useState({});
  // Optional checkout email input (visual checkout section).
  const [contactEmail, setContactEmail] = useState("");
  // Optional marketing checkbox (visual parity with common checkouts).
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  // Discount code input state (UI only for now).
  const [discountCode, setDiscountCode] = useState("");

  const startCheckoutPayment = async (addressId) => {
    try {
      setApiError("");

      const { data: orderData } = await axios.post("/orders", {
        addressId
      });

      const selectedAddress = savedAddress.find(
        (address) => address._id === addressId
      );

      return await openRazorpayCheckout({
        orderId: orderData.orderId,
        selectedAddress,
        authUser,
        contactEmail,
        onLoadingChange: setPlacingOrder,
        onError: setApiError,
        onSuccess: async () => {
          dispatch(clearCart());
          navigate(`/checkout/success/${orderData.orderId || ""}`);
        },
      });
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.description ||
        err.response?.data?.error ||
        "Failed to start payment";

      setApiError(backendMessage);
      return false;
    }
  };

  // Generic input handler for all form fields.
  // It updates state using input's `name` as key.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Derive summary totals from current Redux cart.
  // useMemo avoids recomputing unless cart items actually change.
  const priceSummary = useMemo(() => {
    // "Subtotal" uses original price (before discounts).
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.originalPrice * item.qty,
      0
    );
    // "Final total" uses discounted/current selling price.
    const finalTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    // Ensure discount never goes negative.
    const discount = Math.max(subtotal - finalTotal, 0);

    return { subtotal, discount, finalTotal };
  }, [cartItems]);

  // Submit handler for adding a new address.
  const handleSubmit = async (e) => {
    // Prevent browser refresh on form submit.
    e.preventDefault();

    // Validate form on client before making API call.
    const { errors: newErrors, data: cleaned } = validateAddressForm(form);

    // If there are validation errors, show and stop submit.
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear previous field errors before API call.
    setErrors({});

    // Convert frontend form shape to backend API shape.
    const newAddress = {
      fullName: cleaned.fullName,
      phone: cleaned.phone,
      addressLine: cleaned.line1,
      city: cleaned.city,
      state: cleaned.state,
      pincode: cleaned.postalCode,
      country: cleaned.country,
    };

    try {
      // Start loading + clear top-level API error.
      setSavingAddress(true);
      setApiError("");

      // Save new address in backend.
      const { data } = await axios.post("/users/address", newAddress);

      // Refresh local address list from response.
      const updatedAddresses = data.addresses || [];
      setSavedAddress(updatedAddresses);

      // Auto-select newly added address.
      const latestAddress = updatedAddresses[updatedAddresses.length - 1];
      setSelectedAddressId(latestAddress?._id || null);

      // Hide form and reset inputs after successful save.
      setShowForm(false);
      setForm({
        fullName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
      });

      if (latestAddress?._id) {
        await startCheckoutPayment(latestAddress._id);
      }
    } catch (err) {
      // Map backend field names to frontend form field names.
      const backendErrors = err.response?.data?.errors || {};
      const mappedErrors = {
        ...backendErrors,
        line1: backendErrors.addressLine,
        postalCode: backendErrors.pincode
      };
      delete mappedErrors.addressLine;
      delete mappedErrors.pincode;

      if (Object.keys(mappedErrors).length > 0) {
        setErrors(mappedErrors);
      }

      // Show backend error if available.
      setApiError(err.response?.data?.message || "Failed to save address");
    } finally {
      // Stop button loading state.
      setSavingAddress(false);
    }
  };

  // Delete handler for one saved address card.
  const handleDeleteAddress = async (addressId, e) => {
    // Prevent parent card click (which would select address).
    e.stopPropagation();

    // Basic confirmation before deleting.
    const shouldDelete = window.confirm("Delete this address?");
    if (!shouldDelete) return;

    try {
      // Set per-address loading and clear top error.
      setDeletingAddressId(addressId);
      setApiError("");

      // Call backend delete endpoint.
      await axios.delete(`/users/address/${addressId}`);

      // Optimistically remove deleted address from local UI list.
      const updatedAddresses = savedAddress.filter(
        (address) => address._id !== addressId
      );
      setSavedAddress(updatedAddresses);

      // If deleted address was selected, move selection to first remaining address.
      if (selectedAddressId === addressId) {
        setSelectedAddressId(updatedAddresses[0]?._id || null);
      }
    } catch (err) {
      // Show backend error if delete fails.
      setApiError(err.response?.data?.message || "Failed to delete address");
    } finally {
      // Clear delete loading state.
      setDeletingAddressId("");
    }
  };

  // Initial data loader for checkout page.
  // Fetches both addresses and cart together for faster loading.
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        // Start page loading and clear previous errors.
        setLoadingCheckout(true);
        setApiError("");

        // Run both requests in parallel.
        const [addressRes, cartRes] = await Promise.all([
          axios.get("/users/address"),
          axios.get("/cart"),
        ]);

        // Parse and normalize response data.
        const addresses = addressRes.data || [];
        const normalizedCart = normalizeServerCart(cartRes.data || []);

        // If cart is empty, checkout doesn't make sense -> go home.
        if (normalizedCart.length === 0) {
          navigate("/", { replace: true });
          return;
        }

        // Save addresses locally and preselect first address.
        setSavedAddress(addresses);
        setSelectedAddressId((prev) => prev || addresses[0]?._id || null);

        // Sync normalized cart to Redux so UI totals are consistent.
        dispatch(setCartFromServer(normalizedCart));
      } catch (err) {
        // Show data load error.
        setApiError(err.response?.data?.message || "Failed to load checkout data");
      } finally {
        // Stop initial page loading.
        setLoadingCheckout(false);
      }
    };

    fetchCheckoutData();
  }, [dispatch, navigate]);

  // Safety redirect: if cart becomes empty while on checkout, send user home.
  useEffect(() => {
    if (!loadingCheckout && cartItems.length === 0) {
      navigate("/", { replace: true });
    }
  }, [cartItems.length, loadingCheckout, navigate]);

  // Re-sync cart when tab regains focus.
  // Useful if cart changed elsewhere (another tab/page).
  useEffect(() => {
    const syncCartOnFocus = async () => {
      try {
        const { data } = await axios.get("/cart");
        dispatch(setCartFromServer(normalizeServerCart(data || [])));
      } catch (err) {
        // Ignore focus-sync failures to avoid disruptive UX.
      }
    };

    // Attach and clean up window focus listener.
    window.addEventListener("focus", syncCartOnFocus);
    return () => window.removeEventListener("focus", syncCartOnFocus);
  }, [dispatch]);

  // Final order action from checkout.
  const handlePlaceOrder = async () => {
    // Require address selection before placing order.
    if (!selectedAddressId) {
      setApiError("Please select a delivery address");
      return;
    }

    await startCheckoutPayment(selectedAddressId);
  };

  // Keep address form visible if user has no saved addresses yet.
  const shouldShowAddressForm = showForm || savedAddress.length === 0;

  // Initial loading UI while checkout data is being fetched.
  if (loadingCheckout) {
    return (
      <section className="checkout-page">
        <p>Loading checkout...</p>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-shell">
        {/* Left pane: contact + delivery + payment mock section */}
        <div className="checkout-main-pane">
          <header className="checkout-head">
            <p className="checkout-breadcrumb">QALARAHI / Secure Checkout</p>
            <h2>Secure checkout</h2>
            <p className="checkout-head-copy">
              Finalize delivery, payment, and your order summary in one calm flow.
            </p>
          </header>

          {/* Global API error */}
          {apiError && <p className="checkout-error">{apiError}</p>}

          {/* Contact section */}
          <section className="checkout-section">
            <div className="section-head">
              <h3>Contact</h3>
            </div>
            <input
              type="email"
              className="checkout-input"
              placeholder="Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <label className="checkbox-row" htmlFor="marketingOptIn">
              <input
                id="marketingOptIn"
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
              />
              <span>Email me with news and offers</span>
            </label>
          </section>

          {/* Delivery section with saved addresses + add form */}
          <section className="checkout-section">
            <div className="section-head">
              <h3>Delivery</h3>
              <button
                type="button"
                className="inline-link-btn"
                onClick={() => setShowForm((prev) => !prev)}
              >
                {showForm ? "Hide form" : "Add new"}
              </button>
            </div>

            {savedAddress.length > 0 && (
              <div className="saved-address-list">
                {savedAddress.map((address) => (
                  <div
                    key={address._id}
                    className={`saved-address-pill ${
                      selectedAddressId === address._id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedAddressId(address._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedAddressId(address._id);
                      }
                    }}
                  >
                    <div className="saved-address-meta">
                      <p>{address.fullName}</p>
                      <span>
                        {address.addressLine}, {address.city} - {address.pincode}
                      </span>
                    </div>
                    <span className="saved-address-phone">{address.phone}</span>
                    <span className="saved-address-actions">
                      <button
                        type="button"
                        className="address-delete-link"
                        onClick={(e) => handleDeleteAddress(address._id, e)}
                        disabled={deletingAddressId === address._id}
                      >
                        {deletingAddressId === address._id ? "Deleting..." : "Delete"}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add-new-address form */}
            {shouldShowAddressForm && (
              <form className="address-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="country">Country/Region</label>
                  <select
                    id="country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={errors.country ? "input-error" : ""}
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && <span className="field-error">{errors.country}</span>}
                </div>

                <div className="form-row two-col">
                  <div className="form-field">
                    <label htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      maxLength={80}
                      value={form.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? "input-error" : ""}
                      placeholder="Full name"
                    />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      maxLength={15}
                      value={form.phone}
                      onChange={handleChange}
                      className={errors.phone ? "input-error" : ""}
                      placeholder="Phone"
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="line1">Address</label>
                  <input
                    id="line1"
                    name="line1"
                    maxLength={200}
                    value={form.line1}
                    onChange={handleChange}
                    className={errors.line1 ? "input-error" : ""}
                    placeholder="Address"
                  />
                  {errors.line1 && <span className="field-error">{errors.line1}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="line2">Apartment, suite, etc. (optional)</label>
                  <input
                    id="line2"
                    name="line2"
                    maxLength={200}
                    value={form.line2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="form-row three-col">
                  <div className="form-field">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      maxLength={80}
                      value={form.city}
                      onChange={handleChange}
                      className={errors.city ? "input-error" : ""}
                      placeholder="City"
                    />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="state">State</label>
                    <input
                      id="state"
                      name="state"
                      maxLength={80}
                      value={form.state}
                      onChange={handleChange}
                      className={errors.state ? "input-error" : ""}
                      placeholder="State"
                    />
                    {errors.state && <span className="field-error">{errors.state}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="postalCode">PIN code</label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      maxLength={12}
                      value={form.postalCode}
                      onChange={handleChange}
                      className={errors.postalCode ? "input-error" : ""}
                      placeholder="PIN code"
                    />
                    {errors.postalCode && (
                      <span className="field-error">{errors.postalCode}</span>
                    )}
                  </div>
                </div>

                {/* Form action buttons */}
                <div className="address-actions">
                  <button type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={savingAddress}>
                    {savingAddress ? "Saving..." : "Save address & proceed to payment"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Payment section explains the actual Razorpay handoff */}
          <section className="checkout-section payment-section">
            <h3>Payment</h3>
            <p className="payment-caption">All transactions are secure and encrypted.</p>
            <div className="payment-card-box">
              <div className="payment-card-head">
                <span className="payment-dot" />
                <span>Secure Razorpay Checkout</span>
              </div>
              <p className="payment-caption">
                After you confirm your address, payment will open in Razorpay where you can pay using card, UPI, net banking, or wallet.
              </p>
            </div>
          </section>

          <button
            className="review-order-btn"
            onClick={handlePlaceOrder}
            disabled={!selectedAddressId || placingOrder}
          >
            {placingOrder ? "Opening payment..." : "Proceed to payment"}
          </button>
        </div>

        {/* Right pane: order summary */}
        <aside className="checkout-summary-pane">
          <div className="summary-head">
            <p className="summary-kicker">Order Summary</p>
            <h3>Review your selection</h3>
            <p className="summary-head-copy">
              Taxes are included. Complimentary delivery is shown once you confirm the address.
            </p>
          </div>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item-row">
                <div className="summary-thumb">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span className="thumb-fallback">
                      {(item.name || "P").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="qty-pill">{item.qty}</span>
                </div>

                <div className="summary-item-meta">
                  <p className="summary-item-name">{item.name}</p>
                  <p className="summary-item-type">Physical Product</p>
                </div>

                <p className="summary-item-price">
                  {formatCurrencyINR(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="discount-row">
            <input
              type="text"
              className="checkout-input"
              placeholder="Discount code or gift card"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
            <button type="button" className="discount-btn">
              Apply
            </button>
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrencyINR(priceSummary.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{selectedAddressId ? "Free" : "Enter delivery address"}</span>
            </div>
            {priceSummary.discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-{formatCurrencyINR(priceSummary.discount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrencyINR(priceSummary.finalTotal)}</span>
            </div>
          </div>

          <p className="summary-support-note">
            Need help before you place the order? Our concierge can guide you at
            {" "}
            <a href="mailto:hello@qalarahi.com">hello@qalarahi.com</a>.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default Address;
