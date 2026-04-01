// App route configuration using React Router data APIs.
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import MyOrders from "./pages/MyOrders";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail"
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TrackOrder from "./pages/TrackOrder";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHomeContent from "./pages/admin/AdminHomeContent";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminStorePolicies from "./pages/admin/AdminStorePolicies";
import AdminUsers from "./pages/admin/AdminUsers";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRoute from "./routes/AdminRoute";

// Central route tree for public + protected + admin sections.
const router = createBrowserRouter([
  {
    // Public storefront layout.
    path: "/",
    element: <MainLayout />,
    children: [
      // Home page.
      { index: true, element: <Home /> },

      // Routes only for guests. If already logged in, these redirect to home.
      {
        element: <PublicRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <Signup /> },
        ],
      },

      // Password reset pages stay public so email links work without auth state issues.
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password/:token", element: <ResetPassword /> },

      // Product browsing pages are always public.
      { path: "products", element: <Products /> },
      { path: "product/:productSlug", element: <ProductDetail /> },
      { path: "about", element: <AboutUs /> },
      { path: "contact", element: <Contact /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "track-order", element: <TrackOrder /> },

      // Checkout/account routes require login.
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <Profile /> },
          { path: "orders/my", element: <MyOrders /> },
          { path: "checkout/address", element: <Address /> },
          { path: "checkout/success/:orderId", element: <CheckoutSuccess /> },
        ],
      },


      // Fallback for unknown storefront routes.
      { path: "*", element: <section>Page Not Found</section> },
    ],
  },

  {
    // Admin guard wraps all `/admin` routes.
    element: <AdminRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "home-content", element: <AdminHomeContent /> },
          { path: "store-policies", element: <AdminStorePolicies /> },
          { path: "products", element: <AdminProducts /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "users", element: <AdminUsers /> },
        ],
      },
    ],
  },
  
]);

function App() {
  // RouterProvider renders the full route tree.
  return <RouterProvider router={router} />;
}

export default App;
