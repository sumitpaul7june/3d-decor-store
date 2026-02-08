import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail"


// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },

      // 🔓 PUBLIC (but blocked when logged IN)
      {
        element: <PublicRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <Signup /> },
        ],
      },

      // ✅ ALWAYS PUBLIC
      { path: "products/:type", element: <Products /> },
      { path: "products/:type/:id", element: <ProductDetail /> },

      // 🔒 PROTECTED
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <Profile /> },
          { path: "checkout/address", element: <Address /> },
        ],
      },

      { path: "*", element: <section>Page Not Found</section> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
