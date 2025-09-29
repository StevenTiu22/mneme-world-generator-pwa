import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import "./index.css";
import App from "./App.tsx";

document.title = "Mneme World Generator";

const root = document.getElementById("root")!;

createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="mneme-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
