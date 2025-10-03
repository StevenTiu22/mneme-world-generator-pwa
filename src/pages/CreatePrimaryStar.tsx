import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Minus, Plus, Check, X, Shuffle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Enhanced Data with Grade-based calculations ---
const STAR_CLASSES = ["O", "B", "A", "F", "G", "K", "M"] as const;
type StarClass = (typeof STAR_CLASSES)[number];

interface StarData {
  color: string;
  description: string;
  temperature: string;
}

const STAR_CLASS_INFO: Record<StarClass, StarData> = {
  O: {
    color: "Blue",
    description: "Extremely hot and luminous",
    temperature: "≥30,000 K",
  },
  B: {
    color: "Blue-White",
    description: "Very hot and bright",
    temperature: "10,000-30,000 K",
  },
  A: {
    color: "White",
    description: "Hot main sequence",
    temperature: "7,500-10,000 K",
  },
  F: {
    color: "Yellow-White",
    description: "Intermediate temperature",
    temperature: "6,000-7,500 K",
  },
  G: {
    color: "Yellow",
    description: "Sun-like stars",
    temperature: "5,200-6,000 K",
  },
  K: {
    color: "Orange",
    description: "Cool main sequence",
    temperature: "3,700-5,200 K",
  },
  M: {
    color: "Red",
    description: "Cool, dim, and common",
    temperature: "2,400-3,700 K",
  },
};

// Mass values based on Stellar Class and Grade (from documentation)
const STELLAR_MASS: Record<StarClass, number[]> = {
  O: [128.0, 116.8, 105.6, 94.4, 83.2, 72.0, 60.8, 49.6, 38.4, 27.2],
  B: [16.0, 14.61, 13.22, 11.83, 10.44, 9.05, 7.66, 6.27, 4.88, 3.49],
  A: [2.1, 2.03, 1.96, 1.89, 1.82, 1.75, 1.68, 1.61, 1.54, 1.47],
  F: [1.4, 1.36, 1.33, 1.29, 1.26, 1.22, 1.18, 1.15, 1.11, 1.08],
  G: [1.04, 1.02, 0.99, 0.97, 0.94, 0.92, 0.9, 0.87, 0.85, 0.82],
  K: [0.8, 0.77, 0.73, 0.7, 0.66, 0.63, 0.59, 0.56, 0.52, 0.49],
  M: [0.45, 0.41, 0.38, 0.34, 0.3, 0.27, 0.23, 0.19, 0.15, 0.12],
};

// Luminosity values based on Stellar Class and Grade (from documentation)
const STELLAR_LUMINOSITY: Record<StarClass, number[]> = {
  O: [
    3516325, 2071113, 1219884, 718510, 423202, 249266, 146817, 86475, 50934,
    30000,
  ],
  B: [
    14752.9, 7260.98, 3573.66, 1758.86, 865.66, 426.06, 209.69, 103.21, 50.8,
    25.0,
  ],
  A: [23.0, 21.2, 19.4, 17.6, 15.8, 14.0, 12.2, 10.4, 8.6, 5.0],
  F: [4.65, 4.34, 4.02, 3.71, 3.39, 3.08, 2.76, 2.45, 2.13, 1.5],
  G: [1.41, 1.33, 1.25, 1.17, 1.09, 1.01, 0.92, 0.84, 0.76, 0.6],
  K: [0.55, 0.5, 0.45, 0.41, 0.36, 0.31, 0.27, 0.22, 0.17, 0.08],
  M: [0.07, 0.07, 0.06, 0.05, 0.05, 0.04, 0.03, 0.03, 0.02, 0.01],
};

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

interface PrimaryStarData {
  name: string;
  class: StarClass;
  grade: number;
}

