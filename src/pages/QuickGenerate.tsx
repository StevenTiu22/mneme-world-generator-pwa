import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { generatePrimaryStar } from "@/lib/generators/primaryStarGenerator";
import { generateCompanionStars } from "@/lib/generators/companionStarGenerator";
import { generateWorld } from "@/lib/generators/worldGenerator";
import { generateCulture } from "@/lib/generators/cultureGenerator";
import { generateStarport } from "@/lib/generators/starportGenerator";
import { generateMoon } from "@/lib/generators/moonGenerator";
import { generateDisk } from "@/lib/generators/diskGenerator";
import { generatePlanet } from "@/lib/generators/planetGenerator";
import { saveMoons } from "@/lib/db/queries/moonQueries";
import { savePlanets } from "@/lib/db/queries/planetQueries";
import { saveWorld } from "@/lib/db/queries/worldQueries";
import { saveStarSystem, generateSystemId } from "@/lib/db/queries/starQueries";
import { calculateStellarZonesFromClassGrade } from "@/lib/stellar/zoneCalculations";
import type { StellarClass, StellarGrade } from "@/models/stellar/types/enums";
import type { MoonData } from "@/models/world/moon";
import type { PlanetData } from "@/models/world/planet";

export function QuickGenerate() {
  const [status, setStatus] = useState("Initializing generation...");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function generateSystem() {
      try {
        // Step 1: Generate primary star
        setStatus("🎲 Rolling for primary star...");
        setProgress(15);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Brief delay for UX

        const primaryStar = await generatePrimaryStar();
        localStorage.setItem("primaryStar", JSON.stringify(primaryStar));
        console.log("✅ Primary star generated:", primaryStar.name);

        // Step 2: Generate companion stars
        setStatus("🌟 Rolling for companion stars...");
        setProgress(30);
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
        setProgress(40);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const worldContext = {
          techLevel: "11", // Default: Interstellar Settlement
          advantages: [],
          disadvantages: [],
        };
        localStorage.setItem("worldContext", JSON.stringify(worldContext));

        // Step 4: Generate main world
        setStatus("🪐 Rolling for main world...");
        setProgress(50);
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
        setProgress(55);
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
        setProgress(60);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Map generated values to CreateHabitability page format
        const habitabilityData = {
          atmosphere:
            generatedWorld.atmosphericPressure?.toLowerCase() || "standard",
          temperature:
            generatedWorld.temperature?.toLowerCase() || "temperate",
          hazardType: generatedWorld.hazardType?.toLowerCase() || "none",
          hazardIntensity: generatedWorld.hazardIntensity?.toString() || "",
          biochemicalResources:
            generatedWorld.biochemicalResources?.toLowerCase() || "abundant",

          // Store modifiers
          atmosphereModifier: 0, // Will be calculated by CreateHabitability
          temperatureModifier: 0,
          hazardTypeModifier: 0,
          hazardIntensityModifier: 0,
          biochemicalResourcesModifier: 0,
        };
        localStorage.setItem("habitability", JSON.stringify(habitabilityData));
        console.log("✅ Habitability set");

        // Step 7: Save inhabitants data from generated world
        setStatus("👥 Rolling for inhabitants...");
        setProgress(65);
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
        setProgress(70);
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
        setProgress(75);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const positionData = {
          selectedHex: { q: 1, r: 0, zone: "habitable" },
          auDistance: 20, // ~1 AU
        };
        localStorage.setItem("position", JSON.stringify(positionData));
        console.log("✅ Position set");

        // Step 10: Save to Database
        setStatus("💾 Saving to database...");
        setProgress(80);
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          // Create star system object
          const starSystemId = generateSystemId();
          const now = new Date().toISOString();

          // Add required StarData properties to companions
          const companionStarsWithTimestamps = companionResult.companions.map(comp => ({
            ...comp,
            createdAt: now,
            updatedAt: now,
            createdBy: 'quick-generate',
          }));

          const starSystem = {
            id: starSystemId,
            name: primaryStar.name,
            primaryStar: primaryStar,
            companionStars: companionStarsWithTimestamps,
            createdAt: now,
            updatedAt: now,
            createdBy: 'quick-generate',
          };

          // Save star system to database
          await saveStarSystem(starSystem);
          console.log("✅ Star system saved to database:", starSystemId);

          // Save main world to database
          const worldToSave = {
            ...generatedWorld,
            starSystemId: starSystemId,
          };
          const savedWorld = await saveWorld(worldToSave);
          console.log("✅ Main world saved to database:", savedWorld.id);

          // Store IDs for next steps
          localStorage.setItem('quickGen_starSystemId', starSystemId);
          localStorage.setItem('quickGen_worldId', savedWorld.id || generatedWorld.id);
        } catch (error) {
          console.error('❌ Error saving to database:', error);
          // Continue anyway - localStorage data is still available
        }

        // Step 11: Generate Moons
        setStatus("🌙 Generating moons...");
        setProgress(85);
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const starSystemId = localStorage.getItem('quickGen_starSystemId');
          const worldId = localStorage.getItem('quickGen_worldId');

          if (starSystemId && worldId) {
            const generatedMoons: MoonData[] = [];
            const defaultMoonCount = 2; // Default: 2 moons (configurable in review)

            for (let i = 0; i < defaultMoonCount; i++) {
              const moon = generateMoon({
                worldId,
                starSystemId,
                orbitPosition: i + 1,
                advantage: 0,
                disadvantage: 0,
              });
              generatedMoons.push(moon);
            }

            // Save all moons to database
            if (generatedMoons.length > 0) {
              await saveMoons(generatedMoons);
              console.log(`✅ Generated ${generatedMoons.length} moon(s) (user can add/remove in review)`);
            }

            // Store moon count for potential UI display
            localStorage.setItem('quickGen_moonCount', String(defaultMoonCount));
          }
        } catch (error) {
          console.error('❌ Error generating moons:', error);
          // Continue anyway
        }

        // Step 12: Generate Circumstellar Disks
        setStatus("💿 Generating circumstellar disks...");
        setProgress(90);
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const starSystemId = localStorage.getItem('quickGen_starSystemId');

          if (starSystemId) {
            // Calculate stellar zones for the primary star
            const stellarZones = await calculateStellarZonesFromClassGrade(
              primaryStar.stellarClass as StellarClass,
              primaryStar.stellarGrade as StellarGrade
            );

            if (stellarZones) {
              const generatedDisks: PlanetData[] = [];

              // Determine disk count: 1D6 (1-3 = 1 disk, 4-6 = 2 disks)
              const roll = Math.floor(Math.random() * 6) + 1;
              const diskCount = roll <= 3 ? 1 : 2;

              for (let i = 0; i < diskCount; i++) {
                // generateDisk() uses 2D6 internally for:
                // - Zone (Habitable zones most likely: 52.8%)
                // - Type (Protoplanetary 58.3%, Accretion 41.7%)
                // - Mass (distributed via 2D6 bell curve)
                const disk = generateDisk({
                  starSystemId,
                  stellarZones,
                  advantage: 0,
                  disadvantage: 0,
                });
                generatedDisks.push(disk);
              }

              // Save all disks to database
              if (generatedDisks.length > 0) {
                await savePlanets(generatedDisks);
                console.log(`✅ Generated ${generatedDisks.length} disk(s)`);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error generating disks:', error);
          // Continue anyway
        }

        // Step 13: Generate Secondary Planets
        setStatus("🪐 Generating secondary planets...");
        setProgress(95);
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const starSystemId = localStorage.getItem('quickGen_starSystemId');
          const worldPosition = positionData.selectedHex?.q || 3; // Primary world orbit (default to 3)

          if (starSystemId) {
            const generatedPlanets: PlanetData[] = [];

            // Determine planet count: 1D6 + 2 = 3-8 planets
            const planetCount = Math.floor(Math.random() * 6) + 1 + 2;

            // Get available orbits (exclude primary world orbit)
            const maxOrbits = 10;
            const availableOrbits = [];
            for (let i = 1; i <= maxOrbits; i++) {
              if (i !== worldPosition) {
                availableOrbits.push(i);
              }
            }

            // Shuffle and take first planetCount orbits
            const shuffled = availableOrbits.sort(() => Math.random() - 0.5);
            const selectedOrbits = shuffled.slice(0, Math.min(planetCount, availableOrbits.length));

            for (const orbit of selectedOrbits) {
              // generatePlanet() uses 2D6 internally for:
              // - Type: Gas Giant 67%, Ice Giant 25%, Belts 8%
              // - Size: Varies by type (also 2D6-based)
              // - Density: For belts (also 2D6-based)
              const planet = generatePlanet({
                starSystemId,
                orbitPosition: orbit,
                advantage: 0,
                disadvantage: 0,
              });
              generatedPlanets.push(planet);
            }

            // Save all planets to database
            if (generatedPlanets.length > 0) {
              await savePlanets(generatedPlanets);
              console.log(`✅ Generated ${generatedPlanets.length} secondary planet(s)`);
            }
          }
        } catch (error) {
          console.error('❌ Error generating planets:', error);
          // Continue anyway
        }

        // Step 14: Complete
        setStatus("✨ Generation complete!");
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Clean up temporary localStorage IDs (but keep wizard data for review)
        localStorage.removeItem('quickGen_starSystemId');
        localStorage.removeItem('quickGen_worldId');
        localStorage.removeItem('quickGen_moonCount');

        // Navigate to primary star page for review
        // This allows users to review and modify all generated data
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
        {/* Star Icon */}
        <div className="flex items-center justify-center">
          <Sparkles className="h-20 w-20 text-primary animate-pulse" />
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
