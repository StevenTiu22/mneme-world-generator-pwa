import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Check,
  X,
  Info,
  Shuffle,
  AlertCircle,
  Dices,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// Dice rolling utilities no longer needed for basic world generation on this page
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { generateWorld } from "@/lib/generators/worldGenerator";
import {
  WorldType as WorldTypeEnum,
  type WorldDiceRolls,
} from "@/models/world";
import { GenerationMethod } from "@/models/common/types";
// Advanced world table functions removed - will be used in dedicated wizard pages

// Types based on Mneme documentation
type WorldType = "habitat" | "terrestrial" | "dwarf";

// Size values from documentation (2D6 roll results)
interface SizeOption {
  value: string;
  label: string;
  mass: string;
  description: string;
}

const HABITAT_SIZES: SizeOption[] = [
  { value: "2", label: "Tiny", mass: "1 MVT", description: "10K-33K people" },
  { value: "3", label: "Small", mass: "3 MVT", description: "30K-99K people" },
  {
    value: "4",
    label: "Medium",
    mass: "10 MVT",
    description: "100K-333K people",
  },
  {
    value: "5",
    label: "Large",
    mass: "30 MVT",
    description: "300K-999K people",
  },
  {
    value: "6",
    label: "Very Large",
    mass: "100 MVT",
    description: "1M-3M people",
  },
  { value: "7", label: "Huge", mass: "300 MVT", description: "3M-9M people" },
  {
    value: "8",
    label: "Massive",
    mass: "1 GVT",
    description: "10M-33M people",
  },
  { value: "9", label: "Giant", mass: "3 GVT", description: "30M-99M people" },
  {
    value: "10",
    label: "Enormous",
    mass: "10 GVT",
    description: "100M-333M people",
  },
  {
    value: "11",
    label: "Colossal",
    mass: "30 GVT",
    description: "300M-999M people",
  },
  { value: "12", label: "Mega", mass: "100 GVT", description: "1B-3B people" },
];

const DWARF_SIZES: SizeOption[] = [
  {
    value: "2",
    label: "Micro",
    mass: "0.1 LM",
    description: "Very small dwarf",
  },
  { value: "3", label: "Tiny", mass: "0.2 LM", description: "Small dwarf" },
  { value: "4", label: "Small", mass: "0.3 LM", description: "Below average" },
  {
    value: "5",
    label: "Below Average",
    mass: "0.5 LM",
    description: "Moderately small",
  },
  {
    value: "6",
    label: "Average",
    mass: "0.7 LM",
    description: "Average dwarf",
  },
  { value: "7", label: "Standard", mass: "1.0 LM", description: "Luna-sized" },
  { value: "8", label: "Large", mass: "1.5 LM", description: "Large dwarf" },
  {
    value: "9",
    label: "Very Large",
    mass: "2.0 LM",
    description: "Very large dwarf",
  },
  { value: "10", label: "Huge", mass: "3.0 LM", description: "Huge dwarf" },
  {
    value: "11",
    label: "Massive",
    mass: "5.0 LM",
    description: "Massive dwarf",
  },
  { value: "12", label: "Giant", mass: "7.0 LM", description: "Giant dwarf" },
];

const TERRESTRIAL_SIZES: SizeOption[] = [
  { value: "2", label: "Micro", mass: "0.1 EM", description: "Mars-sized" },
  { value: "3", label: "Tiny", mass: "0.2 EM", description: "Very small" },
  { value: "4", label: "Small", mass: "0.3 EM", description: "Below average" },
  {
    value: "5",
    label: "Below Average",
    mass: "0.5 EM",
    description: "Moderately small",
  },
  { value: "6", label: "Average", mass: "0.7 EM", description: "Below Earth" },
  { value: "7", label: "Standard", mass: "1.0 EM", description: "Earth-sized" },
  { value: "8", label: "Large", mass: "1.5 EM", description: "Super Earth" },
  {
    value: "9",
    label: "Very Large",
    mass: "2.0 EM",
    description: "Large super Earth",
  },
  {
    value: "10",
    label: "Huge",
    mass: "3.0 EM",
    description: "Huge terrestrial",
  },
  {
    value: "11",
    label: "Massive",
    mass: "5.0 EM",
    description: "Massive terrestrial",
  },
  {
    value: "12",
    label: "Mega Earth",
    mass: "7.0 EM",
    description: "Mega Earth",
  },
];

