import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { DiamondTheme, ThemeProvider } from "@diamondlightsource/sci-react-ui";
import { Layout } from "./routes/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "test",
        element: <TestPage />,
      },
    ],
  },
]);

function TestPage() {
  return (
    <div>
      <p>
        <b>NOTHING HERE YET</b>
      </p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={DiamondTheme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
