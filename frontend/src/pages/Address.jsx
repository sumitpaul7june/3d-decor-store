import { useState } from "react";
import countries from "../data/countries";
import "./Address.css";

function Address() {
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [savedAddress, setSavedAddress] = useState([
    {
      id: 1,
      fullName: "Sumit Paul",
      addressLine: "221B Baker Street",
      city: "London",
      pincode: "NW1",
      country: "United Kingdom",
    },
    {
      id: 2,
      fullName: "Sumit Paul",
      addressLine: "MG Road",
      city: "Bangalore",
      pincode: "560001",
      country: "India",
    },
  ]);

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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.line1.trim()) newErrors.line1 = "Address line is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.postalCode.trim())
      newErrors.postalCode = "Postal code is required";
    if (!form.country) newErrors.country = "Country is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const newAddress = {
      id: Date.now(),
      fullName: form.fullName,
      phone: form.phone,
      addressLine: form.line1,
      city: form.city,
      pincode: form.postalCode,
      country: form.country,
    };

    setSavedAddress((prev) => [...prev, newAddress]);
    setSelectedAddressId(newAddress.id);
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
  };

  return (
    <section className="address-page">
      <h2>Select Delivery Address</h2>

      {!showForm && (
        <>
          <div className="address-list">
            {savedAddress.map((address) => (
              <div
                key={address.id}
                className={`address-card ${
                  selectedAddressId === address.id ? "selected" : ""
                }`}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <p className="name">{address.fullName}</p>
                <p className="address">
                  {address.addressLine}, {address.city} - {address.pincode}
                </p>
              </div>
            ))}
          </div>

          <button
            className="add-address-btn"
            onClick={() => setShowForm(true)}
          >
            Add New Address
          </button>

          <button className="continue-btn"
          
          disabled = {!selectedAddressId}
          onClick={() => console.log('Selected address id: ', selectedAddressId)
          }
          
          >
          Deliver to this address
          </button>
        </>

      )}

      {showForm && (
        <form className="address-form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <span className="error">{errors.fullName}</span>}

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}

          <label htmlFor="line1">Address Line 1</label>
          <input
            id="line1"
            name="line1"
            value={form.line1}
            onChange={handleChange}
          />
          {errors.line1 && <span className="error">{errors.line1}</span>}

          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          {errors.city && <span className="error">{errors.city}</span>}

          <label htmlFor="postalCode">Postal Code</label>
          <input
            id="postalCode"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
          />
          {errors.postalCode && (
            <span className="error">{errors.postalCode}</span>
          )}

          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            value={form.country}
            onChange={handleChange}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && <span className="error">{errors.country}</span>}

          <div className="address-actions">
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit">Save Address</button>
          </div>
        </form>
      )}
    </section>
  );
}

export default Address;
