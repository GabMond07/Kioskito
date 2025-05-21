import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import NavBarSubs from "./components/NavBarSubs";

function LayoutSuscription() {
  return (
    <>
      <NavBarSubs />
      <Outlet />
      <Footer />
    </>
  );
}

export default LayoutSuscription;
