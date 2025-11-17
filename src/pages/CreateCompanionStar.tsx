import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Info,
  Sparkles,
  Dices,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { generateCompanionStars } from "@/lib/generators/companionStarGenerator";
import type { StellarClass, StellarGrade } from "@/models/stellar/types/enums";
import { GenerationMethod } from "@/models/common/types";
import type { StellarZones } from "@/models/stellar/types/interface";
import { StellarZonesDisplay } from "@/components/stellar/StellarZonesDisplay";
import {
  calculateStellarZonesFromClassGrade,
  validateCompanionOrbit,
  calculateStablePlanetaryOrbitLimit,
} from "@/lib/stellar/zoneCalculations";

// TypeScript types
type StarClass = "O" | "B" | "A" | "F" | "G" | "K" | "M" | "Random";
type LuminosityClass =
  | "I"
  | "II"
  | "III"
  | "IV"
  | "V"
  | "VI"
  | "VII"
  | "Random";
type SystemType = "Binary" | "Trinary" | "Quaternary";

interface CompanionDiceRolls {
  companionRoll: number;
  classRoll?: number;
  gradeRoll?: number;
  orbitRoll: number;
}

interface Companion {
  id: number | string;
  name: string;
  class: StarClass | null;
  grade?: number;
  luminosity: LuminosityClass;
  orbitalDistance: number;
  mass: number | null;
  age: number | null;
  generationMethod?: GenerationMethod;
  diceRolls?: CompanionDiceRolls;
}

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
  setFinishHandler?: (handler: () => void) => void;
}

// Star class info for better UX
const STAR_CLASS_INFO: Record<
  Exclude<StarClass, "Random">,
  { color: string; temp: string }
> = {
  O: { color: "Blue", temp: "≥30,000 K" },
  B: { color: "Blue-White", temp: "10,000-30,000 K" },
  A: { color: "White", temp: "7,500-10,000 K" },
  F: { color: "Yellow-White", temp: "6,000-7,500 K" },
  G: { color: "Yellow", temp: "5,200-6,000 K" },
  K: { color: "Orange", temp: "3,700-5,200 K" },
  M: { color: "Red", temp: "2,400-3,700 K" },
};

// Helper function to get max companions based on system type
const getMaxCompanions = (systemType: SystemType): number => {
  switch (systemType) {
    case "Binary":
      return 1;
    case "Trinary":
      return 2;
    case "Quaternary":
      return 3;
    default:
      return 1;
  }
};

// Helper to check if companion is fully configured
const isCompanionComplete = (companion: Companion): boolean => {
  return companion.class !== null;
};

