import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import MainLayout from "./layouts/MainLayout";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Address from "./pages/Address";
import Profile from "./pages/Profile"


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

      {/* LISTING */}
      <Route
        path="/products/:type"
        element={
          <MainLayout>
            <Products />
          </MainLayout>
        }
      />

      {/* PDP */}
      <Route
        path="/products/:type/:id"
        element={
          <MainLayout>
            <ProductDetail />
          </MainLayout>
        }
      />

      <Route
        path="*"
        element={
          <MainLayout>
            <section className="not-found">Page not found</section>
          </MainLayout>
        }
      />

      <Route
        path="/signup"
        element = {
          <MainLayout>
        <Signup />
      </MainLayout>
        }
      />

      <Route
        path="/login"
        element = {
          <MainLayout>
        <Login/>
      </MainLayout>
        }
      />

      <Route
        path="/checkout/address"
        element = {
          <MainLayout>
            <Address/>
          </MainLayout>
        }
      />

        <Route
        
        path="/profile"
        element = {<MainLayout>
          <Profile/>
        </MainLayout>}
        />
     

     
    </Routes>
  );
}

export default App;
