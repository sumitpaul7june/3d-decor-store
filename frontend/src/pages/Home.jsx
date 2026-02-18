// Home page: hero carousel + featured product sections loaded from backend.
import ProductCard from "../components/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import "./Home.css";

function Home() {
  // Hero carousel state.
  const [current, setCurrent] = useState(0);
  // Product sections state.
  const [stlProducts, setStlProducts] = useState([]);
  const [physicalProducts, setPhysicalProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  const navigate = useNavigate();

  // Hero banner slides (static content for now).
  const slides = [
    {
      id: "hero-1",
      title: "Modern 3D Decor",
      subtitle: "STL files and premium physical pieces",
      cta: "Shop STL Files",
      ctaLink: "/products/stl",
      image: "/src/assets/table_lamp.png"
    },
    {
      id: "hero-2",
      title: "Designed for Print",
      subtitle: "Clean geometry, easy printing",
      cta: "Explore STL",
      ctaLink: "/products/stl",
      image: "/src/assets/table_lamp.png"
    },
    {
      id: "hero-3",
      title: "Luxury for Homes",
      subtitle: "Physical decor with a modern finish",
      cta: "Shop Products",
      ctaLink: "/products/physical",
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
    // Load featured products for both categories in parallel.
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError("");

        const [stlRes, physicalRes] = await Promise.all([
          axios.get("/products?type=stl"),
          axios.get("/products?type=physical")
        ]);

        setStlProducts(stlRes.data || []);
        setPhysicalProducts(physicalRes.data || []);
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

  const handleSeeMore = (type) => {
    // Navigate to category listing page.
    navigate(`/products/${type}`);
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
        <h2 className="section-title">STL Files</h2>

        <div className="product-container stl-products">
          {/* First 4 STL products on home preview */}
          {loadingProducts ? (
            <p>Loading STL products...</p>
          ) : (
            stlProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} type="stl" />
            ))
          )}
        </div>

        <div className="see-more-container">
          <button className="see-more-btn" onClick={() => handleSeeMore("stl")}>
            See more
          </button>
        </div>
      </section>

      <section className="product-section">
        <h2 className="section-title">Physical Products</h2>

        <div className="product-container physical-products">
          {/* First 4 physical products on home preview */}
          {loadingProducts ? (
            <p>Loading physical products...</p>
          ) : (
            physicalProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} type="physical" />
            ))
          )}
        </div>

        <div className="see-more-container">
          <button
            className="see-more-btn"
            onClick={() => handleSeeMore("physical")}
          >
            See more
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
