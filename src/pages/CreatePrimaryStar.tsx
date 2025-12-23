import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStellarProperty } from "@/lib/db/queries/stellarQueries";
import { generateStarId, generateSystemId } from "@/lib/db/queries/starQueries";
import { generateStarName } from "@/lib/generators/primaryStarGenerator";
import { calculateStellarZones } from "@/lib/stellar/zoneCalculations";
import type {
  StellarClass as StellarClassType,
  StellarGrade,
} from "@/models/stellar/types/enums";
import type { StarData, StellarZones } from "@/models/stellar/types/interface";
import { GenerationMethod } from "@/models/common/types";

// Import sub-components
import { StarNameEditor } from "@/components/stellar/StarNameEditor";
import {
  StarClassSelector,
  STAR_CLASSES,
  type StarClass,
} from "@/components/stellar/StarClassSelector";
import { GradeControl } from "@/components/stellar/GradeControl";
import { StellarPropertiesCard } from "@/components/stellar/StellarPropertiesCard";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

// Legacy interface for backward compatibility
interface PrimaryStarData {
  name: string;
  class: StarClass;
  grade: number;
}

// Extended interface for localStorage with starSystemId and stellar zones
interface PrimaryStarStorage extends StarData {
  starSystemId: string;
  stellarZones?: StellarZones;
}

export function CreatePrimaryStar() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();
  const [starId, setStarId] = useState(() => generateStarId());
  const [starSystemId, setStarSystemId] = useState(() => generateSystemId());
  const [starName, setStarName] = useState(() => generateStarName());
  const [selectedClass, setSelectedClass] = useState<StarClass>("G");
  const [classGrade, setClassGrade] = useState(5);
  const [generationMethod, setGenerationMethod] = useState<GenerationMethod>(
    GenerationMethod.CUSTOM
  );
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());

  // Query stellar properties from database with reactive updates
  const stellarProperty = useLiveQuery(
    () =>
      getStellarProperty(
        selectedClass as StellarClassType,
        classGrade as StellarGrade
      ),
    [selectedClass, classGrade]
  );

  // Derived star data for display
  const starData = useMemo(() => {
    if (!stellarProperty) {
      return null;
    }

    return {
      color: stellarProperty.color,
      description: stellarProperty.description,
      temperature: stellarProperty.temperatureRange,
      mass: stellarProperty.mass,
      luminosity: stellarProperty.luminosity,
    };
  }, [stellarProperty]);

  const isLoading = stellarProperty === undefined;

  const handleRandom = useCallback(() => {
    const randomClass =
      STAR_CLASSES[Math.floor(Math.random() * STAR_CLASSES.length)];
    const randomGrade = Math.floor(Math.random() * 10);
    setSelectedClass(randomClass);
    setClassGrade(randomGrade);
    setGenerationMethod(GenerationMethod.PROCEDURAL);
  }, []);

  const handleClassSelect = useCallback((starClass: StarClass) => {
    setSelectedClass(starClass);
    setClassGrade(5);
    setGenerationMethod(GenerationMethod.CUSTOM);
  }, []);

  const handleGradeChange = useCallback((grade: number) => {
    setClassGrade(grade);
    setGenerationMethod(GenerationMethod.CUSTOM);
  }, []);

  // Save data to localStorage
  const saveData = useCallback(() => {
    const now = new Date().toISOString();

    // Calculate stellar zones from luminosity
    let stellarZones: StellarZones | undefined;
    if (stellarProperty?.luminosity) {
      stellarZones = calculateStellarZones(stellarProperty.luminosity);
    }

    const fullStarData: PrimaryStarStorage = {
      id: starId,
      name: starName,
      stellarClass: selectedClass as StellarClassType,
      stellarGrade: classGrade as StellarGrade,
      generationMethod: generationMethod,
      createdAt: createdAt,
      updatedAt: now,
      createdBy: "user",
      starSystemId: starSystemId,
      stellarZones: stellarZones,
    };
    localStorage.setItem("primaryStar", JSON.stringify(fullStarData));
  }, [
    starId,
    starSystemId,
    starName,
    selectedClass,
    classGrade,
    generationMethod,
    createdAt,
    stellarProperty,
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("primaryStar");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if ("stellarClass" in data) {
          const starData = data as Partial<PrimaryStarStorage>;
          setStarId(starData.id!);
          setStarName(starData.name!);
          setSelectedClass(starData.stellarClass as StarClass);
          setClassGrade(starData.stellarGrade!);
          setGenerationMethod(starData.generationMethod!);
          setCreatedAt(starData.createdAt!);
          // Load starSystemId if it exists, otherwise keep the generated one
          if (starData.starSystemId) {
            setStarSystemId(starData.starSystemId);
          }
        } else if ("class" in data) {
          // Legacy format support
          const oldData = data as PrimaryStarData;
          setStarName(oldData.name);
          setSelectedClass(oldData.class);
          setClassGrade(oldData.grade);
        }
      } catch (e) {
        console.error("Failed to load saved primary star data", e);
      }
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData();
  }, [saveData]);

  // Handler for Next button
  const handleNext = useCallback(() => {
    saveData();
    navigate("../world-context");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(false);
      context.setNextHandler(handleNext);
    }
  }, [handleNext, context]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputActive =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (isInputActive) return;

      if (e.key === "r" || e.key === "R") {
        handleRandom();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleRandom]);

  return (
    <TooltipProvider>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
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
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <StarNameEditor name={starName} onNameChange={setStarName} />

            <StarClassSelector
              selectedClass={selectedClass}
              onClassSelect={handleClassSelect}
              onRandomGenerate={handleRandom}
              starColor={starData?.color}
              starDescription={starData?.description}
              starTemperature={starData?.temperature}
            />
          </div>

          {/* Right Column: Grade & Properties */}
          <div className="space-y-5">
            <GradeControl
              grade={classGrade}
              onGradeChange={handleGradeChange}
            />

            {starData ? (
              <StellarPropertiesCard
                color={starData.color}
                mass={starData.mass}
                luminosity={starData.luminosity}
                temperature={starData.temperature}
              />
            ) : (
              <div className="text-center text-muted-foreground py-6">
                Loading properties...
              </div>
            )}

            {/* Classification Summary */}
            <div className="bg-primary/5 rounded-lg p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Classification
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {selectedClass}
                  {classGrade} V
                </div>
                <div className="text-sm text-muted-foreground">
                  Main Sequence Star
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Lower grades (0) are brighter and more massive than higher grades
            (9).
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
