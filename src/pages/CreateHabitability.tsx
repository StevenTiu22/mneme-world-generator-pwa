import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Dices, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { roll2D6 } from "@/lib/dice";
import {
  ATMOSPHERE_TABLE,
  TEMPERATURE_TABLE,
  HAZARD_TYPE_TABLE,
  HAZARD_INTENSITY_TABLE,
  BIOCHEMICAL_RESOURCES_TABLE,
  getAtmosphereFromRoll,
  getTemperatureFromRoll,
  getHazardTypeFromRoll,
  getHazardIntensityFromRoll,
  getBiochemicalResourcesFromRoll,
} from "@/lib/generators/worldTables";
import {
  calculateHabitabilityScore,
  getHabitabilityRating,
  type HabitabilityModifiers,
} from "@/models/world/types";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

interface HabitabilityData {
  // Store the 2D6 roll results
  atmosphereRoll?: number;
  temperatureRoll?: number;
  hazardTypeRoll?: number;
  hazardIntensityRoll?: number;
  biochemicalResourcesRoll?: number;

  // Store the selected values
  atmosphere: string;
  temperature: string;
  hazardType: string;
  hazardIntensity: string;
  biochemicalResources: string;

  // Habitability modifiers
  atmosphereModifier: number;
  temperatureModifier: number;
  hazardTypeModifier: number;
  hazardIntensityModifier: number;
  biochemicalResourcesModifier: number;
}

