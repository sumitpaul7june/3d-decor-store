import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import stlProducts from "../data/stlProducts";
import physicalProducts from "../data/physicalProducts";
import "./Products.css";

function Products() {
  const { type } = useParams();

  const products =
    type === "stl"
      ? stlProducts
      : type === "physical"
      ? physicalProducts
      : [];

  const title =
    type === "stl" ? "STL Files" : "Physical Products";

  return (
    <section className="products-page">
      <h2 className="section-title">{title}</h2>

      <div className="product-container">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            type={type}
          />
        ))}
      </div>
    </section>
  );
}

export default Products;
