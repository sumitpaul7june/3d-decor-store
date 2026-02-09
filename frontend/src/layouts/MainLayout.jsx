// Shared layout for public pages: navbar + footer around content.
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

function MainLayout({ children }) {
  return (
    <>
      <NavBar />
      <Outlet/>
      <Footer />
    </>
  );
}

export default MainLayout;
