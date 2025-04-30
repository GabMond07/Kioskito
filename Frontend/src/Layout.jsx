import { Outlet } from "react-router-dom";
import Navigation from "./Components/Navigation";
import Footer from "./Components/Footer";

function Layout() {
  return (
    <>
      <Navigation />
      <Outlet />
      {/* <Footer /> */}
    </>
  );
}

export default Layout;