// Gravity values from documentation (2D6 roll results)
// Distribution follows 2D6 probability:
// - Low rolls (2-4): Low gravity for terrestrials (Mars-like worlds)
// - Mid rolls (5-9): Normal gravity for terrestrials (Earth-like, most common)
// - High rolls (10-12): High gravity for terrestrials (Super-Earths)
const GRAVITY_OPTIONS = [
  {
    value: "2",
    label: "0.001 G / 0.3 G",
    dwarf: "0.001 G",
    terrestrial: "0.3 G",
    habitability: -2,
  },
  {
    value: "3",
    label: "0.02 G / 0.4 G",
    dwarf: "0.02 G",
    terrestrial: "0.4 G",
    habitability: -1.5,
  },
  {
    value: "4",
    label: "0.04 G / 0.5 G",
    dwarf: "0.04 G",
    terrestrial: "0.5 G",
    habitability: -1,
  },
  {
    value: "5",
    label: "0.06 G / 0.7 G",
    dwarf: "0.06 G",
    terrestrial: "0.7 G",
    habitability: -0.5,
  },
  {
    value: "6",
    label: "0.08 G / 0.9 G",
    dwarf: "0.08 G",
    terrestrial: "0.9 G",
    habitability: 0,
  },
  {
    value: "7",
    label: "0.10 G / 1.0 G",
    dwarf: "0.10 G",
    terrestrial: "1.0 G",
    habitability: 0,
  },
  {
    value: "8",
    label: "0.12 G / 1.0 G",
    dwarf: "0.12 G",
    terrestrial: "1.0 G",
    habitability: 0,
  },
  {
    value: "9",
    label: "0.14 G / 1.2 G",
    dwarf: "0.14 G",
    terrestrial: "1.2 G",
    habitability: 0,
  },
  {
    value: "10",
    label: "0.16 G / 1.5 G",
    dwarf: "0.16 G",
    terrestrial: "1.5 G",
    habitability: -0.5,
  },
  {
    value: "11",
    label: "0.18 G / 2.0 G",
    dwarf: "0.18 G",
    terrestrial: "2.0 G",
    habitability: -1.5,
  },
  {
    value: "12",
    label: "0.20 G / 3.0 G",
    dwarf: "0.20 G",
    terrestrial: "3.0 G",
    habitability: -2.5,
  },
];

// Lesser Earth (Dwarf) types from documentation
const LESSER_EARTH_TYPES = [
  {
    value: "carbonaceous",
    label: "Carbonaceous",
    description: "Volatile-rich, found in outer zones",
    modifier: 1,
  },
  {
    value: "silicaceous",
    label: "Silicaceous",
    description: "Stony, moderate density",
    modifier: 0,
  },
  {
    value: "metallic",
    label: "Metallic",
    description: "Dense, found near star",
    modifier: -1,
  },
  {
    value: "other",
    label: "Other",
    description: "Unusual composition",
    modifier: 0,
  },
];

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

interface MainWorldData {
  name: string;
  type: WorldType | null;
  size: string;
  gravity: string;
  lesserEarthType: string;
  techLevel: string;
  worldId?: string; // Link to database record
  generationMethod?: string;
  diceRolls?: WorldDiceRolls;
}

