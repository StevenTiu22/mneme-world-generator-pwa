import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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

// Wealth options
const WEALTH_OPTIONS = [
  { value: "average", label: "Average", soc: 0 },
  { value: "better-off", label: "Better Off", soc: 1 },
  { value: "prosperous", label: "Prosperous", soc: 2 },
  { value: "affluent", label: "Affluent", soc: 3 },
  { value: "random", label: "Random", soc: 0 },
];

// Power Structure options
const POWER_STRUCTURE = [
  { value: "anarchy", label: "Anarchy" },
  { value: "confederation", label: "Confederation" },
  { value: "federation", label: "Federation" },
  { value: "unitary-state", label: "Unitary State" },
  { value: "random", label: "Random" },
];

// Development options
const DEVELOPMENT_OPTIONS = [
  { value: "underdeveloped", label: "Underdeveloped", hdi: "0.0-0.59", soc: 2 },
  { value: "developing", label: "Developing", hdi: "0.60-0.69", soc: 5 },
  { value: "mature", label: "Mature", hdi: "0.70-0.79", soc: 6 },
  { value: "developed", label: "Developed", hdi: "0.80-0.89", soc: 8 },
  {
    value: "well-developed",
    label: "Well Developed",
    hdi: "0.90-0.94",
    soc: 9,
  },
  { value: "very-developed", label: "Very Developed", hdi: ">0.95", soc: 10 },
];

// Source of Power options
const SOURCE_OF_POWER = [
  { value: "aristocracy", label: "Aristocracy" },
  { value: "ideocracy", label: "Ideocracy" },
  { value: "kratocracy", label: "Kratocracy" },
  { value: "democracy", label: "Democracy" },
  { value: "meritocracy", label: "Meritocracy" },
  { value: "random", label: "Random" },
];

// Amber Zone Reasons
const AMBER_ZONE_REASONS = [
  { value: "war", label: "War" },
  { value: "plague", label: "Plague" },
  { value: "insurgency", label: "Major Insurgency and Terrorism" },
  { value: "security", label: "Heightened Security" },
  { value: "purging", label: "Political Purging" },
  { value: "economic-crisis", label: "Economic Crisis" },
  {
    value: "political-issue",
    label: "Major Political Issue/Tragedy/Controversy",
  },
  { value: "environmental", label: "Environmental Disaster" },
  { value: "social-issue", label: "Major Social Issue" },
  { value: "engineering", label: "Engineering Disaster" },
  { value: "collapse", label: "Major Economic Collapse" },
];

interface InhabitantsData {
  population: string;
  wealth: string;
  powerStructure: string;
  development: string;
  sourceOfPower: string;
  amberZone: boolean;
  amberZoneReason: string;
}

