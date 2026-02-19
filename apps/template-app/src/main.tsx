import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { InstrumentSessionProvider } from "./context/instrumentSession/InstrumentSessionProvider.tsx";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

createRoot(document.getElementById("root")!).render(
  <InstrumentSessionProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </InstrumentSessionProvider>,
);
