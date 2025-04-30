import "./App.css";
import '@fontsource-variable/inter';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./Pages/";
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
