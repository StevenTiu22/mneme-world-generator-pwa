import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import "./index.css";
import App from "./App.tsx";
import { initializeDatabase } from "@/lib/db/database";
import { preloadCommonStellarProperties } from "@/lib/db/queries/stellarQueries";

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

initializeDatabase()
  .then(() => {
    console.log("🌟 Database initialized successfully");
    return preloadCommonStellarProperties();
  })
  .then(() => {
    console.log("[INFO] Ready for stellar operations");
  })
  .catch((error) => {
    console.error("[ERROR] Database initialization failed:", error);
  });
