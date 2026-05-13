// App route configuration using React Router data APIs.
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Suspense, lazy } from "react";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AdminRoute from "./routes/AdminRoute";

// Critical Pages (Eagerly loaded)
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";

// Non-critical Pages (Lazy loaded)
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Address = lazy(() => import("./pages/Address"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const OrderInvoice = lazy(() => import("./pages/OrderInvoice"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));

// Admin Pages (Lazy loaded)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminHomeContent = lazy(() => import("./pages/admin/AdminHomeContent"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminStorePolicies = lazy(() => import("./pages/admin/AdminStorePolicies"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminReturns = lazy(() => import("./pages/admin/AdminReturns"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminOrderInvoice = lazy(() => import("./pages/admin/AdminOrderInvoice"));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#666' }}>
    Loading...
  </div>
);

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
          { path: "signup", element: <Suspense fallback={<LoadingFallback />}><Signup /></Suspense> },
        ],
      },

      // Password reset pages stay public so email links work without auth state issues.
      { path: "forgot-password", element: <Suspense fallback={<LoadingFallback />}><ForgotPassword /></Suspense> },
      { path: "reset-password/:token", element: <Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense> },

      // Product browsing pages are always public.
      { path: "products", element: <Products /> },
      { path: "product/:productSlug", element: <ProductDetail /> },
      { path: "about", element: <Suspense fallback={<LoadingFallback />}><AboutUs /></Suspense> },
      { path: "contact", element: <Suspense fallback={<LoadingFallback />}><Contact /></Suspense> },
      { path: "privacy-policy", element: <Suspense fallback={<LoadingFallback />}><PrivacyPolicy /></Suspense> },
      { path: "track-order", element: <Suspense fallback={<LoadingFallback />}><TrackOrder /></Suspense> },

      // Checkout/account routes require login.
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <Suspense fallback={<LoadingFallback />}><Profile /></Suspense> },
          { path: "orders/my", element: <Suspense fallback={<LoadingFallback />}><MyOrders /></Suspense> },
          { path: "orders/my/:orderId", element: <Suspense fallback={<LoadingFallback />}><OrderDetail /></Suspense> },
          { path: "orders/my/:orderId/invoice", element: <Suspense fallback={<LoadingFallback />}><OrderInvoice /></Suspense> },
          { path: "checkout/address", element: <Suspense fallback={<LoadingFallback />}><Address /></Suspense> },
          { path: "checkout/success/:orderId", element: <Suspense fallback={<LoadingFallback />}><CheckoutSuccess /></Suspense> },
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
          { index: true, element: <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense> },
          { path: "home-content", element: <Suspense fallback={<LoadingFallback />}><AdminHomeContent /></Suspense> },
          { path: "store-policies", element: <Suspense fallback={<LoadingFallback />}><AdminStorePolicies /></Suspense> },
          { path: "products", element: <Suspense fallback={<LoadingFallback />}><AdminProducts /></Suspense> },
          { path: "orders", element: <Suspense fallback={<LoadingFallback />}><AdminOrders /></Suspense> },
          { path: "returns", element: <Suspense fallback={<LoadingFallback />}><AdminReturns /></Suspense> },
          { path: "orders/:orderId", element: <Suspense fallback={<LoadingFallback />}><AdminOrderDetail /></Suspense> },
          { path: "orders/:orderId/invoice", element: <Suspense fallback={<LoadingFallback />}><AdminOrderInvoice /></Suspense> },
          { path: "users", element: <Suspense fallback={<LoadingFallback />}><AdminUsers /></Suspense> },
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
