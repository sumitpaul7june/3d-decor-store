import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import MainLayout from "./layouts/MainLayout";

import stlProducts from "./data/stlProducts";          // ✅ ADD
import physicalProducts from "./data/physicalProducts"; // ✅ ADD

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      <Route
        path="/products"
        element={
          <MainLayout>
            <Products
              title="Physical Products"
              products={physicalProducts}
            />
          </MainLayout>
        }
      />

      <Route
        path="/stl-products"
        element={
          <MainLayout>
            <Products
              title="3D STL Files"
              products={stlProducts}
            />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
