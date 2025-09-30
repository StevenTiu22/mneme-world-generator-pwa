import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Pencil, Minus, Plus, Check, X } from "lucide-react";

// --- Data and Types (No changes needed here) ---
const STAR_CLASSES = ["O", "B", "A", "F", "G", "K", "M"] as const;
type StarClass = (typeof STAR_CLASSES)[number];
interface StarData {
  color: string;
  mass: number;
  luminosity: number;
}
const STAR_DATA_MAP: Record<StarClass, StarData> = {
  O: { color: "Blue", mass: 27.2, luminosity: 30000 },
  B: { color: "Blue-White", mass: 10.5, luminosity: 10000 },
  A: { color: "White", mass: 2.1, luminosity: 25 },
  F: { color: "Yellow-White", mass: 1.4, luminosity: 5 },
  G: { color: "Yellow", mass: 1.0, luminosity: 1 },
  K: { color: "Orange", mass: 0.8, luminosity: 0.4 },
  M: { color: "Red", mass: 0.3, luminosity: 0.04 },
};

// --- Component ---
export function CreatePrimaryStar() {
  const [starName, setStarName] = useState("Primary Star #1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(starName);
  const [selectedClass, setSelectedClass] = useState<StarClass>("O");
  const [classGrade, setClassGrade] = useState(1);

  const overviewData = useMemo(
    () => STAR_DATA_MAP[selectedClass],
    [selectedClass]
  );

  const handleRandom = () => {
    const randomClass =
      STAR_CLASSES[Math.floor(Math.random() * STAR_CLASSES.length)];
    setSelectedClass(randomClass);
    setClassGrade(Math.floor(Math.random() * 10));
  };

  const handleSaveName = () => {
    setStarName(tempName);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(starName);
    setIsEditingName(false);
  };

  const handleEditClick = () => {
    setTempName(starName);
    setIsEditingName(true);
  };

  // This component now grows to fill the space provided by the layout
  return (
    <div className="flex flex-col flex-grow px-36">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Creating your Primary Star
        </h1>
      </div>

      {/* 2. Middle Section (grows to fill available space) */}
      <div className="px-48 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              {isEditingName ? (
                <>
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-2xl font-semibold h-12"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveName}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEdit}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold">{starName}</h2>
                  <Pencil
                    className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={handleEditClick}
                  />
                </>
              )}
            </div>
            <div>
              <Label className="text-base">Star Class</Label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mt-2">
                {[...STAR_CLASSES, "Random"].map((item) => (
                  <Button
                    key={item}
                    variant={
                      item !== "Random" && selectedClass === item
                        ? "secondary"
                        : "outline"
                    }
                    className="h-38 text-xl"
                    onClick={() =>
                      item === "Random"
                        ? handleRandom()
                        : setSelectedClass(item as StarClass)
                    }
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Overview */}
          <div className="space-y-8">
            <div>
              <Label className="text-base">Class Grade</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setClassGrade(Math.max(0, classGrade - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center">
                  {classGrade}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setClassGrade(Math.min(9, classGrade + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-base">Overview</Label>
              <Card className="mt-2 p-8 h-[420px]">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="flex flex-col justify-between p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-colors">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Color
                    </p>
                    <p className="text-3xl font-bold mt-auto">
                      {overviewData.color}
                    </p>
                  </div>
                  <div className="flex flex-col justify-between p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-colors">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Mass
                    </p>
                    <p className="text-3xl font-bold mt-auto">
                      {overviewData.mass.toFixed(2)}{" "}
                      <span className="text-xl">M☉</span>
                    </p>
                  </div>
                  <div className="flex flex-col justify-between p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-colors">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Luminosity
                    </p>
                    <p className="text-3xl font-bold mt-auto">
                      {overviewData.luminosity}{" "}
                      <span className="text-xl">L☉</span>
                    </p>
                  </div>
                  <div className="flex flex-col justify-between p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-colors">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Modifier
                    </p>
                    <p className="text-3xl font-bold mt-auto">None</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
