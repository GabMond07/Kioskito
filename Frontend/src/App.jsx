import "./App.css";
import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, Books } from "./pages/";
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
        path: "/books",
        element: (
          <PrivateRoute>
            <Books />
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
