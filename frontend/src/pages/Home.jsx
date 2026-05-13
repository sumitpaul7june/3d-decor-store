import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import axios from "../api/axios";
import { showcaseImages } from "../data/showcaseImages";
import "./Home.css";

const fallbackHeroSlides = [];

const fallbackTestimonials = [
  { author: "Aarohi Mehta", role: "Mumbai", quote: "The finish looked premium in person and the piece instantly made our living room feel more complete." }
];

function Home() {
  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState([]);
  const [homeContent, setHomeContent] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const { data } = await axios.get("/home-content");
        setHomeContent(data || null);
      } catch (err) {
        setHomeContent(null);
      }
    };
    fetchHomeContent();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError("");
        const { data } = await axios.get("/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setProductsError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Compute Active CMS Data
  const hasCMS = homeContent !== null;
  const activeHeroSlides = hasCMS && homeContent.heroSlides?.length > 0 ? homeContent.heroSlides : fallbackHeroSlides;
  const activeTestimonials = hasCMS && homeContent.testimonials?.length > 0 ? homeContent.testimonials : fallbackTestimonials;
  
  // Use CMS curated products, fallback to generic recent products
  const activeFeaturedProducts = hasCMS && homeContent.featuredProducts?.length > 0 
    ? homeContent.featuredProducts.map(p => typeof p === 'object' ? p : products.find(prod => prod._id === p)).filter(Boolean)
    : products.slice(0, 4);

  const sectionOrder = hasCMS && homeContent.sectionOrder?.length > 0 
    ? homeContent.sectionOrder 
    : ["promo", "hero", "categories", "products", "testimonials"];
  
  const visibilityFlags = hasCMS && homeContent.visibilityFlags 
    ? homeContent.visibilityFlags 
    : { promo: false, hero: true, categories: true, products: true, testimonials: true };

  const promoStrip = homeContent?.promoStrip || { active: false };
  const featuredCategories = homeContent?.featuredCategories || [];

  useEffect(() => {
    if (activeHeroSlides.length <= 1) return undefined;
    const intervalId = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeHeroSlides.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [activeHeroSlides.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % activeHeroSlides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + activeHeroSlides.length) % activeHeroSlides.length);

  const renderPromo = () => {
    if (!visibilityFlags.promo || !promoStrip.active || !promoStrip.text) return null;
    return (
      <div className="home-promo-strip">
        {promoStrip.link ? (
          <Link to={promoStrip.link}>{promoStrip.text}</Link>
        ) : (
          <span>{promoStrip.text}</span>
        )}
      </div>
    );
  };

  const renderHero = () => {
    if (!visibilityFlags.hero || activeHeroSlides.length === 0) return null;
    return (
      <section className="hero-carousel">
        <div className="hero-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {activeHeroSlides.map((slide, index) => (
            <article className="hero-slide" key={slide.id || index}>
              <div
                className="hero-slide-media"
                style={
                  (!slide.image?.match(/\.(mp4|webm|ogg)$/i) && !slide.image?.includes("/video/upload/"))
                    ? { backgroundImage: `linear-gradient(90deg, rgba(15, 15, 15, 0.54) 0%, rgba(15, 15, 15, 0.2) 56%, rgba(15, 15, 15, 0.02) 100%), url(${slide.image})` }
                    : {} 
                }
              >
                {(slide.image?.match(/\.(mp4|webm|ogg)$/i) || slide.image?.includes("/video/upload/")) && (
                  <>
                    <video 
                      className="hero-video-bg" 
                      src={slide.image} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                    />
                    <div className="hero-video-overlay" />
                  </>
                )}

                <div className="hero-slide-copy" style={{ position: "relative", zIndex: 3 }}>

                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>

                </div>
              </div>
            </article>
          ))}
        </div>

        {activeHeroSlides.length > 1 && (
          <>
            <div className="hero-dots">
              {activeHeroSlides.map((slide, index) => (
                <button
                  key={`dot-${slide.id || index}`}
                  className={index === current ? "dot active" : "dot"}
                  onClick={() => setCurrent(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    );
  };



  const renderCategories = () => {
    if (!visibilityFlags.categories || featuredCategories.length === 0) return null;
    return (
      <section className="category-section">
        <div className="section-heading center">
          <p className="section-kicker">Shop by Space</p>
          <h2 className="section-title">Explore our curated collections</h2>
        </div>
        <div className="category-grid">
          {featuredCategories.map((cat, index) => (
            <Link 
              to={cat.link || `/products?category=${encodeURIComponent(cat.title)}`} 
              key={index} 
              className="category-card"
              style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%), url(${cat.image})` }}
            >
              <div className="category-card-content">
                <h3>{cat.title}</h3>
                <p>{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  const renderProducts = () => {
    if (!visibilityFlags.products) return null;
    return (
      <section className="product-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Featured Products</p>
            <h2 className="section-title">A lighter edit of standout pieces</h2>
          </div>
          <button className="section-link-btn" onClick={() => navigate("/products")}>
            View All
          </button>
        </div>
        {productsError && <p className="products-message">{productsError}</p>}
        <div className="product-container">
          {loadingProducts ? (
            <p className="products-message">Loading products...</p>
          ) : (
            activeFeaturedProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} variant="home" />
            ))
          )}
        </div>
      </section>
    );
  };

  const renderTestimonials = () => {
    if (!visibilityFlags.testimonials) return null;
    return (
      <section className="testimonial-section">
        <div className="section-heading center">
          <p className="section-kicker">Testimonials</p>
          <h2 className="section-title">A few words from our customers</h2>
        </div>
        <div className="testimonial-grid">
          {activeTestimonials.map((testimonial, index) => (
            <article key={`test-${index}`} className="testimonial-card">
              <span className="testimonial-stars">★★★★★</span>
              <p className="testimonial-quote">“{testimonial.quote}”</p>
              <div className="testimonial-author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  };

  const blockRenderers = {
    promo: renderPromo,
    hero: renderHero,
    categories: renderCategories,
    products: renderProducts,
    testimonials: renderTestimonials,
  };

  return (
    <div className="home-page">
      {sectionOrder.map((sectionName) => {
        const renderFunc = blockRenderers[sectionName];
        if (renderFunc) {
          return <div key={sectionName}>{renderFunc()}</div>;
        }
        return null;
      })}
    </div>
  );
}

export default Home;
