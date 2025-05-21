import "./App.css";
import "@fontsource-variable/inter";
import "@fontsource/poppins/500.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, Landing, Popular, MyList, Subscription, AdminDashboard, Profile } from "./pages/";
import Layout from "./Layout";
import AdminLayout from "./AdminLayout";
import PrivateRoute from "./components/routes/PrivateRoute";
import LayoutSuscription from "./LayoutSuscription";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/home",
        element: (
          <PrivateRoute roleRequired={1}>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/popular",
        element: (
          <PrivateRoute roleRequired={1}>
            <Popular />
          </PrivateRoute>
        ),
      },
      {
        path: "/mylist",
        element: (
          <PrivateRoute roleRequired={1}>
            <MyList />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute roleRequired={1}>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/",
        element: <Landing />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/admin",
        element: (
          <PrivateRoute roleRequired={2}>
            <AdminDashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    element: <LayoutSuscription />,
    children: [
      {
        path: "/subscription",
        element: (
          <PrivateRoute roleRequired={1}>
            <Subscription />
          </PrivateRoute>
        ),
      },
    ],
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
