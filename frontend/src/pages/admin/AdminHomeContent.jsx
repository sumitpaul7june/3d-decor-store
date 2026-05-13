import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./AdminHomeContent.css";

function AdminHomeContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [allProducts, setAllProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("hero");

  const [formData, setFormData] = useState({
    heroSlides: [],
    featuredCategories: [],
    featuredProducts: [],
    testimonials: [],
    promoStrip: { text: "", link: "", active: false },
    sectionOrder: ["hero", "promo", "categories", "products", "testimonials"],
    visibilityFlags: {
      hero: true, promo: true, categories: true, products: true, testimonials: true
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentRes, productsRes] = await Promise.all([
          axios.get("/home-content"),
          axios.get("/products/admin/all")
        ]);
        
        const content = contentRes.data || {};
        setFormData({
          heroSlides: content.heroSlides || [],
          featuredCategories: content.featuredCategories || [],
          featuredProducts: (content.featuredProducts || []).map(p => p._id || p),
          testimonials: content.testimonials || [],
          promoStrip: content.promoStrip || { text: "", link: "", active: false },
          sectionOrder: content.sectionOrder?.length ? content.sectionOrder : ["hero", "promo", "categories", "products", "testimonials"],
          visibilityFlags: content.visibilityFlags || {
            hero: true, promo: true, categories: true, products: true, testimonials: true
          }
        });
        
        setAllProducts(productsRes.data || []);
      } catch (err) {
        setError("Failed to load CMS data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");
      await axios.put("/home-content", formData);
      setSuccessMsg("Home content updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save CMS data");
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const fileDataUrl = reader.result;
        const { data } = await axios.post("/upload/media", {
          fileDataUrl,
          fileName: file.name
        });
        updateArrayItem("heroSlides", index, "image", data.url);
        setSuccessMsg("Media uploaded successfully! Click Save Changes to lock it in.");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to upload media");
      } finally {
        setSaving(false);
      }
    };
  };

  /* ----- ARRAY HANDLERS ----- */
  const updateArrayItem = (key, index, field, value) => {
    setFormData(prev => {
      const arr = [...prev[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  };

  const addArrayItem = (key, defaultObj) => {
    setFormData(prev => ({ ...prev, [key]: [...prev[key], defaultObj] }));
  };

  const removeArrayItem = (key, index) => {
    setFormData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  if (loading) return <section className="admin-cms"><p>Loading CMS...</p></section>;

  return (
    <section className="admin-cms">
      <div className="admin-page-head">
        <div>
          <p className="admin-page-kicker">Storefront Setup</p>
          <h1 className="admin-cms-title">Homepage Editor</h1>
          <p className="admin-page-subtitle">Configure hero banners, featured categories, and page visibility.</p>
        </div>
        <button className="cms-primary-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && <p className="cms-error">{error}</p>}
      {successMsg && <p className="cms-success">{successMsg}</p>}

      <div className="cms-layout">
        <aside className="cms-sidebar">
          <ul className="cms-tabs">
            {["hero", "categories", "products", "testimonials", "promo", "layout"].map(tab => (
              <li key={tab}>
                <button 
                  className={activeTab === tab ? "active" : ""} 
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="cms-content">
          {activeTab === "hero" && (
            <div className="cms-block">
              <h2>Hero Banners</h2>
              <p className="cms-desc">Configure up to 3 hero slides for the top carousel.</p>
              {formData.heroSlides.map((slide, index) => (
                <div key={`slide-${index}`} className="cms-card">
                  <div className="cms-card-head">
                    <h4>Slide {index + 1}</h4>
                    <button type="button" onClick={() => removeArrayItem("heroSlides", index)}>Remove</button>
                  </div>
                  <div className="cms-form-grid">
                    <label className="span-2"><span>Media URL (Image or Video)</span>
                      <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                        <input style={{flex: 1}} value={slide.image} onChange={(e) => updateArrayItem("heroSlides", index, "image", e.target.value)} />
                        <span style={{fontSize: "12px", color: "#666"}}>OR</span>
                        <input id={`file-upload-${index}`} type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => handleMediaUpload(e, index)} style={{width: "auto", maxWidth: "220px", padding: 0, border: "none"}} />
                        {slide.image && (
                          <button 
                            type="button" 
                            onClick={() => {
                              updateArrayItem("heroSlides", index, "image", "");
                              const fileInput = document.getElementById(`file-upload-${index}`);
                              if (fileInput) fileInput.value = "";
                            }}
                            style={{background: "transparent", color: "#b42318", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer", padding: "0 4px"}}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </label>
                    <label><span>Title</span>
                      <input value={slide.title} onChange={(e) => updateArrayItem("heroSlides", index, "title", e.target.value)} />
                    </label>
                    <label><span>Subtitle</span>
                      <input value={slide.subtitle} onChange={(e) => updateArrayItem("heroSlides", index, "subtitle", e.target.value)} />
                    </label>
                    <label><span>Button Text</span>
                      <input value={slide.ctaLabel} onChange={(e) => updateArrayItem("heroSlides", index, "ctaLabel", e.target.value)} />
                    </label>
                    <label><span>Button Link</span>
                      <input value={slide.ctaLink} onChange={(e) => updateArrayItem("heroSlides", index, "ctaLink", e.target.value)} />
                    </label>
                  </div>
                </div>
              ))}
              {formData.heroSlides.length < 3 && (
                <button 
                  className="cms-secondary-btn mt-2" 
                  onClick={() => addArrayItem("heroSlides", { image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "/products" })}
                >
                  + Add Slide
                </button>
              )}
            </div>
          )}

          {activeTab === "categories" && (
            <div className="cms-block">
              <h2>Featured Categories</h2>
              <p className="cms-desc">Highlight specific collections on the homepage.</p>
              {formData.featuredCategories.map((cat, index) => (
                <div key={`cat-${index}`} className="cms-card">
                  <div className="cms-card-head">
                    <h4>Category {index + 1}</h4>
                    <button type="button" onClick={() => removeArrayItem("featuredCategories", index)}>Remove</button>
                  </div>
                  <div className="cms-form-grid">
                    <label><span>Title</span>
                      <input value={cat.title} onChange={(e) => updateArrayItem("featuredCategories", index, "title", e.target.value)} />
                    </label>
                    <label><span>Subtitle</span>
                      <input value={cat.subtitle} onChange={(e) => updateArrayItem("featuredCategories", index, "subtitle", e.target.value)} />
                    </label>
                    <label><span>Cover Image URL</span>
                      <input value={cat.image} onChange={(e) => updateArrayItem("featuredCategories", index, "image", e.target.value)} />
                    </label>
                    <label><span>Link</span>
                      <input value={cat.link} onChange={(e) => updateArrayItem("featuredCategories", index, "link", e.target.value)} />
                    </label>
                  </div>
                </div>
              ))}
              <button 
                className="cms-secondary-btn mt-2" 
                onClick={() => addArrayItem("featuredCategories", { title: "", subtitle: "", image: "", link: "/products" })}
              >
                + Add Category
              </button>
            </div>
          )}

          {activeTab === "products" && (
            <div className="cms-block">
              <h2>Featured Products</h2>
              <p className="cms-desc">Select products to appear in the highlights section.</p>
              <div className="cms-card">
                <div className="cms-list">
                  {allProducts.map(product => {
                    const isSelected = formData.featuredProducts.includes(product._id);
                    return (
                      <label key={product._id} className="cms-checkbox-row">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, featuredProducts: [...prev.featuredProducts, product._id]}));
                            } else {
                              setFormData(prev => ({ ...prev, featuredProducts: prev.featuredProducts.filter(id => id !== product._id)}));
                            }
                          }}
                        />
                        <div className="cms-checkbox-detail">
                          {product.coverImage && <img src={product.coverImage} alt="cover" />}
                          <span>{product.name} ({product.category})</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "testimonials" && (
            <div className="cms-block">
              <h2>Customer Testimonials</h2>
              {formData.testimonials.map((test, index) => (
                <div key={`test-${index}`} className="cms-card">
                  <div className="cms-card-head">
                    <h4>Testimonial {index + 1}</h4>
                    <button type="button" onClick={() => removeArrayItem("testimonials", index)}>Remove</button>
                  </div>
                  <div className="cms-form-grid">
                    <label className="span-2"><span>Quote</span>
                      <textarea value={test.quote} onChange={(e) => updateArrayItem("testimonials", index, "quote", e.target.value)} rows="2" />
                    </label>
                    <label><span>Author Name</span>
                      <input value={test.author} onChange={(e) => updateArrayItem("testimonials", index, "author", e.target.value)} />
                    </label>
                    <label><span>Role / Context</span>
                      <input value={test.role} onChange={(e) => updateArrayItem("testimonials", index, "role", e.target.value)} />
                    </label>
                    <label><span>Rating (1-5)</span>
                      <input type="number" min="1" max="5" value={test.rating || 5} onChange={(e) => updateArrayItem("testimonials", index, "rating", Number(e.target.value))} />
                    </label>
                  </div>
                </div>
              ))}
              <button 
                className="cms-secondary-btn mt-2" 
                onClick={() => addArrayItem("testimonials", { quote: "", author: "", role: "", rating: 5 })}
              >
                + Add Testimonial
              </button>
            </div>
          )}

          {activeTab === "promo" && (
            <div className="cms-block">
              <h2>Promo Strip</h2>
              <p className="cms-desc">The thin announcement bar spanning the top of the storefront.</p>
              <div className="cms-card">
                <label className="cms-checkbox-row mb-4">
                  <input 
                    type="checkbox" 
                    checked={formData.promoStrip.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoStrip: { ...prev.promoStrip, active: e.target.checked } }))}
                  />
                  <strong>Enable Promo Strip</strong>
                </label>
                <div className="cms-form-grid">
                  <label><span>Announcement Text</span>
                    <input 
                      value={formData.promoStrip.text} 
                      onChange={(e) => setFormData(prev => ({ ...prev, promoStrip: { ...prev.promoStrip, text: e.target.value } }))} 
                    />
                  </label>
                  <label><span>Optional Link</span>
                    <input 
                      value={formData.promoStrip.link} 
                      onChange={(e) => setFormData(prev => ({ ...prev, promoStrip: { ...prev.promoStrip, link: e.target.value } }))} 
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="cms-block">
              <h2>Layout & Visibility</h2>
              <p className="cms-desc">Toggle structural sections on and off.</p>
              <div className="cms-card">
                <h4>Section Visibility</h4>
                <div className="cms-visibility-grid">
                  {Object.keys(formData.visibilityFlags).map(key => (
                    <label key={`vis-${key}`} className="cms-checkbox-row pb-2">
                      <input 
                        type="checkbox"
                        checked={formData.visibilityFlags[key]}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          visibilityFlags: { ...prev.visibilityFlags, [key]: e.target.checked }
                        }))}
                      />
                      <span>Show {key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="cms-card mt-4">
                <h4>Section Rendering Order</h4>
                <p className="text-secondary small mb-2">Drag-and-drop coming soon. Reorder using text array for now.</p>
                <label>
                  <input 
                    type="text" 
                    value={formData.sectionOrder.join(", ")}
                    onChange={(e) => setFormData(prev => ({ ...prev, sectionOrder: e.target.value.split(",").map(s => s.trim()) }))} 
                  />
                </label>
                <p className="text-secondary small mt-1">Available blocks: hero, promo, categories, products, testimonials</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </section>
  );
}

export default AdminHomeContent;
