import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { generatePrimaryStar } from "@/lib/generators/primaryStarGenerator";
import { generateCompanionStars } from "@/lib/generators/companionStarGenerator";
import type { StellarClass, StellarGrade } from "@/models/stellar/types/enums";

export function QuickGenerate() {
  const [status, setStatus] = useState("Initializing generation...");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function generateSystem() {
      try {
        // Step 1: Generate primary star
        setStatus("🎲 Rolling for primary star...");
        setProgress(20);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Brief delay for UX

        const primaryStar = await generatePrimaryStar();
        localStorage.setItem("primaryStar", JSON.stringify(primaryStar));
        console.log("✅ Primary star generated:", primaryStar.name);

        // Step 2: Generate companion stars
        setStatus("🌟 Rolling for companion stars...");
        setProgress(50);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const companionResult = await generateCompanionStars(
          primaryStar.stellarClass as StellarClass,
          primaryStar.stellarGrade as StellarGrade
        );

        // Determine system type based on companion count
        let systemType = "Single Star";
        if (companionResult.companions.length === 1) {
          systemType = "Binary";
        } else if (companionResult.companions.length === 2) {
          systemType = "Trinary";
        } else if (companionResult.companions.length === 3) {
          systemType = "Quaternary";
        }

        // Save companion data to localStorage
        const companionData = {
          systemType,
          companions: companionResult.companions.map((comp) => ({
            id: comp.id,
            name: comp.name,
            class: comp.stellarClass,
            grade: comp.stellarGrade,
            luminosity: "V" as const,
            orbitalDistance: Math.round(comp.orbitalDistance * 10) / 10,
            mass: comp.mass ?? null,
            age: null,
            generationMethod: comp.generationMethod,
            diceRolls: comp.diceRolls,
          })),
        };
        localStorage.setItem("companionStars", JSON.stringify(companionData));
        console.log(
          `✅ Generated ${companionResult.companions.length} companion(s)`
        );

        // Step 3: Set default world context
        setStatus("🌍 Setting world context...");
        setProgress(75);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const worldContext = {
          techLevel: "11", // Default: Interstellar Settlement
          advantages: [],
          disadvantages: [],
        };
        localStorage.setItem("worldContext", JSON.stringify(worldContext));

        // Step 4: Complete
        setStatus("✨ Generation complete!");
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Navigate to primary star page for review
        console.log("🚀 Navigating to wizard for review...");
        navigate("/create-new/primary-star");
      } catch (error) {
        console.error("❌ Generation failed:", error);
        setStatus("❌ Generation failed");
        alert(
          "Failed to generate star system. Please try again.\n\n" +
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        navigate("/create-new");
      }
    }

    generateSystem();
  }, [navigate]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        {/* Icon and Spinner */}
        <div className="relative">
          <Sparkles className="h-20 w-20 text-primary absolute -top-2 -left-2 animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>

        {/* Status Text */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold">{status}</h2>
          <p className="text-muted-foreground">
            Generating your star system using procedural dice mechanics...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {progress}% complete
          </p>
        </div>

        {/* Flavor Text */}
        <div className="text-center text-sm text-muted-foreground max-w-md">
          <p>
            Rolling dice for stellar classification, checking for companion
            stars, and setting up your world's technological context...
          </p>
        </div>
      </div>
    </div>
  );
}
