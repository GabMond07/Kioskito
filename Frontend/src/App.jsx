import "./App.css";
import '@fontsource-variable/inter';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, Login, Register } from "./Pages/";
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/Login",
        element: <Login />,
      },
      {
        path: "/Register",
        element: <Register />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