export function CreateInhabitants() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  const [population, setPopulation] = useState("100000000");
  const [wealth, setWealth] = useState("");
  const [powerStructure, setPowerStructure] = useState("");
  const [development, setDevelopment] = useState("");
  const [sourceOfPower, setSourceOfPower] = useState("");
  const [amberZone, setAmberZone] = useState(false);
  const [amberZoneReason, setAmberZoneReason] = useState("");

  const formatPopulation = (value: string) => {
    return parseInt(value).toLocaleString();
  };

  // Check if form is complete
  const isFormComplete =
    population && wealth && powerStructure && development && sourceOfPower;

  // Save data
  const saveData = useCallback(() => {
    const data: InhabitantsData = {
      population,
      wealth,
      powerStructure,
      development,
      sourceOfPower,
      amberZone,
      amberZoneReason,
    };
    localStorage.setItem("inhabitants", JSON.stringify(data));
  }, [
    population,
    wealth,
    powerStructure,
    development,
    sourceOfPower,
    amberZone,
    amberZoneReason,
  ]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("inhabitants");
    if (saved) {
      try {
        const data: InhabitantsData = JSON.parse(saved);
        setPopulation(data.population);
        setWealth(data.wealth);
        setPowerStructure(data.powerStructure);
        setDevelopment(data.development);
        setSourceOfPower(data.sourceOfPower);
        setAmberZone(data.amberZone);
        setAmberZoneReason(data.amberZoneReason);
      } catch (e) {
        console.error("Failed to load saved inhabitants data", e);
      }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (isFormComplete) {
      saveData();
    }
  }, [saveData, isFormComplete]);

  // Handler for Next button
  const handleNext = useCallback(() => {
    saveData();
    navigate("../world-starport");
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
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Inhabitants</h1>
          <p className="text-muted-foreground">
            Configure population and societal characteristics
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Actual Population */}
            <div>
              <Label
                htmlFor="population"
                className="text-lg font-semibold mb-3 block"
              >
                Actual Population
              </Label>
              <Input
                id="population"
                type="number"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="text-xl font-semibold text-center"
                placeholder="Enter population"
              />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {formatPopulation(population || "0")}
              </p>
            </div>

            {/* Wealth */}
            <div>
              <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                Wealth
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Economic prosperity level of the world</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {WEALTH_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    role="button"
                    onClick={() => setWealth(option.value)}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 relative",
                      wealth === option.value &&
                        "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <CardContent className="flex items-center justify-center p-8 relative">
                      <div
                        className={cn(
                          "absolute top-3 right-3 h-5 w-5 rounded-full border-2",
                          wealth === option.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {wealth === option.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-semibold">
                        {option.label}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* World Power Structure */}
            <div>
              <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                World Power Structure
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Political organization of the world</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {POWER_STRUCTURE.map((option) => (
                  <Card
                    key={option.value}
                    role="button"
                    onClick={() => setPowerStructure(option.value)}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 relative",
                      powerStructure === option.value &&
                        "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <CardContent className="flex items-center justify-center p-8 relative">
                      <div
                        className={cn(
                          "absolute top-3 right-3 h-5 w-5 rounded-full border-2",
                          powerStructure === option.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {powerStructure === option.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-semibold">
                        {option.label}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* World Development */}
            <div>
              <Label
                htmlFor="development"
                className="text-lg font-semibold mb-3 block"
              >
                World Development
              </Label>
              <Select value={development} onValueChange={setDevelopment}>
                <SelectTrigger id="development">
                  <SelectValue placeholder="Select development level" />
                </SelectTrigger>
                <SelectContent>
                  {DEVELOPMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          HDI: {option.hdi}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* World Source of Power */}
            <div>
              <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                World Source of Power
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Basis of authority and legitimacy</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {SOURCE_OF_POWER.map((option) => (
                  <Card
                    key={option.value}
                    role="button"
                    onClick={() => setSourceOfPower(option.value)}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 relative",
                      sourceOfPower === option.value &&
                        "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <CardContent className="flex items-center justify-center p-8 relative">
                      <div
                        className={cn(
                          "absolute top-3 right-3 h-5 w-5 rounded-full border-2",
                          sourceOfPower === option.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {sourceOfPower === option.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-semibold">
                        {option.label}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Amber Zone */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="amber-zone"
                  checked={amberZone}
                  onCheckedChange={(checked) =>
                    setAmberZone(checked as boolean)
                  }
                />
                <Label
                  htmlFor="amber-zone"
                  className="text-lg font-semibold cursor-pointer flex items-center gap-2"
                >
                  Amber Zone
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        World deemed dangerous; travelers should be cautious
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
              </div>

              {amberZone && (
                <div>
                  <Label
                    htmlFor="amber-reason"
                    className="text-base mb-2 block"
                  >
                    Amber Zone Reason
                  </Label>
                  <Select
                    value={amberZoneReason}
                    onValueChange={setAmberZoneReason}
                  >
                    <SelectTrigger id="amber-reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {AMBER_ZONE_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            {isFormComplete && (
              <Card className="p-6 bg-muted/30">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Human Development Index
                    </h3>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Ave. SOC
                    </h3>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Habitability
                    </h3>
                    <Skeleton className="h-3 w-1/2" />
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
