import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import type { StellarClass, StellarGrade } from "@/models/stellar/types/enums";
import type { StellarZones } from "@/models/stellar/types/interface";
import { StellarZonesDisplay } from "@/components/stellar/StellarZonesDisplay";
import { calculateStellarZonesFromClassGrade } from "@/lib/stellar/zoneCalculations";
import { useLiveQuery } from "dexie-react-hooks";
import { getStellarProperty } from "@/lib/db/queries/stellarQueries";
import {
  WORLD_DEVELOPMENT_LEVELS,
  determineWorldDevelopment,
  getHabitabilityRating,
} from "@/models/world/types";

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

interface PrimaryStarData {
  name: string;
  class: StellarClass;
  grade: StellarGrade;
}

interface CompanionStarData {
  systemType: string;
  companions: Array<{
    name: string;
    orbitalDistance: number;
  }>;
}

interface WorldContextData {
  techLevel: string;
  advantages: string[];
  disadvantages: string[];
}

export function CreateWorldContext() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();
  const [techLevel, setTechLevel] = useState("");
  const [primaryStar, setPrimaryStar] = useState<PrimaryStarData | null>(null);
  const [companionStars, setCompanionStars] = useState<CompanionStarData | null>(null);
  const [primaryZones, setPrimaryZones] = useState<StellarZones | null>(null);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get selected tech level details
  const selectedTechLevel = TECH_LEVELS.find((tl) => tl.value === techLevel);

  // Calculate world development and habitability preview
  // This is a preview based on tech level alone; full calculation happens on habitability page
  const techLevelNum = techLevel ? parseInt(techLevel) : 11;
  const estimatedHabitability = 0; // Default neutral habitability
  const worldDevelopment = determineWorldDevelopment(techLevelNum, estimatedHabitability);
  const developmentInfo = WORLD_DEVELOPMENT_LEVELS[worldDevelopment];
  const habitabilityRating = getHabitabilityRating(estimatedHabitability);

  // Get primary star properties from database
  const stellarProperty = useLiveQuery(
    () => {
      if (!primaryStar) return null;
      return getStellarProperty(primaryStar.class, primaryStar.grade);
    },
    [primaryStar]
  );

  // Save data
  const saveData = useCallback(() => {
    const data: WorldContextData = {
      techLevel,
      advantages: [], // These would be populated from user input
      disadvantages: [], // These would be populated from user input
    };
    localStorage.setItem("worldContext", JSON.stringify(data));
  }, [techLevel]);

  // Load primary star data
  useEffect(() => {
    const loadPrimaryStarData = async () => {
      try {
        const saved = localStorage.getItem("primaryStar");
        if (!saved) {
          console.warn("No primary star data found");
          setIsLoadingZones(false);
          return;
        }

        const data: PrimaryStarData = JSON.parse(saved);
        setPrimaryStar(data);

        // Calculate zones
        const zones = await calculateStellarZonesFromClassGrade(data.class, data.grade);
        setPrimaryZones(zones);
        setIsLoadingZones(false);
      } catch (error) {
        console.error("Failed to load primary star data:", error);
        setIsLoadingZones(false);
      }
    };

    loadPrimaryStarData();
  }, []);

  // Load companion star data
  useEffect(() => {
    const saved = localStorage.getItem("companionStars");
    if (saved) {
      try {
        const data: CompanionStarData = JSON.parse(saved);
        setCompanionStars(data);
      } catch (e) {
        console.error("Failed to load companion star data", e);
      }
    }
  }, []);

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
    setIsInitialized(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (isInitialized) {
      saveData();
    }
  }, [saveData, isInitialized]);

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
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">World Context Profile</h1>
        <p className="text-muted-foreground">
          Set the technological and contextual parameters for your world
        </p>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Primary Star Info */}
          {primaryStar && (
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Primary Star: {primaryStar.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Stellar Classification</p>
                <p className="text-lg font-semibold font-mono">
                  {primaryStar.class}{primaryStar.grade}
                </p>
              </div>
              {stellarProperty && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Luminosity</p>
                    <p className="text-lg font-semibold">
                      {stellarProperty.luminosity.toFixed(2)} L☉
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mass</p>
                    <p className="text-lg font-semibold">
                      {stellarProperty.mass.toFixed(2)} M☉
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-lg font-semibold">
                      {stellarProperty.temperature} K
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Companion Star Info */}
            {companionStars && companionStars.companions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{companionStars.systemType}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {companionStars.companions.length} companion star(s)
                  </span>
                </div>
                <div className="space-y-1">
                  {companionStars.companions.map((companion, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      • {companion.name} at {companion.orbitalDistance.toFixed(1)} AU
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
            </Card>
          )}

          {/* Zone and Limits Visualization */}
          <div>
        <h2 className="text-xl font-semibold mb-4">Stellar Zones & Orbital Limits</h2>
        {isLoadingZones ? (
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Loading stellar zones...
            </p>
          </Card>
        ) : primaryZones ? (
          <StellarZonesDisplay
            zones={primaryZones}
            companionDistance={
              companionStars?.companions?.[0]?.orbitalDistance
            }
          />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No primary star data available. Please create a primary star first.
            </p>
          </Card>
        )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Technological Level */}
          <div>
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
                {tl.label} - {tl.era}
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

          {/* World Development Level */}
          <div>
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          World Development Level
        </h3>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{developmentInfo.label}</CardTitle>
              <Badge variant="secondary" className="font-mono">
                TL {techLevel || '11'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {developmentInfo.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Governance Modifier */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Governance</p>
                  <p className="text-sm text-muted-foreground">
                    {developmentInfo.governanceModifier}
                  </p>
                </div>
              </div>

              {/* Port Fee Multiplier */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingUp className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Port Fees</p>
                  <p className="text-sm text-muted-foreground">
                    {developmentInfo.portFeeMultiplier}x standard rate
                  </p>
                </div>
              </div>

              {/* Development Effects */}
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  MECHANICAL EFFECTS
                </p>
                <ul className="space-y-1">
                  {developmentInfo.effects.map((effect, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>

          {/* Habitability Preview */}
          <div>
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Habitability Preview
        </h3>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Estimated Habitability Rating
              </p>
              <p className={`text-2xl font-bold ${habitabilityRating.color}`}>
                {habitabilityRating.rating}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {habitabilityRating.description}
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Final habitability will be calculated based on
                atmospheric pressure, temperature, hazards, and biochemical resources
                configured on the Habitability page.
              </p>
            </div>

            {/* Modifiers that will affect habitability */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                HABITABILITY MODIFIERS (PREVIEW)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-muted/30 rounded">
                  <p className="text-muted-foreground">Tech Level</p>
                  <p className="font-semibold">TL {techLevel || '11'}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <p className="text-muted-foreground">Orbital Zone</p>
                  <p className="font-semibold">To be determined</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <p className="text-muted-foreground">Atmosphere</p>
                  <p className="font-semibold">Not configured</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <p className="text-muted-foreground">Hazards</p>
                  <p className="font-semibold">Not configured</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
