import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import NavBarAdmin from "./components/NavBarAdmin";

function AdminLayout() {
  return (
    <>
      <NavBarAdmin />
      <Outlet />
      <Footer />
    </>
  );
}

export default AdminLayout;