export function CreateCompanionStar() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();
  const [systemType, setSystemType] = useState<SystemType>("Binary");
  const [activeCompanion, setActiveCompanion] = useState<number | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [primaryZones, setPrimaryZones] = useState<StellarZones | null>(null);
  const [orbitWarnings, setOrbitWarnings] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const starClasses: StarClass[] = [
    "O",
    "B",
    "A",
    "F",
    "G",
    "K",
    "M",
    "Random",
  ];
  const maxCompanions = getMaxCompanions(systemType);

  // Handle system type change - adjust companion count if needed
  const handleSystemTypeChange = (newType: SystemType) => {
    const newMax = getMaxCompanions(newType);
    setSystemType(newType);

    // Remove excess companions if switching to a smaller system
    if (companions.length > newMax) {
      const trimmed = companions.slice(0, newMax);
      setCompanions(trimmed);
      if (activeCompanion !== null && activeCompanion >= newMax) {
        setActiveCompanion(newMax - 1);
      }
    }
  };

  const handleClassSelect = (starClass: StarClass) => {
    if (activeCompanion === null) return;
    const updated = [...companions];
    updated[activeCompanion].class = starClass;
    setCompanions(updated);
  };

  const handleLuminosityChange = (luminosity: LuminosityClass) => {
    if (activeCompanion === null) return;
    const updated = [...companions];
    updated[activeCompanion].luminosity = luminosity;
    setCompanions(updated);
  };

  const handleOrbitalDistanceChange = (values: number[]) => {
    if (activeCompanion === null) return;
    const updated = [...companions];
    updated[activeCompanion].orbitalDistance = values[0];
    setCompanions(updated);
  };

  const handleMassChange = (mass: string) => {
    if (activeCompanion === null) return;
    const updated = [...companions];
    updated[activeCompanion].mass = mass ? parseFloat(mass) : null;
    setCompanions(updated);
  };

  const handleAgeChange = (age: string) => {
    if (activeCompanion === null) return;
    const updated = [...companions];
    updated[activeCompanion].age = age ? parseFloat(age) : null;
    setCompanions(updated);
  };

  // Generate companions procedurally based on primary star
  const handleGenerateProcedurally = async () => {
    setIsGenerating(true);
    try {
      // Load primary star data from localStorage
      const primaryStarData = localStorage.getItem("primaryStar");
      if (!primaryStarData) {
        alert("No primary star found. Please create a primary star first.");
        return;
      }

      const primaryStar = JSON.parse(primaryStarData);
      const primaryClass = primaryStar.stellarClass as StellarClass;
      const primaryGrade = primaryStar.stellarGrade as StellarGrade;

      // Generate companions
      const result = await generateCompanionStars(primaryClass, primaryGrade);

      if (result.companions.length === 0) {
        alert("No companion stars were generated. Try again or add manually.");
        return;
      }

      // Convert generated companions to UI format
      const newCompanions: Companion[] = result.companions.map((comp) => ({
        id: comp.id,
        name: comp.name,
        class: comp.stellarClass as StarClass,
        grade: comp.stellarGrade,
        luminosity: "V" as LuminosityClass, // Main sequence by default
        orbitalDistance: Math.round(comp.orbitalDistance * 10) / 10, // Round to 1 decimal
        mass: comp.mass ?? null,
        age: null,
        generationMethod: comp.generationMethod,
        diceRolls: comp.diceRolls,
      }));

      // Update system type based on number of companions
      if (newCompanions.length === 1) {
        setSystemType("Binary");
      } else if (newCompanions.length === 2) {
        setSystemType("Trinary");
      } else if (newCompanions.length === 3) {
        setSystemType("Quaternary");
      }

      setCompanions(newCompanions);
      setActiveCompanion(0);
    } catch (error) {
      console.error("Failed to generate companions:", error);
      alert("Failed to generate companions. Please try again or add manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addCompanion = () => {
    if (companions.length >= maxCompanions) return;

    const newCompanion: Companion = {
      id: Date.now(),
      name: `Companion Star ${companions.length + 1}`,
      class: null,
      luminosity: "Random",
      orbitalDistance: 50,
      mass: null,
      age: null,
      generationMethod: GenerationMethod.CUSTOM,
    };
    setCompanions([...companions, newCompanion]);
    setActiveCompanion(companions.length);
  };

  const openRenameDialog = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveCompanion(index);
    setRenameValue(companions[index].name);
    setIsRenameOpen(true);
  };

  const handleRename = () => {
    if (activeCompanion === null || !renameValue.trim()) return;
    const updated = [...companions];
    updated[activeCompanion].name = renameValue.trim();
    setCompanions(updated);
    setIsRenameOpen(false);
  };

  const removeCompanion = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = companions.filter((_, i) => i !== index);
    setCompanions(updated);

    if (activeCompanion === index) {
      setActiveCompanion(updated.length > 0 ? 0 : null);
    } else if (activeCompanion !== null && activeCompanion > index) {
      setActiveCompanion(activeCompanion - 1);
    }
  };

  // Get completion status for display
  const getCompletionStatus = () => {
    const configured = companions.filter(isCompanionComplete).length;
    return { configured, total: companions.length };
  };

  // Handler for finishing world creation
  const handleFinish = useCallback(() => {
    const companionData = {
      systemType,
      companions,
    };
    localStorage.setItem("companionStars", JSON.stringify(companionData));
    navigate("/my-worlds");
  }, [navigate, systemType, companions]);

  // Update button handlers
  useEffect(() => {
    if (context) {
      const hasCompanions = companions.length > 0;
      const hasConfiguredCompanion = companions.some(isCompanionComplete);
      const canProceed = !hasCompanions || hasConfiguredCompanion;

      context.setNextDisabled(!canProceed);
      context.setNextHandler(() => handleFinish);

      // Set finish handler for the layout's Finish button
      if (context.setFinishHandler) {
        context.setFinishHandler(() => handleFinish);
      }
    }
  }, [handleFinish, context, companions]);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("companionStars");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.systemType) setSystemType(data.systemType);
        if (data.companions) setCompanions(data.companions);
      } catch (e) {
        console.error("Failed to load saved companion data", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Auto-save data whenever companions or systemType changes
  useEffect(() => {
    if (isInitialized) {
      const companionData = {
        systemType,
        companions,
      };
      localStorage.setItem("companionStars", JSON.stringify(companionData));
    }
  }, [systemType, companions, isInitialized]);

  // Load primary star zones on mount
  useEffect(() => {
    const loadPrimaryZones = async () => {
      try {
        const primaryStarData = localStorage.getItem("primaryStar");
        if (!primaryStarData) {
          console.warn("No primary star data found");
          return;
        }

        const primaryStar = JSON.parse(primaryStarData);
        const primaryClass = primaryStar.stellarClass as StellarClass;
        const primaryGrade = primaryStar.stellarGrade as StellarGrade;

        const zones = await calculateStellarZonesFromClassGrade(primaryClass, primaryGrade);
        setPrimaryZones(zones);
      } catch (error) {
        console.error("Failed to load primary star zones:", error);
      }
    };

    loadPrimaryZones();
  }, []);

  // Validate orbital distance when it changes
  useEffect(() => {
    if (activeCompanion === null || !primaryZones) {
      setOrbitWarnings([]);
      return;
    }

    const companion = companions[activeCompanion];
    if (!companion) return;

    const validation = validateCompanionOrbit(companion.orbitalDistance, primaryZones);
    setOrbitWarnings(validation.warnings);
  }, [activeCompanion, companions, primaryZones]);

  const status = getCompletionStatus();
  const canAddMore = companions.length < maxCompanions;
  const activeCompanionData =
    activeCompanion !== null ? companions[activeCompanion] : null;

  return (
    <TooltipProvider>
      <div className="container max-w-5xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">
            Creating your Companion Star(s)
          </h1>
          <p className="text-muted-foreground">
            Configure companion stars for your system. You can skip this step if
            you want a single-star system.
          </p>
        </div>

        {/* Status Alert */}
        {companions.length > 0 && status.configured < status.total && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {status.configured} of {status.total} companion star(s)
              configured. Select a star class to complete configuration.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-0 rounded-lg overflow-hidden shadow-lg min-h-[600px]">
          {/* Left Panel */}
          <div className="bg-muted pl-8 py-8 w-80 flex-shrink-0 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="pr-8">
                <Label htmlFor="system-type">System Type</Label>
                <Select
                  value={systemType}
                  onValueChange={(value) =>
                    handleSystemTypeChange(value as SystemType)
                  }
                >
                  <SelectTrigger id="system-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Binary">Binary (1 companion)</SelectItem>
                    <SelectItem value="Trinary">
                      Trinary (2 companions)
                    </SelectItem>
                    <SelectItem value="Quaternary">
                      Quaternary (3 companions)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pr-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={handleGenerateProcedurally}
                      disabled={isGenerating}
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      {isGenerating ? "Generating..." : "Generate Procedurally"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate companion stars based on Mneme rules</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-2 flex-1">
                {companions.map((companion, index) => (
                  <div
                    key={companion.id}
                    onClick={() => setActiveCompanion(index)}
                    className={`w-full flex justify-between items-center h-auto py-3 text-left font-normal cursor-pointer rounded-md border transition-colors ${
                      activeCompanion === index
                        ? "bg-primary text-primary-foreground rounded-l-md rounded-r-none border-primary"
                        : "bg-background hover:bg-accent hover:text-accent-foreground mr-8 pr-8 border-input"
                    }`}
                  >
                    <span className="flex items-center gap-2 pl-4">
                      {companion.name}
                      {!isCompanionComplete(companion) && (
                        <span className="text-xs opacity-60">(incomplete)</span>
                      )}
                    </span>
                    {activeCompanion === index && (
                      <div className="flex gap-1 pr-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-background/20"
                          onClick={(e) => openRenameDialog(e, index)}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-background/20"
                          onClick={(e) => removeCompanion(e, index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pr-8">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addCompanion}
                  disabled={!canAddMore}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Companion {!canAddMore && `(Max ${maxCompanions})`}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Refined Design */}
          <div className="flex-1 bg-background overflow-y-auto max-h-[600px]">
            {activeCompanionData ? (
              <div className="p-8 space-y-6">
                {/* Header with status badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {activeCompanionData.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Configure companion star properties
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {activeCompanionData.generationMethod === GenerationMethod.PROCEDURAL && (
                      <Badge variant="outline" className="gap-1">
                        <Dices className="h-3 w-3" />
                        Procedural
                      </Badge>
                    )}
                    {isCompanionComplete(activeCompanionData) ? (
                      <Badge variant="default" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Incomplete</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Star Class Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Star Class *
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Harvard spectral classification</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {starClasses.map((starClass) => (
                        <Tooltip key={starClass}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                activeCompanionData.class === starClass
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => handleClassSelect(starClass)}
                              className="h-16 text-lg font-bold relative"
                            >
                              {starClass}
                              {activeCompanionData.class === starClass &&
                                starClass !== "Random" && (
                                  <span className="absolute top-1 right-1 text-[10px] font-normal">
                                    {STAR_CLASS_INFO[starClass].color}
                                  </span>
                                )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {starClass !== "Random" ? (
                              <div className="space-y-1">
                                <p className="font-semibold">
                                  {STAR_CLASS_INFO[starClass].color}
                                </p>
                                <p className="text-xs">
                                  {STAR_CLASS_INFO[starClass].temp}
                                </p>
                              </div>
                            ) : (
                              <p>Randomly generate star class</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>

                    {/* Show selected class info */}
                    {activeCompanionData.class &&
                      activeCompanionData.class !== "Random" && (
                        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {
                                  STAR_CLASS_INFO[activeCompanionData.class]
                                    .color
                                }{" "}
                                Star
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {
                                  STAR_CLASS_INFO[activeCompanionData.class]
                                    .temp
                                }
                              </p>
                              {activeCompanionData.grade !== undefined && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Grade: {activeCompanionData.grade}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {activeCompanionData.class}
                              {activeCompanionData.grade !== undefined && activeCompanionData.grade}
                            </Badge>
                          </div>
                        </div>
                      )}

                    {/* Show dice rolls if procedurally generated */}
                    {activeCompanionData.diceRolls && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          Generation Rolls
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Companion:</span>{" "}
                            <span className="font-mono font-semibold">
                              {activeCompanionData.diceRolls.companionRoll}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Orbit:</span>{" "}
                            <span className="font-mono font-semibold">
                              {activeCompanionData.diceRolls.orbitRoll}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Additional Properties
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Optional parameters (will be auto-generated if not
                      specified)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Luminosity Class */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="luminosity"
                        className="flex items-center gap-2"
                      >
                        Luminosity Class
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Yerkes spectral classification</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Select
                        value={activeCompanionData.luminosity}
                        onValueChange={(value) =>
                          handleLuminosityChange(value as LuminosityClass)
                        }
                      >
                        <SelectTrigger id="luminosity">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Random">Random</SelectItem>
                          <SelectItem value="I">I - Supergiant</SelectItem>
                          <SelectItem value="II">II - Bright Giant</SelectItem>
                          <SelectItem value="III">III - Giant</SelectItem>
                          <SelectItem value="IV">IV - Subgiant</SelectItem>
                          <SelectItem value="V">V - Main Sequence</SelectItem>
                          <SelectItem value="VI">VI - Subdwarf</SelectItem>
                          <SelectItem value="VII">VII - White Dwarf</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Orbital Distance */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          Orbital Distance
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Distance from the primary star in AU</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Badge variant="outline" className="font-mono">
                          {activeCompanionData.orbitalDistance} AU
                        </Badge>
                      </div>
                      <Slider
                        value={[activeCompanionData.orbitalDistance]}
                        onValueChange={handleOrbitalDistanceChange}
                        min={1}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 AU</span>
                        <span>50 AU</span>
                        <span>100 AU</span>
                      </div>

                      {/* Orbital warnings */}
                      {orbitWarnings.length > 0 && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-disc list-inside space-y-1">
                              {orbitWarnings.map((warning, idx) => (
                                <li key={idx} className="text-sm">{warning}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Stable planetary orbit limit */}
                      {primaryZones && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                          <p>
                            <strong>Stable Planetary Orbits:</strong> Planets can orbit the primary
                            within ~{calculateStablePlanetaryOrbitLimit(activeCompanionData.orbitalDistance).toFixed(1)} AU
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Mass */}
                    <div className="space-y-2">
                      <Label htmlFor="mass" className="flex items-center gap-2">
                        Mass (Solar Masses)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Star mass relative to our Sun (M☉)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="mass"
                          type="number"
                          step="0.1"
                          min="0.08"
                          max="100"
                          placeholder="Auto-generated"
                          value={activeCompanionData.mass ?? ""}
                          onChange={(e) => handleMassChange(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex items-center px-3 bg-muted rounded-md">
                          <span className="text-sm font-medium">M☉</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Range: 0.08-100 M☉
                      </p>
                    </div>

                    <Separator />

                    {/* Age */}
                    <div className="space-y-2">
                      <Label htmlFor="age" className="flex items-center gap-2">
                        Age (Billion Years)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Stellar age (Universe is ~13.8 billion years old)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="age"
                          type="number"
                          step="0.1"
                          min="0"
                          max="13.8"
                          placeholder="Auto-generated"
                          value={activeCompanionData.age ?? ""}
                          onChange={(e) => handleAgeChange(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex items-center px-3 bg-muted rounded-md">
                          <span className="text-sm font-medium">Gyr</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Range: 0-13.8 billion years
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Stellar Zones Display */}
                <StellarZonesDisplay
                  zones={primaryZones}
                  companionDistance={activeCompanionData.orbitalDistance}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <Card className="max-w-md">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {companions.length === 0
                            ? "No Companion Stars Yet"
                            : "Select a Companion Star"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {companions.length === 0
                            ? "Add a companion star from the left panel to begin configuration"
                            : "Choose a companion star from the list to configure its properties"}
                        </p>
                      </div>
                      <Button
                        variant="default"
                        onClick={handleFinish}
                        className="mt-4"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Finish & Save World
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Rename Dialog */}
        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Companion Star</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="star-name">Star Name</Label>
              <Input
                id="star-name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                }}
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRename} disabled={!renameValue.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
