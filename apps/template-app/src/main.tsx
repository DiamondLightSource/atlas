import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { DiamondTheme, ThemeProvider } from "@diamondlightsource/sci-react-ui";


const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={DiamondTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
