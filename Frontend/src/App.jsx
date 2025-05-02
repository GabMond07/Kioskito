import "./App.css";
import '@fontsource-variable/inter';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home";
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
            <h1>Dashboard</h1>
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
