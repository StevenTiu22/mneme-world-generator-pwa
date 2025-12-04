import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

// Atmospheric Pressure options
const ATMOSPHERIC_PRESSURES = [
  { value: "crushing", label: "Crushing", habitability: -2.5, tl: "9" },
  { value: "dense", label: "Dense", habitability: -2, tl: "8" },
  { value: "trace", label: "Trace", habitability: -1.5, tl: "8" },
  { value: "thin", label: "Thin", habitability: -1, tl: "7" },
  { value: "average", label: "Average", habitability: 0, tl: "0" },
  { value: "random", label: "Random", habitability: 0, tl: "-" },
];

// Hazard Types
const HAZARD_TYPES = [
  { value: "radioactive", label: "Radioactive", habitability: -1.5 },
  { value: "toxic", label: "Toxic", habitability: -1.5 },
  { value: "biohazard", label: "Biohazard", habitability: -1 },
  { value: "corrosive", label: "Corrosive", habitability: -1 },
  { value: "polluted", label: "Polluted", habitability: -0.5 },
  { value: "none", label: "None", habitability: 0 },
];

// Biochemical Resources
const BIOCHEMICAL_RESOURCES = [
  { value: "scarce", label: "Scarce", habitability: -5, tl: "8" },
  { value: "rare", label: "Rare", habitability: -4, tl: "7" },
  { value: "uncommon", label: "Uncommon", habitability: -3, tl: "4" },
  { value: "abundant", label: "Abundant", habitability: 0, tl: "-" },
  { value: "inexhaustible", label: "Inexhaustible", habitability: 5, tl: "-" },
];

interface HabitabilityData {
  atmosphericPressure: string;
  temperature: number;
  hazardType: string;
  hazardIntensity: number;
  biochemicalResources: string;
}

