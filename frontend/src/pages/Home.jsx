// Home page rebuilt around category-first commerce sections and image-led merchandising.
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import axios from "../api/axios";
import { showcaseImages } from "../data/showcaseImages";
import "./Home.css";

const heroSlides = [
  {
    id: "hero-1",
    title: "Handpicked decor for elevated modern homes",
    subtitle:
      "Discover statement pieces, warm textures, and sculptural accents designed to transform blank walls and styled corners.",
    cta: "Shop All",
    link: "/products",
    image: showcaseImages[0],
  },
  {
    id: "hero-2",
    title: "Bring gallery-like styling into everyday spaces",
    subtitle:
      "Build a home that feels layered, collected, and premium with decor chosen for visual impact and softness.",
    cta: "Explore Collection",
    link: "/products",
    image: showcaseImages[1],
  },
  {
    id: "hero-3",
    title: "Craft a stronger first impression room by room",
    subtitle:
      "From wall statements to shelf styling, find decor that gives your home more presence without clutter.",
    cta: "View Bestsellers",
    link: "/products",
    image: showcaseImages[2],
  },
];

const categoryCards = [
  {
    title: "Wall Decor",
    image: showcaseImages[0],
  },
  {
    title: "Sculptural Accents",
    image: showcaseImages[1],
  },
  {
    title: "Premium Gifting",
    image: showcaseImages[2],
  },
  {
    title: "New Arrivals",
    image: showcaseImages[1],
  },
];

const testimonials = [
  {
    name: "Aarohi Mehta",
    location: "Mumbai",
    quote:
      "The finish looked premium in person and the piece instantly made our living room feel more complete.",
  },
  {
    name: "Rohan Bedi",
    location: "Bengaluru",
    quote:
      "I wanted something statement-led but not loud. The decor styling felt clean, elegant, and really easy to place.",
  },
  {
    name: "Neha Suri",
    location: "Delhi",
    quote:
      "Delivery was smooth and the overall quality felt far more polished than typical marketplace decor purchases.",
  },
];

function Home() {
  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState([]);
  const [homeContent, setHomeContent] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const navigate = useNavigate();

  const activeHeroSlides =
    Array.isArray(homeContent?.heroSlides) && homeContent.heroSlides.length > 0
      ? homeContent.heroSlides.map((slide, index) => ({
          id: `managed-hero-${index}`,
          title: slide.title || heroSlides[index % heroSlides.length].title,
          subtitle: slide.subtitle || heroSlides[index % heroSlides.length].subtitle,
          cta: slide.ctaLabel || "Shop Collection",
          link: slide.ctaLink || "/products",
          image: slide.image || heroSlides[index % heroSlides.length].image,
        }))
      : heroSlides;

  useEffect(() => {
    if (activeHeroSlides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeHeroSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [activeHeroSlides.length]);

  useEffect(() => {
    setCurrent((prev) => {
      if (activeHeroSlides.length === 0) {
        return 0;
      }

      return prev % activeHeroSlides.length;
    });
  }, [activeHeroSlides.length]);

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

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % activeHeroSlides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + activeHeroSlides.length) % activeHeroSlides.length);
  };

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home-page">
      <section className="hero-carousel">
        <div
          className="hero-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {activeHeroSlides.map((slide) => (
            <article className="hero-slide" key={slide.id}>
              <div
                className="hero-slide-media"
                style={{ backgroundImage: `linear-gradient(90deg, rgba(15, 15, 15, 0.54) 0%, rgba(15, 15, 15, 0.2) 56%, rgba(15, 15, 15, 0.02) 100%), url(${slide.image})` }}
              >
                <div className="hero-slide-copy">
                  <p className="hero-kicker">QALARAHI</p>
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <Link className="hero-cta" to={slide.link}>
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {activeHeroSlides.length > 1 && (
          <>
            <button className="hero-nav prev" onClick={prevSlide}>
              ‹
            </button>
            <button className="hero-nav next" onClick={nextSlide}>
              ›
            </button>

            <div className="hero-dots">
              {activeHeroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  className={index === current ? "dot active" : "dot"}
                  onClick={() => setCurrent(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="category-section">
        <div className="section-heading center">
          <p className="section-kicker">Shop By Category</p>
          <h2 className="section-title">Collections with a quieter, refined feel</h2>
          <p className="section-subtitle">
            Start with a cleaner edit of categories instead of a crowded storefront.
          </p>
        </div>

        <div className="category-grid">
          {categoryCards.map((card) => (
            <Link
              key={card.title}
              className="category-card"
              to="/products"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(15, 15, 15, 0.02) 0%, rgba(15, 15, 15, 0.52) 100%), url(${card.image})` }}
            >
              <div className="category-card-content">
                <span>Collection</span>
                <h3>{card.title}</h3>
                <p>Explore</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
            featuredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                variant="home"
              />
            ))
          )}
        </div>
      </section>

      <section className="testimonial-section">
        <div className="section-heading center">
          <p className="section-kicker">Testimonials</p>
          <h2 className="section-title">A few words from early customers</h2>
          <p className="section-subtitle">
            Simple feedback, kept minimal so the page still breathes.
          </p>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="testimonial-card">
              <span className="testimonial-stars">★★★★★</span>
              <p className="testimonial-quote">“{testimonial.quote}”</p>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <span>{testimonial.location}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