export function CreateHabitability() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  // State for each habitability parameter
  const [atmosphereRoll, setAtmosphereRoll] = useState<number | null>(null);
  const [atmosphere, setAtmosphere] = useState("");

  const [temperatureRoll, setTemperatureRoll] = useState<number | null>(null);
  const [temperature, setTemperature] = useState("");

  const [hazardTypeRoll, setHazardTypeRoll] = useState<number | null>(null);
  const [hazardType, setHazardType] = useState("");

  const [hazardIntensityRoll, setHazardIntensityRoll] = useState<number | null>(null);
  const [hazardIntensity, setHazardIntensity] = useState("");

  const [biochemicalResourcesRoll, setBiochemicalResourcesRoll] = useState<number | null>(null);
  const [biochemicalResources, setBiochemicalResources] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);

  // Get the current entries from tables
  const atmosphereEntry = useMemo(() =>
    ATMOSPHERE_TABLE.find(e => e.pressure === atmosphere),
    [atmosphere]
  );

  const temperatureEntry = useMemo(() =>
    TEMPERATURE_TABLE.find(e => e.temperature === temperature),
    [temperature]
  );

  const hazardTypeEntry = useMemo(() =>
    HAZARD_TYPE_TABLE.find(e => e.hazardType === hazardType),
    [hazardType]
  );

  const hazardIntensityEntry = useMemo(() =>
    HAZARD_INTENSITY_TABLE.find(e => e.intensity.toString() === hazardIntensity),
    [hazardIntensity]
  );

  const biochemicalResourcesEntry = useMemo(() =>
    BIOCHEMICAL_RESOURCES_TABLE.find(e => e.resources === biochemicalResources),
    [biochemicalResources]
  );

  // Check if hazard requires intensity
  const requiresHazardIntensity = useMemo(() =>
    hazardTypeEntry?.requiresIntensity ?? false,
    [hazardTypeEntry]
  );

  // Calculate total habitability using the proper function from types.ts
  const habitabilityModifiers = useMemo<Partial<HabitabilityModifiers>>(() => ({
    atmosphericPressure: atmosphereEntry?.habitabilityModifier ?? 0,
    temperature: temperatureEntry?.habitabilityModifier ?? 0,
    hazard: requiresHazardIntensity ? 0 : 0, // Hazard type itself doesn't add modifier
    hazardIntensity: requiresHazardIntensity ? (hazardIntensityEntry?.habitabilityModifier ?? 0) : 0,
    biochemicalResources: biochemicalResourcesEntry?.habitabilityModifier ?? 0,
    // mass and techLevel will be added from other pages later
  }), [atmosphereEntry, temperatureEntry, hazardIntensityEntry, biochemicalResourcesEntry, requiresHazardIntensity]);

  const totalHabitabilityScore = useMemo(() =>
    calculateHabitabilityScore(habitabilityModifiers),
    [habitabilityModifiers]
  );

  const habitabilityRating = useMemo(() =>
    getHabitabilityRating(totalHabitabilityScore),
    [totalHabitabilityScore]
  );

  // Procedural generation functions
  const rollAtmosphere = useCallback(() => {
    const result = roll2D6();
    const roll = result.total;
    const entry = getAtmosphereFromRoll(roll);

    setAtmosphereRoll(roll);
    setAtmosphere(entry.pressure);

    console.log(`🎲 Rolled ${roll} for Atmosphere: ${entry.pressure}`);
  }, []);

  const rollTemperature = useCallback(() => {
    const result = roll2D6();
    const roll = result.total;
    const entry = getTemperatureFromRoll(roll);

    setTemperatureRoll(roll);
    setTemperature(entry.temperature);

    console.log(`🎲 Rolled ${roll} for Temperature: ${entry.temperature}`);
  }, []);

  const rollHazardType = useCallback(() => {
    const result = roll2D6();
    const roll = result.total;
    const entry = getHazardTypeFromRoll(roll);

    setHazardTypeRoll(roll);
    setHazardType(entry.hazardType);

    // Auto-roll intensity if hazard requires it
    if (entry.requiresIntensity) {
      const intensityResult = roll2D6();
      const intensityRoll = intensityResult.total;
      const intensityEntry = getHazardIntensityFromRoll(intensityRoll);

      setHazardIntensityRoll(intensityRoll);
      setHazardIntensity(intensityEntry.intensity.toString());

      console.log(`🎲 Rolled ${roll} for Hazard Type: ${entry.hazardType}`);
      console.log(`🎲 Rolled ${intensityRoll} for Hazard Intensity: ${intensityEntry.label}`);
    } else {
      // Clear intensity if no hazard
      setHazardIntensityRoll(null);
      setHazardIntensity("");

      console.log(`🎲 Rolled ${roll} for Hazard Type: ${entry.hazardType} (no intensity needed)`);
    }
  }, []);

  const rollHazardIntensity = useCallback(() => {
    if (!requiresHazardIntensity) return;

    const result = roll2D6();
    const roll = result.total;
    const entry = getHazardIntensityFromRoll(roll);

    setHazardIntensityRoll(roll);
    setHazardIntensity(entry.intensity.toString());

    console.log(`🎲 Rolled ${roll} for Hazard Intensity: ${entry.label}`);
  }, [requiresHazardIntensity]);

  const rollBiochemicalResources = useCallback(() => {
    const result = roll2D6();
    const roll = result.total;
    const entry = getBiochemicalResourcesFromRoll(roll);

    setBiochemicalResourcesRoll(roll);
    setBiochemicalResources(entry.resources);

    console.log(`🎲 Rolled ${roll} for Biochemical Resources: ${entry.resources}`);
  }, []);

  // Roll all parameters at once
  const rollAll = useCallback(() => {
    rollAtmosphere();
    rollTemperature();
    rollHazardType();
    rollBiochemicalResources();
  }, [rollAtmosphere, rollTemperature, rollHazardType, rollBiochemicalResources]);

  // Check if form is complete
  const isFormComplete = useMemo(() =>
    atmosphere !== "" &&
    temperature !== "" &&
    hazardType !== "" &&
    biochemicalResources !== "" &&
    (!requiresHazardIntensity || hazardIntensity !== ""),
    [atmosphere, temperature, hazardType, biochemicalResources, hazardIntensity, requiresHazardIntensity]
  );

  // Save data
  const saveData = useCallback(() => {
    const data: HabitabilityData = {
      atmosphereRoll: atmosphereRoll ?? undefined,
      temperatureRoll: temperatureRoll ?? undefined,
      hazardTypeRoll: hazardTypeRoll ?? undefined,
      hazardIntensityRoll: hazardIntensityRoll ?? undefined,
      biochemicalResourcesRoll: biochemicalResourcesRoll ?? undefined,

      atmosphere,
      temperature,
      hazardType,
      hazardIntensity,
      biochemicalResources,

      atmosphereModifier: atmosphereEntry?.habitabilityModifier ?? 0,
      temperatureModifier: temperatureEntry?.habitabilityModifier ?? 0,
      hazardTypeModifier: 0,
      hazardIntensityModifier: hazardIntensityEntry?.habitabilityModifier ?? 0,
      biochemicalResourcesModifier: biochemicalResourcesEntry?.habitabilityModifier ?? 0,
    };
    localStorage.setItem("habitability", JSON.stringify(data));
    console.log("💾 Saved habitability data:", data);
  }, [
    atmosphereRoll,
    temperatureRoll,
    hazardTypeRoll,
    hazardIntensityRoll,
    biochemicalResourcesRoll,
    atmosphere,
    temperature,
    hazardType,
    hazardIntensity,
    biochemicalResources,
    atmosphereEntry,
    temperatureEntry,
    hazardIntensityEntry,
    biochemicalResourcesEntry,
  ]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("habitability");
    if (saved) {
      try {
        const data: HabitabilityData = JSON.parse(saved);

        setAtmosphereRoll(data.atmosphereRoll ?? null);
        setAtmosphere(data.atmosphere || "");

        setTemperatureRoll(data.temperatureRoll ?? null);
        setTemperature(data.temperature || "");

        setHazardTypeRoll(data.hazardTypeRoll ?? null);
        setHazardType(data.hazardType || "");

        setHazardIntensityRoll(data.hazardIntensityRoll ?? null);
        setHazardIntensity(data.hazardIntensity || "");

        setBiochemicalResourcesRoll(data.biochemicalResourcesRoll ?? null);
        setBiochemicalResources(data.biochemicalResources || "");

        console.log("📂 Loaded habitability data:", data);
      } catch (e) {
        console.error("Failed to load saved habitability data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Auto-save when form changes (only after initial load)
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
      context.setNextHandler(handleNext);
    }
  }, [isFormComplete, handleNext, context]);

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Habitability Parameters</h1>
          <p className="text-muted-foreground mb-4">
            Configure atmospheric and environmental conditions using 2D6 rolls or manual selection
          </p>

          {/* Generate All Button */}
          <Button onClick={rollAll} variant="outline" size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate All (2D6)
          </Button>
        </div>

        <div className="space-y-6">
          {/* Atmospheric Pressure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Atmospheric Pressure</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Determines breathability and environmental suit requirements</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={rollAtmosphere} variant="outline" size="sm" className="gap-2">
                  <Dices className="h-4 w-4" />
                  Roll 2D6
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={atmosphere} onValueChange={(value) => {
                setAtmosphere(value);
                setAtmosphereRoll(null); // Clear roll when manually selecting
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select atmospheric pressure" />
                </SelectTrigger>
                <SelectContent>
                  {ATMOSPHERE_TABLE.filter((entry, index, self) =>
                    self.findIndex(e => e.pressure === entry.pressure) === index
                  ).map((entry) => (
                    <SelectItem key={entry.pressure} value={entry.pressure}>
                      {entry.label} - {entry.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {atmosphereEntry && (
                <div className="flex items-center gap-4 text-sm">
                  {atmosphereRoll && (
                    <Badge variant="secondary" className="gap-1">
                      <Dices className="h-3 w-3" />
                      2D6: {atmosphereRoll}
                    </Badge>
                  )}
                  <span className={cn(
                    "font-medium",
                    atmosphereEntry.habitabilityModifier > 0 && "text-green-600 dark:text-green-400",
                    atmosphereEntry.habitabilityModifier < 0 && "text-red-600 dark:text-red-400"
                  )}>
                    Habitability: {atmosphereEntry.habitabilityModifier >= 0 ? "+" : ""}{atmosphereEntry.habitabilityModifier}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Temperature</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Surface temperature classification</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={rollTemperature} variant="outline" size="sm" className="gap-2">
                  <Dices className="h-4 w-4" />
                  Roll 2D6
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={temperature} onValueChange={(value) => {
                setTemperature(value);
                setTemperatureRoll(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select temperature range" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_TABLE.filter((entry, index, self) =>
                    self.findIndex(e => e.temperature === entry.temperature) === index
                  ).map((entry) => (
                    <SelectItem key={entry.temperature} value={entry.temperature}>
                      {entry.label} - {entry.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {temperatureEntry && (
                <div className="flex items-center gap-4 text-sm">
                  {temperatureRoll && (
                    <Badge variant="secondary" className="gap-1">
                      <Dices className="h-3 w-3" />
                      2D6: {temperatureRoll}
                    </Badge>
                  )}
                  <span className={cn(
                    "font-medium",
                    temperatureEntry.habitabilityModifier > 0 && "text-green-600 dark:text-green-400",
                    temperatureEntry.habitabilityModifier < 0 && "text-red-600 dark:text-red-400"
                  )}>
                    Habitability: {temperatureEntry.habitabilityModifier >= 0 ? "+" : ""}{temperatureEntry.habitabilityModifier}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hazard Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Environmental Hazard</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Environmental hazards present on the world</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={rollHazardType} variant="outline" size="sm" className="gap-2">
                  <Dices className="h-4 w-4" />
                  Roll 2D6
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={hazardType} onValueChange={(value) => {
                setHazardType(value);
                setHazardTypeRoll(null);

                // Clear intensity if changing to "None"
                const selectedEntry = HAZARD_TYPE_TABLE.find(e => e.hazardType === value);
                if (selectedEntry && !selectedEntry.requiresIntensity) {
                  setHazardIntensity("");
                  setHazardIntensityRoll(null);
                }
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HAZARD_TYPE_TABLE.filter((entry, index, self) =>
                    self.findIndex(e => e.hazardType === entry.hazardType) === index
                  ).map((entry) => (
                    <div
                      key={entry.hazardType}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={entry.hazardType} id={entry.hazardType} />
                      <Label htmlFor={entry.hazardType} className="cursor-pointer">
                        {entry.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {hazardTypeEntry && hazardTypeRoll && (
                <Badge variant="secondary" className="gap-1">
                  <Dices className="h-3 w-3" />
                  2D6: {hazardTypeRoll}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Hazard Intensity (conditional) */}
          {requiresHazardIntensity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Hazard Intensity</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Severity of the environmental hazard</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Button onClick={rollHazardIntensity} variant="outline" size="sm" className="gap-2">
                    <Dices className="h-4 w-4" />
                    Roll 2D6
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={hazardIntensity} onValueChange={(value) => {
                  setHazardIntensity(value);
                  setHazardIntensityRoll(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hazard intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    {HAZARD_INTENSITY_TABLE.filter((entry, index, self) =>
                      self.findIndex(e => e.intensity === entry.intensity) === index
                    ).map((entry) => (
                      <SelectItem key={entry.intensity} value={entry.intensity.toString()}>
                        {entry.label} - {entry.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hazardIntensityEntry && (
                  <div className="flex items-center gap-4 text-sm">
                    {hazardIntensityRoll && (
                      <Badge variant="secondary" className="gap-1">
                        <Dices className="h-3 w-3" />
                        2D6: {hazardIntensityRoll}
                      </Badge>
                    )}
                    <span className={cn(
                      "font-medium",
                      hazardIntensityEntry.habitabilityModifier < 0 && "text-red-600 dark:text-red-400"
                    )}>
                      Habitability: {hazardIntensityEntry.habitabilityModifier >= 0 ? "+" : ""}{hazardIntensityEntry.habitabilityModifier}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Biochemical Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Biochemical Resources</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Availability of water, oxygen, and life-supporting elements</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={rollBiochemicalResources} variant="outline" size="sm" className="gap-2">
                  <Dices className="h-4 w-4" />
                  Roll 2D6
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={biochemicalResources} onValueChange={(value) => {
                setBiochemicalResources(value);
                setBiochemicalResourcesRoll(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource availability" />
                </SelectTrigger>
                <SelectContent>
                  {BIOCHEMICAL_RESOURCES_TABLE.filter((entry, index, self) =>
                    self.findIndex(e => e.resources === entry.resources) === index
                  ).map((entry) => (
                    <SelectItem key={entry.resources} value={entry.resources}>
                      {entry.label} - {entry.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {biochemicalResourcesEntry && (
                <div className="flex items-center gap-4 text-sm">
                  {biochemicalResourcesRoll && (
                    <Badge variant="secondary" className="gap-1">
                      <Dices className="h-3 w-3" />
                      2D6: {biochemicalResourcesRoll}
                    </Badge>
                  )}
                  <span className={cn(
                    "font-medium",
                    biochemicalResourcesEntry.habitabilityModifier > 0 && "text-green-600 dark:text-green-400",
                    biochemicalResourcesEntry.habitabilityModifier < 0 && "text-red-600 dark:text-red-400"
                  )}>
                    Habitability: {biochemicalResourcesEntry.habitabilityModifier >= 0 ? "+" : ""}{biochemicalResourcesEntry.habitabilityModifier}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habitability Summary */}
          {isFormComplete && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Habitability Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Atmosphere ({atmosphereEntry?.label}):
                    </span>
                    <span className={cn(
                      "font-medium",
                      (atmosphereEntry?.habitabilityModifier ?? 0) > 0 && "text-green-600 dark:text-green-400",
                      (atmosphereEntry?.habitabilityModifier ?? 0) < 0 && "text-red-600 dark:text-red-400"
                    )}>
                      {(atmosphereEntry?.habitabilityModifier ?? 0) >= 0 ? "+" : ""}
                      {atmosphereEntry?.habitabilityModifier ?? 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Temperature ({temperatureEntry?.label}):
                    </span>
                    <span className={cn(
                      "font-medium",
                      (temperatureEntry?.habitabilityModifier ?? 0) > 0 && "text-green-600 dark:text-green-400",
                      (temperatureEntry?.habitabilityModifier ?? 0) < 0 && "text-red-600 dark:text-red-400"
                    )}>
                      {(temperatureEntry?.habitabilityModifier ?? 0) >= 0 ? "+" : ""}
                      {temperatureEntry?.habitabilityModifier ?? 0}
                    </span>
                  </div>

                  {requiresHazardIntensity && hazardIntensityEntry && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Hazard ({hazardTypeEntry?.label} - {hazardIntensityEntry.label}):
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {hazardIntensityEntry.habitabilityModifier >= 0 ? "+" : ""}
                        {hazardIntensityEntry.habitabilityModifier}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Resources ({biochemicalResourcesEntry?.label}):
                    </span>
                    <span className={cn(
                      "font-medium",
                      (biochemicalResourcesEntry?.habitabilityModifier ?? 0) > 0 && "text-green-600 dark:text-green-400",
                      (biochemicalResourcesEntry?.habitabilityModifier ?? 0) < 0 && "text-red-600 dark:text-red-400"
                    )}>
                      {(biochemicalResourcesEntry?.habitabilityModifier ?? 0) >= 0 ? "+" : ""}
                      {biochemicalResourcesEntry?.habitabilityModifier ?? 0}
                    </span>
                  </div>
                </div>

                {/* Total Score */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Total Habitability Score
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-3xl font-bold",
                        habitabilityRating.color
                      )}>
                        {totalHabitabilityScore >= 0 ? "+" : ""}
                        {totalHabitabilityScore}
                      </span>
                      <Badge variant="outline" className={habitabilityRating.color}>
                        {habitabilityRating.rating}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {habitabilityRating.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
