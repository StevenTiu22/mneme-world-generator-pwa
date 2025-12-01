import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, ChevronDown, ArrowDown, Check, AlertCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { saveWorld } from "@/lib/db/queries/worldQueries";
import type { WorldData } from "@/models/world/interface";
import { GenerationMethod } from "@/models/common/types";

interface CelestialBody {
  id: string;
  type: "star" | "world" | "disk";
  name: string;
  luminosity?: string;
  size?: string;
  position?: string;
  modifiers: string[];
}

export function CreatePlanetarySystem() {
  const navigate = useNavigate();
  const [bodies, setBodies] = useState<CelestialBody[]>([]);
  const [diskOpen, setDiskOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [worldSummary, setWorldSummary] = useState<any>(null);

  useEffect(() => {
    // Load data from previous steps
    const primaryStar = localStorage.getItem("primaryStar");
    const mainWorld = localStorage.getItem("mainWorld");

    const loadedBodies: CelestialBody[] = [];

    if (primaryStar) {
      const starData = JSON.parse(primaryStar);
      loadedBodies.push({
        id: "primary-star",
        type: "star",
        name: starData.name || "Star A9",
        luminosity: "1.0 L☉",
        size: "1.0 M☉",
        position: "0 AU",
        modifiers: [],
      });
    }

    if (mainWorld) {
      const worldData = JSON.parse(mainWorld);
      loadedBodies.push({
        id: "primary-world",
        type: "world",
        name: worldData.name || "Primary World",
        luminosity: "N/A",
        size: worldData.size || "1.0 EM",
        position: "1.0 AU",
        modifiers: [],
      });
    }

    setBodies(loadedBodies);
  }, []);

  // Load world summary data
  useEffect(() => {
    try {
      const mainWorldRaw = localStorage.getItem("mainWorld");
      const worldContextRaw = localStorage.getItem("worldContext");
      const habitabilityRaw = localStorage.getItem("habitability");
      const inhabitantsRaw = localStorage.getItem("inhabitants");
      const worldStarportRaw = localStorage.getItem("worldStarport");
      const worldCultureRaw = localStorage.getItem("worldCulture");

      if (!mainWorldRaw || !worldContextRaw) {
        return;
      }

      const mainWorld = JSON.parse(mainWorldRaw);
      const worldContext = JSON.parse(worldContextRaw);
      const habitability = habitabilityRaw ? JSON.parse(habitabilityRaw) : null;
      const inhabitants = inhabitantsRaw ? JSON.parse(inhabitantsRaw) : null;
      const worldStarport = worldStarportRaw ? JSON.parse(worldStarportRaw) : null;
      const worldCulture = worldCultureRaw ? JSON.parse(worldCultureRaw) : null;

      setWorldSummary({
        mainWorld,
        worldContext,
        habitability,
        inhabitants,
        starport: worldStarport?.starport,
        culture: worldCulture, // worldCulture already has traits directly
      });
    } catch (error) {
      console.error("Failed to load world summary:", error);
    }
  }, []);

  const handleAddDisk = () => {
    const newDisk: CelestialBody = {
      id: `disk-${Date.now()}`,
      type: "disk",
      name: `Disk ${bodies.filter((b) => b.type === "disk").length + 1}`,
      position: "3.0 AU",
      modifiers: [],
    };
    setBodies([...bodies, newDisk]);
  };

  // Gather all data from localStorage and save to database
  const handleCompleteWorld = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Gather data from all wizard steps
      const mainWorldRaw = localStorage.getItem("mainWorld");
      const worldContextRaw = localStorage.getItem("worldContext");
      const habitabilityRaw = localStorage.getItem("habitability");
      const inhabitantsRaw = localStorage.getItem("inhabitants");
      const worldStarportRaw = localStorage.getItem("worldStarport");
      const worldCultureRaw = localStorage.getItem("worldCulture");
      const primaryStarRaw = localStorage.getItem("primaryStar");

      if (!mainWorldRaw || !worldContextRaw) {
        throw new Error("Missing required world data. Please complete all wizard steps.");
      }

      const mainWorld = JSON.parse(mainWorldRaw);
      const worldContext = JSON.parse(worldContextRaw);
      const habitability = habitabilityRaw ? JSON.parse(habitabilityRaw) : null;
      const inhabitants = inhabitantsRaw ? JSON.parse(inhabitantsRaw) : null;
      const worldStarport = worldStarportRaw ? JSON.parse(worldStarportRaw) : null;
      const worldCulture = worldCultureRaw ? JSON.parse(worldCultureRaw) : null;
      const primaryStar = primaryStarRaw ? JSON.parse(primaryStarRaw) : null;

      // Calculate habitability score if data exists
      let habitabilityScore: number | undefined;
      if (habitability) {
        habitabilityScore = calculateHabitabilityScore(habitability);
      }

      // Assemble complete WorldData object
      const worldData: WorldData = {
        // Identity
        id: mainWorld.worldId || `world-${Date.now()}`,
        name: mainWorld.name,
        starSystemId: primaryStar?.starSystemId || `system-${Date.now()}`,

        // Basic properties
        type: mainWorld.type,
        size: mainWorld.size,
        mass: mainWorld.mass,
        gravity: mainWorld.gravity,
        composition: mainWorld.composition,

        // Habitability properties
        atmosphericPressure: habitability?.atmosphericPressure,
        temperature: habitability?.temperature !== undefined
          ? getTemperatureLabel(habitability.temperature)
          : undefined,
        hazardType: habitability?.hazardType,
        hazardIntensity: habitability?.hazardIntensity,
        biochemicalResources: habitability?.biochemicalResources,
        habitabilityScore,

        // Inhabitants properties
        population: inhabitants?.population ? parseInt(inhabitants.population) : undefined,
        wealth: inhabitants?.wealth ? getWealthValue(inhabitants.wealth) : undefined,
        powerStructure: inhabitants?.powerStructure,
        governance: inhabitants?.development, // Using development as governance
        sourceOfPower: inhabitants?.sourceOfPower,

        // Starport properties
        portValueScore: worldStarport?.starport?.portValueScore,
        starportClass: worldStarport?.starport?.starportClass,
        starportFeatures: worldStarport?.starport?.capabilities,

        // Culture properties
        culturalTraits: worldCulture?.traits?.map((t: any) => t.trait),

        // Development
        techLevel: parseInt(worldContext.techLevel),
        developmentLevel: inhabitants?.development,

        // Generation metadata
        generationMethod: mainWorld.generationMethod || GenerationMethod.CUSTOM,
        diceRolls: mainWorld.diceRolls,

        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "user", // TODO: Replace with actual user ID when auth is implemented
      };

      console.log("💾 Saving complete world data:", worldData);

      // Save to database
      await saveWorld(worldData);

      console.log("✅ World saved successfully!");
      setSaveSuccess(true);

      // Clean up localStorage after successful save
      setTimeout(() => {
        localStorage.removeItem("mainWorld");
        localStorage.removeItem("worldContext");
        localStorage.removeItem("habitability");
        localStorage.removeItem("inhabitants");
        localStorage.removeItem("worldStarport");
        localStorage.removeItem("worldCulture");
        localStorage.removeItem("position");
        // Keep primaryStar and companionStar for potential reuse

        // Navigate to my-worlds
        navigate("/my-worlds");
      }, 1500);

    } catch (error) {
      console.error("❌ Failed to save world:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save world");
      setIsSaving(false);
    }
  };

  // Helper functions (duplicated from other pages for self-containment)
  const calculateHabitabilityScore = (data: any): number => {
    let total = 0;

    // Atmospheric pressure
    const pressures = [
      { value: "crushing", habitability: -2.5 },
      { value: "dense", habitability: -2 },
      { value: "trace", habitability: -1.5 },
      { value: "thin", habitability: -1 },
      { value: "average", habitability: 0 },
    ];
    const pressure = pressures.find((p) => p.value === data.atmosphericPressure);
    if (pressure) total += pressure.habitability;

    // Temperature
    const temp = data.temperature || 50;
    if (temp <= 20) total += -2;
    else if (temp <= 40) total += -1.5;
    else if (temp <= 60) total += 0;
    else if (temp <= 80) total += -0.5;
    else total += -1;

    // Hazard
    if (data.hazardType && data.hazardType !== "none") {
      const hazards = [
        { value: "radioactive", habitability: -1.5 },
        { value: "toxic", habitability: -1.5 },
        { value: "biohazard", habitability: -1 },
        { value: "corrosive", habitability: -1 },
        { value: "polluted", habitability: -0.5 },
      ];
      const hazard = hazards.find((h) => h.value === data.hazardType);
      if (hazard) total += hazard.habitability;

      const intensity = data.hazardIntensity || 50;
      if (intensity <= 20) total += 0;
      else if (intensity <= 40) total += -0.5;
      else if (intensity <= 60) total += -1;
      else if (intensity <= 80) total += -1.5;
      else total += -2;
    }

    // Resources
    const resources = [
      { value: "scarce", habitability: -5 },
      { value: "rare", habitability: -4 },
      { value: "uncommon", habitability: -3 },
      { value: "abundant", habitability: 0 },
      { value: "inexhaustible", habitability: 5 },
    ];
    const resource = resources.find((r) => r.value === data.biochemicalResources);
    if (resource) total += resource.habitability;

    return parseFloat(total.toFixed(1));
  };

  const getTemperatureLabel = (value: number): string => {
    if (value <= 20) return "Inferno";
    if (value <= 40) return "Hot";
    if (value <= 60) return "Average";
    if (value <= 80) return "Cold";
    return "Freezing";
  };

  const getWealthValue = (wealthString: string): number => {
    const wealthOptions = [
      { value: "average", soc: 0 },
      { value: "better-off", soc: 1 },
      { value: "prosperous", soc: 2 },
      { value: "affluent", soc: 3 },
    ];
    const wealth = wealthOptions.find((w) => w.value === wealthString);
    return wealth ? wealth.soc : 0;
  };

  const CelestialCard = ({ body }: { body: CelestialBody }) => {
    const getGradient = (type: string) => {
      if (type === "star") {
        return "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900";
      }
      return "bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950";
    };

    return (
      <Card className={`overflow-hidden ${getGradient(body.type)}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Planet/Star Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200 to-blue-400 shadow-lg" />
              <div>
                <h3 className="text-2xl font-bold text-white">{body.name}</h3>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {body.modifiers.length === 0
                ? "No modifiers"
                : `${body.modifiers.length} modifiers`}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-white">
            {body.luminosity && (
              <div>
                <p className="text-sm text-white/60 mb-1">Luminosity</p>
                <p className="font-semibold">{body.luminosity}</p>
              </div>
            )}
            {body.size && (
              <div>
                <p className="text-sm text-white/60 mb-1">Size</p>
                <p className="font-semibold">{body.size}</p>
              </div>
            )}
          </div>

          {body.position && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-white/60 mb-1">Position</p>
              <p className="font-semibold text-white">{body.position}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Planetary System</h1>
        <p className="text-muted-foreground">
          Overview of your generated stellar system
        </p>
      </div>

      {/* Celestial Bodies */}
      <div className="space-y-6">
        {bodies.map((body, index) => (
          <div key={body.id}>
            <CelestialCard body={body} />
            {index < bodies.length - 1 && (
              <div className="flex justify-center py-4">
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Disk Section */}
        <Collapsible open={diskOpen} onOpenChange={setDiskOpen}>
          <div className="flex items-center justify-between py-4">
            <h2 className="text-xl font-semibold">Disk</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAddDisk}>
                <Plus className="h-4 w-4 mr-2" />
                Add Disk
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      diskOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="space-y-4">
              {bodies
                .filter((b) => b.type === "disk")
                .map((disk) => (
                  <CelestialCard key={disk.id} body={disk} />
                ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* World Summary */}
        {worldSummary && (
          <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen} className="mt-8">
            <div className="flex items-center justify-between py-4 border-b">
              <h2 className="text-2xl font-bold">World Summary</h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      summaryOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="space-y-6 pt-6">
                {/* Basic Properties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold">{worldSummary.mainWorld.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold capitalize">{worldSummary.mainWorld.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-semibold">{worldSummary.mainWorld.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mass</p>
                      <p className="font-semibold">{worldSummary.mainWorld.mass} EM</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gravity</p>
                      <p className="font-semibold">{worldSummary.mainWorld.gravity} G</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tech Level</p>
                      <p className="font-semibold">{worldSummary.worldContext.techLevel}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Habitability */}
                {worldSummary.habitability && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Habitability</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Atmospheric Pressure</p>
                        <p className="font-semibold capitalize">
                          {worldSummary.habitability.atmosphericPressure || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Temperature</p>
                        <p className="font-semibold">
                          {getTemperatureLabel(worldSummary.habitability.temperature || 50)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hazard Type</p>
                        <p className="font-semibold capitalize">
                          {worldSummary.habitability.hazardType || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Biochemical Resources</p>
                        <p className="font-semibold capitalize">
                          {worldSummary.habitability.biochemicalResources || "Not set"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Habitability Score</p>
                        <p className="font-semibold text-lg">
                          {calculateHabitabilityScore(worldSummary.habitability).toFixed(1)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Inhabitants */}
                {worldSummary.inhabitants && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Inhabitants</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Population</p>
                        <p className="font-semibold">{worldSummary.inhabitants.population || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Wealth</p>
                        <p className="font-semibold capitalize">{worldSummary.inhabitants.wealth || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Power Structure</p>
                        <p className="font-semibold capitalize">
                          {worldSummary.inhabitants.powerStructure?.replace("-", " ") || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Development</p>
                        <p className="font-semibold capitalize">
                          {worldSummary.inhabitants.development?.replace("-", " ") || "Not set"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Source of Power</p>
                        <p className="font-semibold capitalize">
                          {worldSummary.inhabitants.sourceOfPower?.replace("-", " ") || "Not set"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Starport */}
                {worldSummary.starport && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Starport</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Class</p>
                          <p className="font-semibold text-2xl">{worldSummary.starport.starportClass}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Port Value Score</p>
                          <p className="font-semibold text-lg">{worldSummary.starport.portValueScore}</p>
                        </div>
                      </div>
                      {worldSummary.starport.capabilities && worldSummary.starport.capabilities.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-2">
                            {worldSummary.starport.capabilities.map((cap: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{cap}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {worldSummary.starport.bases && worldSummary.starport.bases.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Bases Present</p>
                          <div className="flex flex-wrap gap-2">
                            {worldSummary.starport.bases
                              .filter((base: any) => base.present)
                              .map((base: any, idx: number) => (
                                <Badge key={idx} variant="outline" className="capitalize">
                                  {base.type}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Culture */}
                {worldSummary.culture && worldSummary.culture.traits && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cultural Traits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {worldSummary.culture.traits.map((trait: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="capitalize">
                              {trait.category}
                            </Badge>
                            <p className="font-semibold">{trait.trait}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{trait.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Save Status */}
        {saveError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>
              World saved successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {/* Complete Button */}
        <div className="pt-8">
          <Button
            size="lg"
            className="w-full"
            onClick={handleCompleteWorld}
            disabled={isSaving || saveSuccess}
          >
            {isSaving ? "Saving World..." : saveSuccess ? "Saved!" : "Complete & Save World"}
          </Button>
        </div>
      </div>
    </div>
  );
}
