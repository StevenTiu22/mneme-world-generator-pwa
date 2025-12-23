import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Rocket, RefreshCw, Info, Sparkles, AlertCircle, Check, X } from "lucide-react";
import {
  generateStarport,
  rollBasePresence,
  getBasePresenceTarget,
} from "@/lib/generators/starportGenerator";
import {
  type StarportData,
  type StarportClass,
  BaseType,
  getStarportClassColor,
  getAllStarportClasses,
  getStarportClassLabel,
} from "@/models/world/starport";
import { STARPORT_CLASS_TABLE } from "@/lib/generators/worldTables";
import { v4 as uuidv4 } from 'uuid';

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

interface WorldContextData {
  name: string;
  worldId?: string;
}

interface StarportPageData {
  starport: StarportData;
}

// Constants from CreateHabitability.tsx
const ATMOSPHERIC_PRESSURES = [
  { value: "crushing", habitability: -2.5 },
  { value: "dense", habitability: -2 },
  { value: "trace", habitability: -1.5 },
  { value: "thin", habitability: -1 },
  { value: "average", habitability: 0 },
  { value: "random", habitability: 0 },
];

const HAZARD_TYPES = [
  { value: "radioactive", habitability: -1.5 },
  { value: "toxic", habitability: -1.5 },
  { value: "biohazard", habitability: -1 },
  { value: "corrosive", habitability: -1 },
  { value: "polluted", habitability: -0.5 },
  { value: "none", habitability: 0 },
];

const BIOCHEMICAL_RESOURCES = [
  { value: "scarce", habitability: -5 },
  { value: "rare", habitability: -4 },
  { value: "uncommon", habitability: -3 },
  { value: "abundant", habitability: 0 },
  { value: "inexhaustible", habitability: 5 },
];

// Constants from CreateInhabitants.tsx
const WEALTH_OPTIONS = [
  { value: "average", soc: 0 },
  { value: "better-off", soc: 1 },
  { value: "prosperous", soc: 2 },
  { value: "affluent", soc: 3 },
  { value: "random", soc: 0 },
];

const DEVELOPMENT_OPTIONS = [
  { value: "underdeveloped", soc: 2 },
  { value: "developing", soc: 5 },
  { value: "mature", soc: 6 },
  { value: "developed", soc: 8 },
  { value: "well-developed", soc: 9 },
  { value: "very-developed", soc: 10 },
];

// Helper function to calculate habitability from habitability data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateHabitabilityFromData(data: any): number {
  let total = 0;

  // Atmospheric pressure modifier
  const pressure = ATMOSPHERIC_PRESSURES.find((p) => p.value === data.atmosphericPressure);
  if (pressure) total += pressure.habitability;

  // Temperature modifier
  const temp = data.temperature || 50;
  if (temp <= 20) total += -2;
  else if (temp <= 40) total += -1.5;
  else if (temp <= 60) total += 0;
  else if (temp <= 80) total += -0.5;
  else total += -1;

  // Hazard modifiers
  if (data.hazardType && data.hazardType !== "none") {
    const hazard = HAZARD_TYPES.find((h) => h.value === data.hazardType);
    if (hazard) total += hazard.habitability;

    // Hazard intensity
    const intensity = data.hazardIntensity || 50;
    if (intensity <= 20) total += 0;
    else if (intensity <= 40) total += -0.5;
    else if (intensity <= 60) total += -1;
    else if (intensity <= 80) total += -1.5;
    else total += -2;
  }

  // Biochemical resources modifier
  const resources = BIOCHEMICAL_RESOURCES.find((r) => r.value === data.biochemicalResources);
  if (resources) total += resources.habitability;

  return parseFloat(total.toFixed(1));
}

// Helper function to get wealth SOC value
function getWealthValue(wealthString: string): number {
  const wealth = WEALTH_OPTIONS.find((w) => w.value === wealthString);
  return wealth ? wealth.soc : 0;
}

// Helper function to get development modifier
function getDevelopmentModifier(developmentString: string): number {
  const development = DEVELOPMENT_OPTIONS.find((d) => d.value === developmentString);
  return development ? development.soc : 0;
}

