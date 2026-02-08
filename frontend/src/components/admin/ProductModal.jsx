import { useState } from "react";
import "./ProductModal.css";


function ProductModal({isOpen, onClose, onSave, initialData})
{
    if(!isOpen) return null;

    const [form, setForm] = useState(
        initialData || {
            name : "",
            type: "stl",
            price: "",
            stock: "",

        }
    )

    const handleChange = (e) => {
        const {name, value} = e.target;

        setForm((prev) => ({...prev, [name]: value}));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form)
        onClose();
    }

    return(
        <div className="modal-overlay">
            <div className="modal">
                <h2>{initialData ? "Edit Product" : "Add Product"}</h2>
            
                <form onSubmit={handleSubmit} className="modal-form">
                    <label htmlFor="name">
                        Name
                        <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        />
                    </label>
                    <label htmlFor="type">
                        Type
                        <select name="type" id="type" value={form.type} onChange={handleChange}>
                            <option value="stl">STL</option>
                            <option value="physical">Physical</option>
                        </select>
                    </label>

                    <label>
                        Price
                        <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        required
                    />
                    </label>

                    {form.type === "physical" && (
                        <label>
                            Stock
                            <input
                                name="stock"
                                type="number"
                                value={form.stock}
                                onChange={handleChange}
                            />
                        </label>
                    )}

                    <div className="modal-actions">
                    <button type="button" onClick={onClose}>
                        Cancel
                        </button>
                    <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductModal;