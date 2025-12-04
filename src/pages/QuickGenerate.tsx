import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { generatePrimaryStar } from "@/lib/generators/primaryStarGenerator";
import { generateCompanionStars } from "@/lib/generators/companionStarGenerator";
import { generateWorld } from "@/lib/generators/worldGenerator";
import { generateCulture } from "@/lib/generators/cultureGenerator";
import { generateStarport } from "@/lib/generators/starportGenerator";
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
        setProgress(60);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const worldContext = {
          techLevel: "11", // Default: Interstellar Settlement
          advantages: [],
          disadvantages: [],
        };
        localStorage.setItem("worldContext", JSON.stringify(worldContext));

        // Step 4: Generate main world
        setStatus("🪐 Rolling for main world...");
        setProgress(70);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const generatedWorld = generateWorld({
          starSystemId: primaryStar.id || `temp-system-${Date.now()}`,
          techLevel: 11,
          worldName: "Primary World #1",
        });

        // The WorldType values are already 'habitat', 'terrestrial', 'dwarf' strings
        // which match what CreateMainWorld expects, so we can use them directly
        const worldType = generatedWorld.type as
          | "habitat"
          | "terrestrial"
          | "dwarf";

        // Save main world data in format compatible with CreateMainWorld page
        const mainWorldData = {
          name: generatedWorld.name,
          type: worldType,
          size: generatedWorld.size.toString(),
          gravity: (
            generatedWorld.diceRolls?.gravityRoll || generatedWorld.size
          ).toString(),
          lesserEarthType: generatedWorld.composition || "",
          techLevel: "11",
          worldId: generatedWorld.id,
          generationMethod: generatedWorld.generationMethod,
          diceRolls: generatedWorld.diceRolls,
        };
        localStorage.setItem("mainWorld", JSON.stringify(mainWorldData));
        console.log("✅ Main world generated:", mainWorldData.name);

        // Step 5: Generate and save culture data
        setStatus("🎭 Rolling for cultural traits...");
        setProgress(75);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const cultureData = generateCulture({ worldId: generatedWorld.id });
        const worldCultureData = {
          traits: cultureData.traits,
          generationMethod: "procedural",
        };
        localStorage.setItem("worldCulture", JSON.stringify(worldCultureData));
        console.log("✅ Culture generated");

        // Step 6: Save habitability data from generated world
        setStatus("🌡️ Setting habitability parameters...");
        setProgress(80);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Map generated values to habitability page format
        const temperatureMap: Record<string, number> = {
          inferno: 10,
          hot: 30,
          average: 50,
          cold: 70,
          freezing: 90,
        };
        const temperatureValue =
          temperatureMap[
            generatedWorld.temperature?.toLowerCase() || "average"
          ] || 50;

        const hazardIntensityMap: Record<number, number> = {
          1: 10,
          2: 30,
          3: 50,
          4: 70,
          5: 90,
        };
        const hazardIntensityValue =
          hazardIntensityMap[generatedWorld.hazardIntensity || 0] || 50;

        const habitabilityData = {
          atmosphericPressure:
            generatedWorld.atmosphericPressure?.toLowerCase() || "average",
          temperature: temperatureValue,
          hazardType: generatedWorld.hazardType?.toLowerCase() || "none",
          hazardIntensity: hazardIntensityValue,
          biochemicalResources:
            generatedWorld.biochemicalResources?.toLowerCase() || "abundant",
        };
        localStorage.setItem("habitability", JSON.stringify(habitabilityData));
        console.log("✅ Habitability set");

        // Step 7: Save inhabitants data from generated world
        setStatus("👥 Rolling for inhabitants...");
        setProgress(85);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Map wealth number to inhabitants page format
        // wealth is a number: -2 to 5 range
        const getWealthLabel = (wealth: number | undefined): string => {
          if (wealth === undefined) return "average";
          if (wealth <= 0) return "average";
          if (wealth === 1) return "average";
          if (wealth === 2) return "better-off";
          if (wealth === 3) return "prosperous";
          return "affluent"; // 4+
        };

        // Map power structure string to page format
        const powerStructureMap: Record<string, string> = {
          anarchy: "anarchy",
          confederation: "confederation",
          federation: "federation",
          "unitary state": "unitary-state",
          autocracy: "unitary-state",
          oligarchy: "confederation",
          democracy: "federation",
        };

        // Map source of power string to page format
        const sourceOfPowerMap: Record<string, string> = {
          aristocracy: "aristocracy",
          ideocracy: "ideocracy",
          kratocracy: "kratocracy",
          democracy: "democracy",
          meritocracy: "meritocracy",
          military: "kratocracy",
          religious: "ideocracy",
          corporate: "meritocracy",
        };

        // Map development level enum to page format
        const developmentMap: Record<string, string> = {
          underdeveloped: "underdeveloped",
          developing: "developing",
          mature: "mature",
          developed: "developed",
          "well-developed": "well-developed",
          well_developed: "well-developed",
          "very-developed": "very-developed",
          very_developed: "very-developed",
        };

        const inhabitantsData = {
          population: generatedWorld.population?.toString() || "100000000",
          wealth: getWealthLabel(generatedWorld.wealth),
          powerStructure:
            powerStructureMap[
              generatedWorld.powerStructure?.toLowerCase() || "federation"
            ] || "federation",
          development:
            developmentMap[
              generatedWorld.developmentLevel
                ?.toLowerCase()
                .replace(/_/g, "-") || "developed"
            ] || "developed",
          sourceOfPower:
            sourceOfPowerMap[
              generatedWorld.sourceOfPower?.toLowerCase() || "democracy"
            ] || "democracy",
          amberZone: false,
          amberZoneReason: "",
        };
        localStorage.setItem("inhabitants", JSON.stringify(inhabitantsData));
        console.log("✅ Inhabitants set");

        // Step 8: Generate and save starport data
        setStatus("🚀 Rolling for starport...");
        setProgress(90);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const starportData = generateStarport({
          worldId: generatedWorld.id,
          habitabilityScore: generatedWorld.habitabilityScore || 0,
          techLevel: 11,
          wealth: 0,
          developmentModifier: 6,
        });
        const worldStarportData = {
          starport: starportData,
        };
        localStorage.setItem(
          "worldStarport",
          JSON.stringify(worldStarportData)
        );
        console.log("✅ Starport generated:", starportData.starportClass);

        // Step 9: Set default position (habitable zone)
        setStatus("🎯 Setting orbital position...");
        setProgress(95);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const positionData = {
          selectedHex: { q: 1, r: 0, zone: "habitable" },
          auDistance: 20, // ~1 AU
        };
        localStorage.setItem("position", JSON.stringify(positionData));
        console.log("✅ Position set");

        // Step 10: Complete
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
            Rolling dice for stellar classification, companion stars, world
            properties, cultural traits, habitability, inhabitants, starport
            class, and orbital position...
          </p>
        </div>
      </div>
    </div>
  );
}
