import "./App.css";
import "@fontsource-variable/inter";
import "@fontsource/poppins/500.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, Books, Landing, Popular, MyList, Subscription } from "./pages/";
import Layout from "./Layout";
import PrivateRoute from "./components/routes/PrivateRoute";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/home",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/books",
        element: (
          <PrivateRoute>
            <Books />
          </PrivateRoute>
        ),
      },
      {
        path: "/popular",
        element: (
          <PrivateRoute>
            <Popular />
          </PrivateRoute>
        ),
      },
      {
        path: "/mylist",
        element: (
          <PrivateRoute>
            <MyList />
          </PrivateRoute>
        ),
      },
      
      {
        path: "/subscription",
        element: (
          <PrivateRoute>
            <Subscription />
          </PrivateRoute>
        ),
      },
      {
        path: "/",
        element: <Landing />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