export function CreateWorldStarport() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  // State
  const [worldName, setWorldName] = useState("Unknown World");
  const [worldId, setWorldId] = useState<string | null>(null);
  const [starport, setStarport] = useState<StarportData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generation mode state
  const [generationMode, setGenerationMode] = useState<'procedural' | 'manual'>('procedural');
  const [manualClass, setManualClass] = useState<StarportClass>('C');

  // World parameters for PVS calculation (loaded from previous steps)
  const [habitabilityScore, setHabitabilityScore] = useState(0);
  const [techLevel, setTechLevel] = useState(10);
  const [wealth, setWealth] = useState(0);
  const [developmentModifier, setDevelopmentModifier] = useState(0);

  // Check if starport is complete
  const isStarportComplete = starport !== null;

  // Handle full starport generation
  const handleGenerateStarport = useCallback(() => {
    if (!worldId) {
      console.error("No world ID available for starport generation");
      return;
    }

    const starportData = generateStarport({
      worldId,
      habitabilityScore,
      techLevel,
      wealth,
      developmentModifier,
    });

    setStarport(starportData);
    console.log("🚀 Generated complete starport:", starportData);
  }, [worldId, habitabilityScore, techLevel, wealth, developmentModifier]);

  // Handle manual starport creation
  const handleCreateManualStarport = useCallback(() => {
    if (!worldId) {
      console.error("No world ID available for manual starport creation");
      return;
    }

    // Find the entry for the selected class
    const starportEntry = STARPORT_CLASS_TABLE.find(
      entry => entry.starportClass === manualClass
    );

    if (!starportEntry) {
      console.error("Invalid starport class:", manualClass);
      return;
    }

    // Roll for base presence
    const bases = [];

    // Naval Base (only for A and B class ports)
    if (manualClass === 'A' || manualClass === 'B') {
      bases.push(rollBasePresence(BaseType.NAVAL, manualClass));
    }

    // Scout Base (for A, B, C, and D class ports)
    if (['A', 'B', 'C', 'D'].includes(manualClass)) {
      bases.push(rollBasePresence(BaseType.SCOUT, manualClass));
    }

    // Pirate Base (for C, D, and E class ports)
    if (['C', 'D', 'E'].includes(manualClass)) {
      bases.push(rollBasePresence(BaseType.PIRATE, manualClass));
    }

    // Create starport with manual class (PVS = 0 for manual)
    const now = new Date().toISOString();
    const starportData: StarportData = {
      id: uuidv4(),
      worldId,
      starportClass: manualClass,
      portValueScore: 0, // Manual selection, no PVS calculation
      label: starportEntry.label,
      description: starportEntry.description,
      capabilities: starportEntry.capabilities,
      bases,
      generationMethod: 'custom',
      createdAt: now,
      updatedAt: now,
    };

    setStarport(starportData);
    console.log("✍️ Created manual starport:", starportData);
  }, [worldId, manualClass]);

  // Handle re-roll of specific base
  const handleRerollBase = useCallback((baseType: BaseType) => {
    if (!starport) return;

    const newBasePresence = rollBasePresence(baseType, starport.starportClass);

    setStarport(prev => {
      if (!prev) return prev;

      // Replace the base presence for this type
      const updatedBases = prev.bases.map(b =>
        b.type === baseType ? newBasePresence : b
      );

      // If this base type didn't exist, add it
      if (!updatedBases.some(b => b.type === baseType)) {
        updatedBases.push(newBasePresence);
      }

      return {
        ...prev,
        bases: updatedBases,
        generationMethod: 'custom', // Mark as custom after manual roll
        updatedAt: new Date().toISOString(),
      };
    });

    console.log(`🔄 Re-rolled ${baseType} base:`, newBasePresence);
  }, [starport]);

  // Save data to localStorage
  const saveData = useCallback(() => {
    if (!starport) return;

    const data: StarportPageData = {
      starport,
    };
    localStorage.setItem("worldStarport", JSON.stringify(data));
    console.log("💾 Saved starport data to localStorage");
  }, [starport]);

  // Load world data from previous steps
  useEffect(() => {
    const loadWorldData = () => {
      try {
        // Load world name
        const mainWorldData = localStorage.getItem("mainWorld");
        if (mainWorldData) {
          const parsed: WorldContextData = JSON.parse(mainWorldData);
          setWorldName(parsed.name || "Unknown World");
          setWorldId(parsed.worldId || `world-${Date.now()}`);
        }

        // Load world context for tech level
        const worldContext = localStorage.getItem("worldContext");
        if (worldContext) {
          const parsed = JSON.parse(worldContext);
          if (parsed.techLevel) {
            setTechLevel(parseInt(parsed.techLevel));
          }
        }

        // Load habitability score from habitability page
        const habitabilityData = localStorage.getItem("habitability");
        if (habitabilityData) {
          const parsed = JSON.parse(habitabilityData);
          const habitability = calculateHabitabilityFromData(parsed);
          setHabitabilityScore(habitability);
          console.log("📊 Loaded habitability score:", habitability);
        }

        // Load wealth and development from inhabitants page
        const inhabitantsData = localStorage.getItem("inhabitants");
        if (inhabitantsData) {
          const parsed = JSON.parse(inhabitantsData);

          // Get wealth SOC value
          const wealthValue = getWealthValue(parsed.wealth);
          setWealth(wealthValue);
          console.log("💰 Loaded wealth:", wealthValue);

          // Get development modifier
          const devModifier = getDevelopmentModifier(parsed.development);
          setDevelopmentModifier(devModifier);
          console.log("📈 Loaded development modifier:", devModifier);
        }

        // Try to load existing starport data
        const savedStarport = localStorage.getItem("worldStarport");
        if (savedStarport) {
          const starportData: StarportPageData = JSON.parse(savedStarport);
          setStarport(starportData.starport);
          console.log("✅ Loaded existing starport data from localStorage");
        }
      } catch (error) {
        console.error("Failed to load world or starport data:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadWorldData();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialized && starport) {
      saveData();
    }
  }, [isInitialized, starport, saveData]);

  // Handle Next button
  const handleNext = useCallback(() => {
    saveData();
    // Navigate to the next step in the wizard flow
    navigate("../position");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!isStarportComplete);
      context.setNextHandler(handleNext);
    }
  }, [isStarportComplete, handleNext, context]);

  // Keyboard shortcut for generation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "s" || e.key === "S") {
        handleGenerateStarport();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleGenerateStarport]);

  // Get base icon and label
  const getBaseInfo = (baseType: BaseType) => {
    const info: Record<BaseType, { icon: string; label: string; color: string }> = {
      [BaseType.NAVAL]: {
        icon: '⚓',
        label: 'Naval Base',
        color: 'text-blue-600 dark:text-blue-400',
      },
      [BaseType.SCOUT]: {
        icon: '🔭',
        label: 'Scout Base',
        color: 'text-green-600 dark:text-green-400',
      },
      [BaseType.PIRATE]: {
        icon: '☠️',
        label: 'Pirate Base',
        color: 'text-red-600 dark:text-red-400',
      },
      [BaseType.RESEARCH]: {
        icon: '🔬',
        label: 'Research Station',
        color: 'text-purple-600 dark:text-purple-400',
      },
      [BaseType.MILITARY]: {
        icon: '🎖️',
        label: 'Military Outpost',
        color: 'text-orange-600 dark:text-orange-400',
      },
    };
    return info[baseType];
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Starport Classification
          </h1>
          <p className="text-muted-foreground">
            Determine the starport facilities for <span className="font-semibold">{worldName}</span>. Press{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              S
            </kbd>{" "}
            to generate starport classification.
          </p>
        </div>

        {/* Alert if incomplete */}
        {!isStarportComplete && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Generate starport classification to proceed to the next step.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Generation Mode Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Generation Mode</Label>
                <RadioGroup
                  value={generationMode}
                  onValueChange={(value) => setGenerationMode(value as 'procedural' | 'manual')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="procedural" id="procedural" />
                    <Label htmlFor="procedural" className="cursor-pointer">
                      Procedural (Based on PVS)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="cursor-pointer">
                      Manual Selection
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Procedural Generation */}
              {generationMode === 'procedural' && (
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        Procedural Generation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generate starport classification based on Port Value Score (PVS).
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateStarport}
                      className="ml-4"
                      size="lg"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Generate Starport
                    </Button>
                  </div>
                </Card>
              )}

              {/* Manual Selection */}
              {generationMode === 'manual' && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Manual Selection</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose the starport class directly. Base presence will still be rolled.
                      </p>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Label htmlFor="starport-class" className="mb-2 block">
                          Starport Class
                        </Label>
                        <Select
                          value={manualClass}
                          onValueChange={(value) => setManualClass(value as StarportClass)}
                        >
                          <SelectTrigger id="starport-class" className="w-full">
                            <SelectValue placeholder="Select starport class" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllStarportClasses().map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                Class {cls} - {getStarportClassLabel(cls)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleCreateManualStarport}
                        size="lg"
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        Create Starport
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </Card>

          {/* Starport Classification */}
          {starport && (() => {
            const colors = getStarportClassColor(starport.starportClass);
            return (
              <div className="space-y-6">
                {/* Class Display */}
                <Card className={`p-6 ${colors.bg} ${colors.border}`}>
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-6xl font-bold ${colors.text}`}>
                          {starport.starportClass}
                        </div>
                        <div>
                          <CardTitle className="text-2xl mb-1">{starport.label}</CardTitle>
                          <p className="text-muted-foreground">{starport.description}</p>
                        </div>
                      </div>
                      {starport.generationMethod === 'procedural' ? (
                        <Badge variant="outline" className={`${colors.badge} text-lg px-4 py-2`}>
                          PVS: {starport.portValueScore}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className={`${colors.badge} text-lg px-4 py-2`}>
                          Manual Selection
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  {/* Capabilities */}
                  <CardContent className="p-0">
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3">Port Facilities & Capabilities</h4>
                      {starport.capabilities.length > 0 ? (
                        <ul className="space-y-2">
                          {starport.capabilities.map((capability, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className={`${colors.text} mt-0.5`}>✓</span>
                              <span>{capability}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No facilities available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Base Presence */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Base Presence</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {starport.bases.map((base, idx) => {
                      const baseInfo = getBaseInfo(base.type);
                      const target = getBasePresenceTarget(base.type, starport.starportClass);

                      return (
                        <Card key={idx} className={`p-4 ${base.present ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' : 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-900'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{baseInfo.icon}</span>
                              <div>
                                <h4 className="font-semibold">{baseInfo.label}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {target ? `Target: ${target}+` : 'Not possible'}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRerollBase(base.type)}
                              className="h-8 w-8"
                              title="Re-roll base presence"
                              disabled={target === null}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {base.present ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <X className="h-5 w-5 text-gray-400" />
                              )}
                              <span className={base.present ? 'font-semibold text-green-600' : 'text-muted-foreground'}>
                                {base.present ? 'Present' : 'Absent'}
                              </span>
                            </div>
                            {base.roll && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="secondary" className="font-mono">
                                    {base.roll}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>2D6 roll result</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* PVS Breakdown - Only show for procedural generation */}
                {starport.generationMethod === 'procedural' && (
                  <Card className="p-6 bg-muted/50">
                    <h3 className="font-semibold mb-4">Port Value Score Calculation</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-muted-foreground mb-1">Habitability</p>
                        <p className="font-semibold">{Math.floor(habitabilityScore / 4)}</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-muted-foreground mb-1">Tech Level</p>
                        <p className="font-semibold">{techLevel - 7}</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-muted-foreground mb-1">Wealth</p>
                        <p className="font-semibold">{wealth >= 0 ? '+' : ''}{wealth}</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-muted-foreground mb-1">Development</p>
                        <p className="font-semibold">{developmentModifier >= 0 ? '+' : ''}{developmentModifier}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Port Value Score</p>
                      <p className="text-3xl font-bold">{starport.portValueScore}</p>
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}

          {/* Info Card */}
          {!isStarportComplete && (
            <Card className="p-6 bg-muted/30">
              <div className="flex items-start gap-4">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">About Starport Classification</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Starport quality is determined by the Port Value Score (PVS), calculated from:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span><strong>Habitability:</strong> Better conditions attract better ports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span><strong>Tech Level:</strong> Higher tech enables better facilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span><strong>Wealth:</strong> Richer worlds can afford better ports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span><strong>Development:</strong> More developed worlds have better infrastructure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Starport classification ranges from X (no port) through E, D, C, B to A (excellent port).
            Base presence is determined by 2D6 rolls with modifiers based on starport quality.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
