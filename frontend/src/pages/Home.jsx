import NavBar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import "./Home.css";

function Home() {
  return (
    <div>
      <NavBar />

     
      <section className="product-section">
        <h2 className="section-title">3D STL Files</h2>

        <div className="product-container stl-products">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>

        <div className="see-more-container">
          <button className="see-more-btn">See more</button>
        </div>
      </section>

      
      <section className="product-section">
        <h2 className="section-title">Physical Products</h2>

        <div className="product-container physical-products">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>

        <div className="see-more-container">
          <button className="see-more-btn">See more</button>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

export default Home;
