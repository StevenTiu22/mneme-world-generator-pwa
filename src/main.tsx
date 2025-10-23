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

// Render app immediately - don't block user
createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="mneme-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

// Initialize database in the background (non-blocking)
// This allows the app to render immediately while the database loads
initializeDatabase()
  .then(() => {
    console.log("🌟 Database initialized successfully");
    // Preload common stellar properties for better performance
    return preloadCommonStellarProperties();
  })
  .then(() => {
    console.log("✅ Ready for stellar operations");
  })
  .catch((error) => {
    console.error("❌ Database initialization failed:", error);
    // Database errors are non-critical - components will handle them gracefully
    // Users can still use the app for other features
  });
