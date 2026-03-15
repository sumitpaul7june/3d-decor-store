// Home page: hero carousel + featured physical products loaded from backend.
import ProductCard from "../components/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import "./Home.css";

function Home() {
  // Hero carousel state.
  const [current, setCurrent] = useState(0);
  // Product section state.
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  const navigate = useNavigate();

  // Hero banner slides focused on physical decor only.
  const slides = [
    {
      id: "hero-1",
      title: "Modern 3D Decor",
      subtitle: "Premium physical decor for calm, refined interiors",
      cta: "Shop Collection",
      ctaLink: "/products",
      image: "/src/assets/table_lamp.png"
    },
    {
      id: "hero-2",
      title: "Made for Real Spaces",
      subtitle: "Thoughtful pieces that elevate shelves, consoles and corners",
      cta: "Browse Products",
      ctaLink: "/products",
      image: "/src/assets/table_lamp.png"
    },
    {
      id: "hero-3",
      title: "Luxury for Homes",
      subtitle: "Physical decor with a modern finish",
      cta: "Shop Products",
      ctaLink: "/products",
      image: "/src/assets/table_lamp.png"
    }
  ];

  useEffect(() => {
    // Auto-slide hero every 5 seconds.
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    // Load featured products from backend.
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

  const goTo = (index) => setCurrent(index);
  // Manual previous/next controls.
  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  const handleSeeMore = () => {
    // Navigate to the products listing page.
    navigate("/products");
  };

  return (
    <div>
      {/* Hero carousel */}
      <section className="hero-carousel">
        <div
          className="hero-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {/* Each hero slide */}
          {slides.map((slide) => (
            <div className="hero-slide" key={slide.id}>
              <div className="hero-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link className="hero-cta" to={slide.ctaLink}>
                  {slide.cta}
                </Link>
              </div>
              <div className="hero-image">
                <img src={slide.image} alt={slide.title} />
              </div>
            </div>
          ))}
        </div>

        <button className="hero-nav prev" onClick={prev}>
          ‹
        </button>
        <button className="hero-nav next" onClick={next}>
          ›
        </button>

        <div className="hero-dots">
          {/* Dot indicators for direct slide jump */}
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={index === current ? "dot active" : "dot"}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </section>

      {productsError && (
        <section className="product-section">
          <p>{productsError}</p>
        </section>
      )}

      <section className="product-section">
        <h2 className="section-title">Featured Products</h2>

        <div className="product-container">
          {/* First 4 products on home preview */}
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : (
            products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>

        <div className="see-more-container">
          <button className="see-more-btn" onClick={handleSeeMore}>
            See more
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