export function CreateMainWorld() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  // State management
  const [worldName, setWorldName] = useState("Primary World #1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(worldName);
  const [selectedType, setSelectedType] = useState<WorldType | null>(null);
  const [worldSize, setWorldSize] = useState("");
  const [gravity, setGravity] = useState("");
  const [lesserEarthType, setLesserEarthType] = useState("");
  const [techLevel, setTechLevel] = useState("");

  // Note: Advanced properties (habitability, inhabitants, starport, culture)
  // will be handled on dedicated wizard pages in future phases

  // Database and generation tracking
  const [worldId, setWorldId] = useState<string | null>(null);
  const [generationMethod, setGenerationMethod] =
    useState<GenerationMethod | null>(null);
  const [diceRolls, setDiceRolls] =
    useState<MainWorldData["diceRolls"]>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get appropriate size options based on world type
  const sizeOptions = useMemo(() => {
    if (!selectedType) return [];
    if (selectedType === "habitat") return HABITAT_SIZES;
    if (selectedType === "dwarf") return DWARF_SIZES;
    if (selectedType === "terrestrial") return TERRESTRIAL_SIZES;
    return [];
  }, [selectedType]);

  // Get current size data
  const currentSizeData = useMemo(() => {
    return sizeOptions.find((opt) => opt.value === worldSize);
  }, [sizeOptions, worldSize]);

  // Get current gravity data
  const currentGravityData = useMemo(() => {
    return GRAVITY_OPTIONS.find((opt) => opt.value === gravity);
  }, [gravity]);

  // Calculate gravity display based on world type
  const gravityDisplay = useMemo(() => {
    if (!currentGravityData || !selectedType) return "";
    if (selectedType === "habitat") return "N/A (Artificial)";
    if (selectedType === "dwarf") return currentGravityData.dwarf;
    if (selectedType === "terrestrial") return currentGravityData.terrestrial;
    return "";
  }, [currentGravityData, selectedType]);

  // Determine if form is complete
  const isFormComplete = useMemo(() => {
    if (!selectedType) return false;
    if (!worldSize) return false;
    if (selectedType === "habitat") return true; // Habitat doesn't need gravity or type
    if (!gravity) return false;
    if (selectedType === "dwarf" && !lesserEarthType) return false;
    return true;
  }, [selectedType, worldSize, gravity, lesserEarthType]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setWorldName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(worldName);
    setIsEditingName(false);
  };

  const handleEditClick = () => {
    setTempName(worldName);
    setIsEditingName(true);
  };

  const handleTypeSelect = (type: WorldType) => {
    setSelectedType(type);
    // Reset dependent fields when type changes
    setWorldSize("");
    setGravity("");
    setLesserEarthType("");
    // Switch to custom mode if manually selecting type
    if (generationMethod === GenerationMethod.PROCEDURAL) {
      setGenerationMethod(GenerationMethod.CUSTOM);
      setDiceRolls(undefined);
    }
  };

  // Note: Manual field changes automatically switch from PROCEDURAL to CUSTOM mode
  // This happens when user manually selects a different world type or edits generated values

  // Get star system data for world generation
  const getStarSystemId = useCallback((): string => {
    // Try to get from localStorage
    const worldContextData = localStorage.getItem("worldContext");
    if (worldContextData) {
      try {
        const parsed = JSON.parse(worldContextData);
        if (parsed.starSystemId) return parsed.starSystemId;
      } catch (e) {
        console.error("Failed to parse world context", e);
      }
    }

    // Fallback: generate a temporary ID (should be replaced with actual system ID)
    return "temp-system-" + Date.now();
  }, []);

  // Procedural generation using Mneme dice mechanics
  const handleRandom = useCallback(() => {
    const starSystemId = getStarSystemId();
    const techLevelNum = parseInt(techLevel) || 10;

    // Generate world using Mneme rules
    const generatedWorld = generateWorld({
      starSystemId,
      techLevel: techLevelNum,
      worldName: worldName,
    });

    // Map WorldTypeEnum to local WorldType
    const typeMap: Record<string, WorldType> = {
      [WorldTypeEnum.HABITAT]: "habitat",
      [WorldTypeEnum.TERRESTRIAL]: "terrestrial",
      [WorldTypeEnum.DWARF]: "dwarf",
    };

    // Update basic state with generated values
    setWorldId(generatedWorld.id);
    setSelectedType(typeMap[generatedWorld.type] || "terrestrial");
    setWorldSize(generatedWorld.size.toString());
    setGravity(generatedWorld.size.toString()); // Using size as gravity roll
    setGenerationMethod(GenerationMethod.PROCEDURAL);
    setDiceRolls(generatedWorld.diceRolls);

    if (generatedWorld.composition) {
      setLesserEarthType(generatedWorld.composition);
    }

    console.log("🎲 Generated world (basic properties):", {
      name: generatedWorld.name,
      type: generatedWorld.type,
      size: generatedWorld.size,
      gravity: generatedWorld.gravity,
      composition: generatedWorld.composition,
      diceRolls: {
        typeRoll: generatedWorld.diceRolls?.typeRoll,
        sizeRoll: generatedWorld.diceRolls?.sizeRoll,
        gravityRoll: generatedWorld.diceRolls?.gravityRoll,
        compositionRoll: generatedWorld.diceRolls?.compositionRoll,
      },
    });
  }, [worldName, techLevel, getStarSystemId]);

  // Note: Re-roll functions for advanced properties removed
  // Those will be implemented on dedicated wizard pages in future phases

  // Save data to localStorage
  const saveData = useCallback(() => {
    const data: MainWorldData = {
      name: worldName,
      type: selectedType,
      size: worldSize,
      gravity: gravity,
      lesserEarthType: lesserEarthType,
      techLevel: techLevel,
      worldId: worldId || undefined,
      generationMethod: generationMethod || undefined,
      diceRolls: diceRolls,
    };
    localStorage.setItem("mainWorld", JSON.stringify(data));
  }, [
    worldName,
    selectedType,
    worldSize,
    gravity,
    lesserEarthType,
    techLevel,
    worldId,
    generationMethod,
    diceRolls,
  ]);

  // Load saved data from localStorage
  useEffect(() => {
    const loadData = async () => {
      const saved = localStorage.getItem("mainWorld");
      if (saved) {
        try {
          const data: MainWorldData = JSON.parse(saved);
          setWorldName(data.name);
          setSelectedType(data.type);
          setWorldSize(data.size);
          setGravity(data.gravity);
          setLesserEarthType(data.lesserEarthType);
          setTechLevel(data.techLevel);

          // Load generation metadata if available
          if (data.worldId) setWorldId(data.worldId);
          if (data.generationMethod)
            setGenerationMethod(data.generationMethod as GenerationMethod);
          if (data.diceRolls) setDiceRolls(data.diceRolls);

          console.log("✅ Loaded world data from localStorage");
        } catch (e) {
          console.error("Failed to load saved main world data", e);
        }
      }

      setIsLoaded(true);

      // Also try to load tech level from world context
      const worldContext = localStorage.getItem("worldContext");
      if (worldContext && !techLevel) {
        try {
          const parsed = JSON.parse(worldContext);
          if (parsed.techLevel) {
            setTechLevel(parsed.techLevel.toString());
          }
        } catch (e) {
          console.error("Failed to load world context", e);
        }
      }
    };

    loadData();
  }, []);

  // Auto-save (only after initial load is complete)
  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [saveData, isLoaded]);

  // Handler for Next button
  const handleNext = useCallback(() => {
    saveData();
    navigate("../world-culture");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!isFormComplete);
      context.setNextHandler(() => handleNext);
    }
  }, [isFormComplete, handleNext, context]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isEditingName) {
        if (e.key === "Enter") handleSaveName();
        if (e.key === "Escape") handleCancelEdit();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        handleRandom();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isEditingName, worldName]);

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Main World: Basic Properties
          </h1>
          <p className="text-muted-foreground">
            Configure the type, size, and composition of your primary world.
            Press{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              R
            </kbd>{" "}
            for procedural generation.
          </p>
        </div>

        {/* World Name */}
        <div className="mb-8">
          <Label className="text-base mb-3 flex items-center gap-2">
            World Name
          </Label>
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <>
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-xl font-semibold h-12 max-w-md"
                  placeholder="Enter world name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveName}
                  disabled={!tempName.trim()}
                  className="h-12 w-12 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEdit}
                  className="h-12 w-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold">
                  {worldName}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditClick}
                  className="h-12 w-12"
                >
                  <Pencil className="h-5 w-5 text-muted-foreground" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Alert if incomplete */}
        {selectedType && !isFormComplete && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete all required fields to proceed to the next step.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: World Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-4 flex items-center gap-2">
              World Type *
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Choose the type of world for your main world. Habitat =
                    artificial station, Terrestrial = Earth-like, Dwarf =
                    smaller body.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    role="button"
                    onClick={() => handleTypeSelect("habitat")}
                    className={cn(
                      "h-40 cursor-pointer transition-all hover:border-primary/50 relative",
                      selectedType === "habitat" &&
                        "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center p-6">
                      {selectedType === "habitat" && (
                        <div className="absolute top-3 right-3 h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">Habitat</h3>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Artificial structure
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Artificial space station or habitat</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    role="button"
                    onClick={() => handleTypeSelect("terrestrial")}
                    className={cn(
                      "h-40 cursor-pointer transition-all hover:border-primary/50 relative",
                      selectedType === "terrestrial" &&
                        "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center p-6">
                      {selectedType === "terrestrial" && (
                        <div className="absolute top-3 right-3 h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">Terrestrial</h3>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Rocky planet
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rocky planet (0.1-7 Earth masses)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    role="button"
                    onClick={() => handleTypeSelect("dwarf")}
                    className={cn(
                      "h-40 cursor-pointer transition-all hover:border-primary/50 relative",
                      selectedType === "dwarf" &&
                        "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center p-6">
                      {selectedType === "dwarf" && (
                        <div className="absolute top-3 right-3 h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">Dwarf Planet</h3>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Small world
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dwarf planet (0.1-7 Lunar masses)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    role="button"
                    onClick={handleRandom}
                    className="h-40 cursor-pointer transition-all hover:border-primary/50 hover:border-primary/70 relative"
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center p-6">
                      <Shuffle className="h-8 w-8 mb-2" />
                      <h3 className="text-xl font-semibold">Random</h3>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Procedural generation
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Let the system randomly generate a world using Mneme dice
                    rules
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {selectedType && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRandom}
                >
                  <Dices className="h-4 w-4 mr-2" />
                  Re-roll Random World (Mneme Dice)
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Uses 2D6 dice rolls following Mneme rules
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Form Fields */}
          <div className="space-y-6">
            {selectedType && (
              <>
                {/* World Size */}
                <div>
                  <Label
                    htmlFor="world-size"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    World Size *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Determines the mass and scale of the world</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select value={worldSize} onValueChange={setWorldSize}>
                    <SelectTrigger id="world-size" className="mt-2">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} - {option.mass}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentSizeData && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentSizeData.description}
                    </p>
                  )}
                </div>

                {/* Gravity - Not for Habitat */}
                {selectedType !== "habitat" && (
                  <div>
                    <Label
                      htmlFor="gravity"
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      Gravity *
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Surface gravity relative to Earth (1 G)</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Select value={gravity} onValueChange={setGravity}>
                      <SelectTrigger id="gravity" className="mt-2">
                        <SelectValue placeholder="Select gravity" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRAVITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {selectedType === "dwarf"
                              ? option.dwarf
                              : option.terrestrial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentGravityData && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Habitability modifier:{" "}
                        {currentGravityData.habitability >= 0 ? "+" : ""}
                        {currentGravityData.habitability}
                      </p>
                    )}
                  </div>
                )}

                {/* Lesser Earth Type - Only for Dwarf */}
                {selectedType === "dwarf" && (
                  <div>
                    <Label
                      htmlFor="lesser-earth-type"
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      Composition Type *
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>The primary composition of the dwarf planet</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Select
                      value={lesserEarthType}
                      onValueChange={setLesserEarthType}
                    >
                      <SelectTrigger id="lesser-earth-type" className="mt-2">
                        <SelectValue placeholder="Select composition" />
                      </SelectTrigger>
                      <SelectContent>
                        {LESSER_EARTH_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {lesserEarthType && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {
                          LESSER_EARTH_TYPES.find(
                            (t) => t.value === lesserEarthType
                          )?.description
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* Summary Card */}
                {isFormComplete && (
                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Badge variant="secondary">Summary</Badge>
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-semibold capitalize">
                          {selectedType}
                        </span>
                      </div>
                      {currentSizeData && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mass:</span>
                          <span className="font-semibold">
                            {currentSizeData.mass}
                          </span>
                        </div>
                      )}
                      {selectedType !== "habitat" && gravityDisplay && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Gravity:
                          </span>
                          <span className="font-semibold">
                            {gravityDisplay}
                          </span>
                        </div>
                      )}
                      {selectedType === "dwarf" && lesserEarthType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Composition:
                          </span>
                          <span className="font-semibold capitalize">
                            {lesserEarthType}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Dice Rolls Display (if procedurally generated) */}
                {diceRolls &&
                  generationMethod === GenerationMethod.PROCEDURAL && (
                    <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-blue-600 text-blue-600"
                        >
                          <Dices className="h-3 w-3 mr-1" />
                          Procedural Generation
                        </Badge>
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="font-semibold text-xs text-muted-foreground uppercase mb-2">
                          Basic World Properties
                        </div>
                        {diceRolls.typeRoll && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Type Roll (2D6):
                            </span>
                            <span className="font-mono font-semibold">
                              {diceRolls.typeRoll}
                            </span>
                          </div>
                        )}
                        {diceRolls.sizeRoll && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Size Roll (2D6):
                            </span>
                            <span className="font-mono font-semibold">
                              {diceRolls.sizeRoll}
                            </span>
                          </div>
                        )}
                        {diceRolls.gravityRoll && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Gravity Roll (2D6):
                            </span>
                            <span className="font-mono font-semibold">
                              {diceRolls.gravityRoll}
                            </span>
                          </div>
                        )}
                        {diceRolls.compositionRoll && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Composition Roll (2D6):
                            </span>
                            <span className="font-mono font-semibold">
                              {diceRolls.compositionRoll}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                          Generated using Mneme World Generator rules. Edit any
                          field to switch to custom mode.
                        </p>
                      </div>
                    </Card>
                  )}
              </>
            )}

            {!selectedType && (
              <Card className="p-8 bg-muted/50">
                <div className="text-center text-muted-foreground">
                  <p>Select a world type to configure its properties</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            The main world is the most hospitable and significant world in your
            system. Habitability, culture, and starport details will be
            configured in the following wizard steps.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
