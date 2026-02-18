// Shared layout for public pages: navbar + footer around content.
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Outlet, useLocation } from "react-router-dom";

function MainLayout() {
  const location = useLocation();
  // Hide footer during checkout to keep focus on buying flow.
  const isCheckoutRoute = location.pathname.startsWith("/checkout");

  return (
    <>
      {/* Top navigation is shared across storefront pages. */}
      <NavBar />
      {/* Routed page content renders here. */}
      <Outlet/>
      {/* Footer is shown for non-checkout pages. */}
      {!isCheckoutRoute && <Footer />}
    </>
  );
}

export default MainLayout;
