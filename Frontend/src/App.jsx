import "./App.css";
import '@fontsource-variable/inter';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, Dashboard } from "./pages/";
import Layout from "./Layout";
import PrivateRoute from "./components/routes/PrivateRoute";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