export function CreateHabitability() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  const [atmosphericPressure, setAtmosphericPressure] = useState("");
  const [temperature, setTemperature] = useState([50]);
  const [hazardType, setHazardType] = useState("none");
  const [hazardIntensity, setHazardIntensity] = useState([50]);
  const [biochemicalResources, setBiochemicalResources] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate modifiers
  const selectedPressure = ATMOSPHERIC_PRESSURES.find(
    (p) => p.value === atmosphericPressure
  );
  const selectedHazard = HAZARD_TYPES.find((h) => h.value === hazardType);
  const selectedResources = BIOCHEMICAL_RESOURCES.find(
    (r) => r.value === biochemicalResources
  );

  // Temperature range: 0 = Inferno, 25 = Hot, 50 = Average, 75 = Cold, 100 = Freezing
  const getTemperatureLabel = (value: number) => {
    if (value <= 20) return "Inferno";
    if (value <= 40) return "Hot";
    if (value <= 60) return "Average";
    if (value <= 80) return "Cold";
    return "Freezing";
  };

  const getTemperatureHabitability = (value: number) => {
    if (value <= 20) return -2;
    if (value <= 40) return -1.5;
    if (value <= 60) return 0;
    if (value <= 80) return -0.5;
    return -1;
  };

  // Hazard intensity: 0 = Very Mild, 25 = Mild, 50 = Serious, 75 = High, 100 = Intense
  const getHazardIntensityLabel = (value: number) => {
    if (value <= 20) return "Very Mild";
    if (value <= 40) return "Mild";
    if (value <= 60) return "Serious";
    if (value <= 80) return "High";
    return "Intense";
  };

  const getHazardIntensityHabitability = (value: number) => {
    if (value <= 20) return 0;
    if (value <= 40) return -0.5;
    if (value <= 60) return -1;
    if (value <= 80) return -1.5;
    return -2;
  };

  // Calculate total habitability
  const calculateHabitability = () => {
    let total = 0;
    if (selectedPressure) total += selectedPressure.habitability;
    total += getTemperatureHabitability(temperature[0]);
    if (selectedHazard && hazardType !== "none") {
      total += selectedHazard.habitability;
      total += getHazardIntensityHabitability(hazardIntensity[0]);
    }
    if (selectedResources) total += selectedResources.habitability;
    return total.toFixed(1);
  };

  // Check if form is complete
  const isFormComplete = atmosphericPressure && biochemicalResources;

  // Save data
  const saveData = useCallback(() => {
    const data: HabitabilityData = {
      atmosphericPressure,
      temperature: temperature[0],
      hazardType,
      hazardIntensity: hazardIntensity[0],
      biochemicalResources,
    };
    localStorage.setItem("habitability", JSON.stringify(data));
  }, [
    atmosphericPressure,
    temperature,
    hazardType,
    hazardIntensity,
    biochemicalResources,
  ]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("habitability");
    if (saved) {
      try {
        const data: HabitabilityData = JSON.parse(saved);
        setAtmosphericPressure(data.atmosphericPressure);
        setTemperature([data.temperature]);
        setHazardType(data.hazardType);
        setHazardIntensity([data.hazardIntensity]);
        setBiochemicalResources(data.biochemicalResources);
      } catch (e) {
        console.error("Failed to load saved habitability data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Auto-save (only after initial load is complete)
  useEffect(() => {
    if (isLoaded && isFormComplete) {
      saveData();
    }
  }, [saveData, isFormComplete, isLoaded]);

  // Handler for Next button
  const handleNext = useCallback(() => {
    saveData();
    navigate("../inhabitants");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!isFormComplete);
      context.setNextHandler(() => handleNext);
    }
  }, [isFormComplete, handleNext, context]);

  return (
    <TooltipProvider>
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Habitability</h1>
          <p className="text-muted-foreground">
            Configure atmospheric and environmental conditions for your world
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Atmospheric Pressure */}
            <div>
              <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                Atmospheric Pressure
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Determines breathability and environmental suit
                      requirements
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {ATMOSPHERIC_PRESSURES.map((pressure) => (
                  <Card
                    key={pressure.value}
                    role="button"
                    onClick={() => setAtmosphericPressure(pressure.value)}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 relative",
                      atmosphericPressure === pressure.value &&
                        "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <CardContent className="flex items-center justify-center p-8 relative">
                      <div
                        className={cn(
                          "absolute top-3 right-3 h-5 w-5 rounded-full border-2",
                          atmosphericPressure === pressure.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {atmosphericPressure === pressure.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-semibold">
                        {pressure.label}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedPressure && (
                <p className="text-sm text-muted-foreground mt-2">
                  Habitability: {selectedPressure.habitability >= 0 ? "+" : ""}
                  {selectedPressure.habitability} • Required TL:{" "}
                  {selectedPressure.tl}
                </p>
              )}
            </div>

            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  Temperature
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Surface temperature classification</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm font-medium">
                  {getTemperatureLabel(temperature[0])}
                </span>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Inferno</span>
                <span>Hot</span>
                <span>Average</span>
                <span>Cold</span>
                <span>Freezing</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Hazard Intensity */}
            {hazardType !== "none" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    Hazard Intensity
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Severity of the environmental hazard</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="text-sm font-medium">
                    {getHazardIntensityLabel(hazardIntensity[0])}
                  </span>
                </div>
                <Slider
                  value={hazardIntensity}
                  onValueChange={setHazardIntensity}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Very Mild</span>
                  <span>Mild</span>
                  <span>Serious</span>
                  <span>High</span>
                  <span>Intense</span>
                </div>
              </div>
            )}

            {/* Biochemical Resources */}
            <div>
              <Label
                htmlFor="biochemical-resources"
                className="text-lg font-semibold mb-3 flex items-center gap-2"
              >
                Biochemical Resources
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Availability of water, oxygen, and life-supporting
                      elements
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select
                value={biochemicalResources}
                onValueChange={setBiochemicalResources}
              >
                <SelectTrigger id="biochemical-resources">
                  <SelectValue placeholder="Select resource availability" />
                </SelectTrigger>
                <SelectContent>
                  {BIOCHEMICAL_RESOURCES.map((resource) => (
                    <SelectItem key={resource.value} value={resource.value}>
                      {resource.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedResources && (
                <p className="text-sm text-muted-foreground mt-2">
                  Habitability: {selectedResources.habitability >= 0 ? "+" : ""}
                  {selectedResources.habitability}
                  {selectedResources.tl !== "-" &&
                    ` • Required TL: ${selectedResources.tl}`}
                </p>
              )}
            </div>

            {/* Hazard Type */}
            <div>
              <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                Hazard Type
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Environmental hazards present on the world</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <RadioGroup value={hazardType} onValueChange={setHazardType}>
                {HAZARD_TYPES.map((hazard) => (
                  <div
                    key={hazard.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={hazard.value} id={hazard.value} />
                    <Label htmlFor={hazard.value} className="cursor-pointer">
                      {hazard.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Summary Cards */}
            {isFormComplete && (
              <Card className="p-6 bg-muted/30">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Habitability Breakdown
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedPressure && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Atmosphere ({selectedPressure.label}):
                          </span>
                          <span
                            className={cn(
                              "font-medium",
                              selectedPressure.habitability > 0
                                ? "text-green-600 dark:text-green-400"
                                : selectedPressure.habitability < 0
                                ? "text-red-600 dark:text-red-400"
                                : ""
                            )}
                          >
                            {selectedPressure.habitability >= 0 ? "+" : ""}
                            {selectedPressure.habitability}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Temperature ({getTemperatureLabel(temperature[0])}):
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            getTemperatureHabitability(temperature[0]) > 0
                              ? "text-green-600 dark:text-green-400"
                              : getTemperatureHabitability(temperature[0]) < 0
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          )}
                        >
                          {getTemperatureHabitability(temperature[0]) >= 0
                            ? "+"
                            : ""}
                          {getTemperatureHabitability(temperature[0])}
                        </span>
                      </div>
                      {selectedHazard && hazardType !== "none" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Hazard ({selectedHazard.label}):
                            </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {selectedHazard.habitability}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Intensity (
                              {getHazardIntensityLabel(hazardIntensity[0])}):
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                getHazardIntensityHabitability(
                                  hazardIntensity[0]
                                ) < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : ""
                              )}
                            >
                              {getHazardIntensityHabitability(
                                hazardIntensity[0]
                              ) >= 0
                                ? "+"
                                : ""}
                              {getHazardIntensityHabitability(
                                hazardIntensity[0]
                              )}
                            </span>
                          </div>
                        </>
                      )}
                      {selectedResources && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Resources ({selectedResources.label}):
                          </span>
                          <span
                            className={cn(
                              "font-medium",
                              selectedResources.habitability > 0
                                ? "text-green-600 dark:text-green-400"
                                : selectedResources.habitability < 0
                                ? "text-red-600 dark:text-red-400"
                                : ""
                            )}
                          >
                            {selectedResources.habitability >= 0 ? "+" : ""}
                            {selectedResources.habitability}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Required Tech Levels
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedPressure &&
                        selectedPressure.tl !== "-" &&
                        selectedPressure.tl !== "0" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              For {selectedPressure.label} atmosphere:
                            </span>
                            <span className="font-medium">
                              TL {selectedPressure.tl}+
                            </span>
                          </div>
                        )}
                      {selectedResources && selectedResources.tl !== "-" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            For {selectedResources.label} resources:
                          </span>
                          <span className="font-medium">
                            TL {selectedResources.tl}+
                          </span>
                        </div>
                      )}
                      {(!selectedPressure ||
                        selectedPressure.tl === "-" ||
                        selectedPressure.tl === "0") &&
                        (!selectedResources ||
                          selectedResources.tl === "-") && (
                          <span className="text-muted-foreground">
                            No special requirements
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Total Habitability Score
                    </h3>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "text-3xl font-bold",
                          parseFloat(calculateHabitability()) > 0
                            ? "text-green-600 dark:text-green-400"
                            : parseFloat(calculateHabitability()) < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        )}
                      >
                        {parseFloat(calculateHabitability()) >= 0 ? "+" : ""}
                        {calculateHabitability()}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {parseFloat(calculateHabitability()) >= 5
                          ? "Excellent habitability"
                          : parseFloat(calculateHabitability()) >= 2
                          ? "Good habitability"
                          : parseFloat(calculateHabitability()) >= 0
                          ? "Average habitability"
                          : parseFloat(calculateHabitability()) >= -3
                          ? "Poor habitability"
                          : "Hostile environment"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
