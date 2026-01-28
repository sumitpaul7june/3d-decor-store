import ProductCard from "../components/ProductCard";
import "./Products.css";

function Products({ title, products = [] }) {
  return (
    <section className="products-page">
      <h2 className="section-title">{title}</h2>

      <div className="product-container">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default Products;
