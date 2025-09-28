import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pencil, Minus, Plus } from "lucide-react";

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
  const navigate = useNavigate();
  const [starName, setStarName] = useState("Primary Star #1");
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
              <h2 className="text-2xl font-semibold">{starName}</h2>
              <Pencil className="h-5 w-5 text-muted-foreground cursor-pointer" />
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
                    className="h-20 text-xl"
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
              <Card className="mt-2 p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="text-xl font-bold">{overviewData.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mass</p>
                    <p className="text-xl font-bold">
                      {overviewData.mass.toFixed(2)} M☉
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Luminosity</p>
                    <p className="text-xl font-bold">
                      {overviewData.luminosity} L☉
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground text-center">
                    Modifier
                  </p>
                  <p className="text-xl font-bold text-center mt-1">None</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Section */}
      <div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
            Previous
          </Button>
          <Button size="lg">Next</Button>
        </div>
      </div>
    </div>
  );
}