// --- Component ---
export function CreatePrimaryStar() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();
  const [starName, setStarName] = useState("Primary Star #1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(starName);
  const [selectedClass, setSelectedClass] = useState<StarClass>("G");
  const [classGrade, setClassGrade] = useState(5);

  // Calculate derived values based on class and grade
  const starData = useMemo(() => {
    const classInfo = STAR_CLASS_INFO[selectedClass];
    const mass = STELLAR_MASS[selectedClass][classGrade];
    const luminosity = STELLAR_LUMINOSITY[selectedClass][classGrade];

    return {
      ...classInfo,
      mass,
      luminosity,
    };
  }, [selectedClass, classGrade]);

  // Format large numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    } else if (num >= 10) {
      return num.toFixed(2);
    } else if (num >= 1) {
      return num.toFixed(3);
    } else {
      return num.toFixed(4);
    }
  };

  const handleRandom = () => {
    const randomClass =
      STAR_CLASSES[Math.floor(Math.random() * STAR_CLASSES.length)];
    const randomGrade = Math.floor(Math.random() * 10);
    setSelectedClass(randomClass);
    setClassGrade(randomGrade);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setStarName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(starName);
    setIsEditingName(false);
  };

  const handleEditClick = () => {
    setTempName(starName);
    setIsEditingName(true);
  };

  const handleClassSelect = (starClass: StarClass) => {
    setSelectedClass(starClass);
    // Reset grade to middle value when changing class
    setClassGrade(5);
  };

  const incrementGrade = () => {
    setClassGrade((prev) => Math.max(0, prev - 1));
  };

  const decrementGrade = () => {
    setClassGrade((prev) => Math.min(9, prev + 1));
  };

  // Save data to localStorage
  const saveData = useCallback(() => {
    const data: PrimaryStarData = {
      name: starName,
      class: selectedClass,
      grade: classGrade,
    };
    localStorage.setItem("primaryStar", JSON.stringify(data));
  }, [starName, selectedClass, classGrade]);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("primaryStar");
    if (saved) {
      try {
        const data: PrimaryStarData = JSON.parse(saved);
        setStarName(data.name);
        setSelectedClass(data.class);
        setClassGrade(data.grade);
      } catch (e) {
        console.error("Failed to load saved primary star data", e);
      }
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData();
  }, [saveData]);

  // Handler for Next button to navigate to companion-star
  const handleNext = useCallback(() => {
    saveData();
    navigate("../world-context"); // Changed from ../companion-star
  }, [navigate, saveData]);

  // Update Next button state - always enabled on this page
  useEffect(() => {
    if (context) {
      context.setNextDisabled(false);
      context.setNextHandler(() => handleNext);
    }
  }, [handleNext, context]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isEditingName) {
        if (e.key === "Enter") {
          handleSaveName();
        } else if (e.key === "Escape") {
          handleCancelEdit();
        }
        return;
      }

      // Global shortcuts (when not editing)
      if (e.key === "r" || e.key === "R") {
        handleRandom();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isEditingName, starName]);

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Creating your Primary Star
          </h1>
          <p className="text-muted-foreground">
            Configure the primary star for your system. Press{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              R
            </kbd>{" "}
            for random generation.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Star Name */}
            <div>
              <Label className="text-base mb-3 flex items-center gap-2">
                Star Name
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Give your primary star a unique name</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-center gap-3">
                {isEditingName ? (
                  <>
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-xl font-semibold h-12 flex-1"
                      placeholder="Enter star name"
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
                    <h2 className="text-xl sm:text-2xl font-semibold flex-1">
                      {starName}
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

            {/* Star Class */}
            <div>
              <Label className="text-base mb-3 flex items-center gap-2">
                Star Class
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Harvard spectral classification: O (hottest) to M
                      (coolest)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STAR_CLASSES.map((starClass) => (
                  <Tooltip key={starClass}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          selectedClass === starClass ? "default" : "outline"
                        }
                        className="h-20 text-2xl font-bold relative"
                        onClick={() => handleClassSelect(starClass)}
                      >
                        {starClass}
                        {selectedClass === starClass && (
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 text-xs"
                          >
                            {STAR_CLASS_INFO[starClass].color}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {STAR_CLASS_INFO[starClass].color}
                        </p>
                        <p className="text-sm">
                          {STAR_CLASS_INFO[starClass].description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {STAR_CLASS_INFO[starClass].temperature}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                <Button
                  variant="secondary"
                  className="h-20 text-lg font-semibold col-span-2 sm:col-span-4"
                  onClick={handleRandom}
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  Random Generation
                </Button>
              </div>
            </div>

            {/* Current Selection Info */}
            <Card className="p-6 bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    Class {selectedClass}
                    {classGrade}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {starData.description}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Color:</span>{" "}
                      <span className="font-medium">{starData.color}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temp:</span>{" "}
                      <span className="font-medium">
                        {starData.temperature}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Overview & Grade */}
          <div className="space-y-6">
            {/* Class Grade */}
            <div>
              <Label className="text-base mb-3 flex items-center gap-2">
                Class Grade
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>0 = Brightest, 9 = Dimmest within the class</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Card className="p-6">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={incrementGrade}
                    disabled={classGrade === 0}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="text-center min-w-[60px]">
                    <div className="text-4xl font-bold">{classGrade}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {classGrade === 0
                        ? "Brightest"
                        : classGrade === 9
                        ? "Dimmest"
                        : "Grade"}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={decrementGrade}
                    disabled={classGrade === 9}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Overview */}
            <div>
              <Label className="text-base mb-3">Stellar Properties</Label>
              <Card className="p-6">
                <div className="space-y-4">
                  {/* Color */}
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-muted-foreground">Color</span>
                    <span className="font-semibold text-lg">
                      {starData.color}
                    </span>
                  </div>

                  {/* Mass */}
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-muted-foreground">Mass</span>
                    <span className="font-semibold text-lg">
                      {starData.mass.toFixed(2)}{" "}
                      <span className="text-sm font-normal">M☉</span>
                    </span>
                  </div>

                  {/* Luminosity */}
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-muted-foreground">
                      Luminosity
                    </span>
                    <span className="font-semibold text-lg">
                      {formatNumber(starData.luminosity)}{" "}
                      <span className="text-sm font-normal">L☉</span>
                    </span>
                  </div>

                  {/* Temperature */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Temperature
                    </span>
                    <span className="font-semibold text-sm">
                      {starData.temperature}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="p-6 bg-primary/5">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                Classification
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {selectedClass}
                  {classGrade} V
                </div>
                <div className="text-sm text-muted-foreground">
                  Main Sequence Star
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 The star's properties are calculated based on the Stellar Class
            and Mass Table. Lower grades (0) are brighter and more massive than
            higher grades (9).
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
