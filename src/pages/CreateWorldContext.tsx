import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

// Tech levels from Mneme documentation
const TECH_LEVELS = [
  { value: "7", label: "Early Space Age", era: "1950-2000 CE", cetl: "6.0" },
  { value: "8", label: "Commercial Space", era: "2000-2050 CE", cetl: "6.5" },
  { value: "9", label: "New Space Race", era: "2050-2100 CE", cetl: "7.0" },
  {
    value: "10",
    label: "Cis Lunar Development",
    era: "2100-2200 CE",
    cetl: "7.5",
  },
  {
    value: "11",
    label: "Interstellar Settlement",
    era: "2200-2300 CE",
    cetl: "8.5",
  },
  {
    value: "12",
    label: "Post Earth Dependence",
    era: "2300-2400 CE",
    cetl: "9.0",
  },
  { value: "13", label: "Early Jump-Drive", era: "2400-2500 CE", cetl: "9.5" },
  { value: "14", label: "Interstellar Space", era: "2500-2600 CE", cetl: "10" },
  {
    value: "15",
    label: "Interstellar Colonization",
    era: "2600-2700 CE",
    cetl: "10.5",
  },
  {
    value: "16",
    label: "Self-Sufficient Megastructures",
    era: "2700+ CE",
    cetl: "11",
  },
];

// Zone colors and labels
const ZONES = [
  { label: "Outer Solar System", color: "bg-gray-400", height: "h-16" },
  { label: "Infernal Zone", color: "bg-red-600", height: "h-12" },
  { label: "Hot Zone", color: "bg-orange-400", height: "h-12" },
  {
    label: "Conservative Habitable Zone",
    color: "bg-green-400",
    height: "h-12",
  },
  { label: "Cold Zone", color: "bg-cyan-400", height: "h-12" },
  { label: "Outer Solar System", color: "bg-gray-600", height: "h-16" },
];

interface WorldContextData {
  techLevel: string;
  advantages: string[];
  disadvantages: string[];
}

export function CreateWorldContext() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();
  const [techLevel, setTechLevel] = useState("");

  // Get selected tech level details
  const selectedTechLevel = TECH_LEVELS.find((tl) => tl.value === techLevel);

  // Save data
  const saveData = useCallback(() => {
    const data: WorldContextData = {
      techLevel,
      advantages: [], // These would be populated from user input
      disadvantages: [], // These would be populated from user input
    };
    localStorage.setItem("worldContext", JSON.stringify(data));
  }, [techLevel]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("worldContext");
    if (saved) {
      try {
        const data: WorldContextData = JSON.parse(saved);
        setTechLevel(data.techLevel);
      } catch (e) {
        console.error("Failed to load saved world context data", e);
      }
    } else {
      // Default to tech level 11 (Interstellar Settlement)
      setTechLevel("11");
    }
  }, []);

  // Auto-save
  useEffect(() => {
    saveData();
  }, [saveData]);

  // Handler for Next button
  const handleNext = useCallback(() => {
    saveData();
    navigate("../companion-star");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!techLevel);
      context.setNextHandler(() => handleNext);
    }
  }, [techLevel, handleNext, context]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">World Context Profile</h1>
        <p className="text-muted-foreground">
          Set the technological and contextual parameters for your world
        </p>
      </div>

      {/* Zone and Limits Visualization */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Zone and Limits</h2>
        <Card className="p-0 overflow-hidden">
          <div className="relative">
            {ZONES.map((zone, index) => (
              <div
                key={index}
                className={`${zone.color} ${zone.height} relative`}
                title={zone.label}
              >
                {/* Vertical line indicators for planets/bodies */}
                {index < ZONES.length - 1 && (
                  <>
                    <div className="absolute top-0 bottom-0 left-1/3 w-px bg-black/20" />
                    <div className="absolute top-0 bottom-0 left-2/3 w-px bg-black/20" />
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Visualization of stellar zones based on your primary star's luminosity
        </p>
      </div>

      {/* Technological Level */}
      <div className="mb-8">
        <Label
          htmlFor="tech-level"
          className="text-lg font-semibold mb-3 block"
        >
          Technological Level
        </Label>
        <Select value={techLevel} onValueChange={setTechLevel}>
          <SelectTrigger id="tech-level" className="w-full">
            <SelectValue placeholder="Select technological era" />
          </SelectTrigger>
          <SelectContent>
            {TECH_LEVELS.map((tl) => (
              <SelectItem key={tl.value} value={tl.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{tl.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {tl.era}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTechLevel && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="font-semibold">{selectedTechLevel.label}</span>
              <span className="text-muted-foreground">
                {" "}
                • {selectedTechLevel.era}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Cepheus Engine TL: {selectedTechLevel.cetl}
            </div>
          </div>
        )}
      </div>

      {/* Advantages Section (Placeholder) */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3">Advantages</h3>
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Advantages will be determined based on your world configuration
          </p>
        </Card>
      </div>

      {/* Disadvantages Section (Placeholder) */}
      <div className="mb-8">
        <h3 className="text-base font-semibold mb-3">Disadvantages</h3>
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Disadvantages will be determined based on your world configuration
          </p>
        </Card>
      </div>
    </div>
  );
}
