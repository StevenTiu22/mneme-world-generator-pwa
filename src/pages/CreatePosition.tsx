import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

interface HexPosition {
  q: number; // column
  r: number; // row
  zone: "outer" | "hot" | "habitable" | "cold" | "star" | "empty";
}

interface PositionData {
  selectedHex: HexPosition | null;
  auDistance: number;
}

// Generate hexagonal grid with zones
const generateHexGrid = (): HexPosition[] => {
  const hexes: HexPosition[] = [];
  const radius = 5; // Grid radius

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const distanceFromCenter = Math.max(
        Math.abs(q),
        Math.abs(r),
        Math.abs(-q - r)
      );

      let zone: HexPosition["zone"] = "empty";

      if (q === 0 && r === 0) {
        zone = "star";
      } else if (distanceFromCenter === 1 || distanceFromCenter === 2) {
        zone = "habitable";
      } else if (distanceFromCenter === 3) {
        zone = "cold";
      } else if (distanceFromCenter === 4) {
        zone = "hot";
      } else if (distanceFromCenter === 5) {
        zone = "outer";
      }

      hexes.push({ q, r, zone });
    }
  }

  return hexes;
};

const getZoneColor = (zone: HexPosition["zone"], isSelected: boolean) => {
  if (isSelected) {
    return "fill-primary stroke-primary";
  }

  switch (zone) {
    case "star":
      return "fill-yellow-400 stroke-yellow-600";
    case "habitable":
      return "fill-yellow-200 stroke-yellow-400";
    case "cold":
      return "fill-blue-300 stroke-blue-400";
    case "hot":
      return "fill-orange-300 stroke-orange-400";
    case "outer":
      return "fill-orange-400 stroke-orange-500";
    case "empty":
      return "fill-white stroke-gray-300";
    default:
      return "fill-white stroke-gray-300";
  }
};

const getZoneLabel = (zone: HexPosition["zone"]) => {
  switch (zone) {
    case "star":
      return "Primary Star";
    case "habitable":
      return "Habitable Zone";
    case "cold":
      return "Cold Zone";
    case "hot":
      return "Hot Zone";
    case "outer":
      return "Outer Solar System";
    case "empty":
      return "Empty Space";
    default:
      return "";
  }
};

export function CreatePosition() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  const [hexGrid] = useState<HexPosition[]>(generateHexGrid());
  const [selectedHex, setSelectedHex] = useState<HexPosition | null>(null);
  const [auDistance, setAuDistance] = useState([50]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hex to pixel conversion
  const hexSize = 30;
  const hexToPixel = (q: number, r: number) => {
    const x = hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = hexSize * ((3 / 2) * r);
    return { x, y };
  };

  // Calculate AU distance based on selected hex
  const calculateAuDistance = (hex: HexPosition) => {
    const distance = Math.max(
      Math.abs(hex.q),
      Math.abs(hex.r),
      Math.abs(-hex.q - hex.r)
    );
    return distance * 0.5; // Each ring is roughly 0.5 AU
  };

  const handleHexClick = (hex: HexPosition) => {
    if (hex.zone === "star") return; // Can't select the star itself
    setSelectedHex(hex);
    const au = calculateAuDistance(hex);
    setAuDistance([au * 20]); // Scale for slider
  };

  // Check if form is complete
  const isFormComplete = selectedHex !== null;

  // Save data
  const saveData = useCallback(() => {
    const data: PositionData = {
      selectedHex,
      auDistance: auDistance[0],
    };
    localStorage.setItem("position", JSON.stringify(data));
  }, [selectedHex, auDistance]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("position");
    if (saved) {
      try {
        const data: PositionData = JSON.parse(saved);
        setSelectedHex(data.selectedHex);
        setAuDistance([data.auDistance]);
      } catch (e) {
        console.error("Failed to load saved position data", e);
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
    navigate("../planetary-system");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!isFormComplete);
      context.setNextHandler(() => handleNext);
    }
  }, [isFormComplete, handleNext, context]);

  // Calculate viewBox for SVG
  const viewBoxSize = hexSize * 12;
  const viewBoxOffset = viewBoxSize / 2;

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Position</h1>
          <p className="text-muted-foreground">
            Select the orbital position of your world within the stellar system
          </p>
        </div>

        {/* Zone Label */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Zone</h2>
          {selectedHex && (
            <p className="text-sm text-muted-foreground">
              Selected: {getZoneLabel(selectedHex.zone)} (
              {calculateAuDistance(selectedHex).toFixed(2)} AU)
            </p>
          )}
        </div>

        {/* Hexagonal Grid */}
        <div className="mb-8 flex justify-center">
          <div className="relative bg-background rounded-lg p-8 border">
            <svg
              width="100%"
              height="100%"
              viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`}
              className="max-w-md mx-auto"
            >
              {hexGrid.map((hex, index) => {
                const { x, y } = hexToPixel(hex.q, hex.r);
                const isSelected =
                  selectedHex?.q === hex.q && selectedHex?.r === hex.r;

                // Hexagon path
                const points = [];
                for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i;
                  const px = x + hexSize * Math.cos(angle);
                  const py = y + hexSize * Math.sin(angle);
                  points.push(`${px},${py}`);
                }

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <g
                        onClick={() => handleHexClick(hex)}
                        className={cn(
                          "transition-all",
                          hex.zone !== "star" &&
                            "cursor-pointer hover:opacity-80"
                        )}
                      >
                        <polygon
                          points={points.join(" ")}
                          className={getZoneColor(hex.zone, isSelected)}
                          strokeWidth="2"
                        />
                        {hex.zone === "star" && (
                          <g transform={`translate(${x}, ${y})`}>
                            <circle r="12" className="fill-yellow-500" />
                            <circle r="8" className="fill-yellow-300" />
                            {/* Sun rays */}
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                              const angle = (Math.PI / 4) * i;
                              const x1 = Math.cos(angle) * 10;
                              const y1 = Math.sin(angle) * 10;
                              const x2 = Math.cos(angle) * 16;
                              const y2 = Math.sin(angle) * 16;
                              return (
                                <line
                                  key={i}
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  className="stroke-yellow-400"
                                  strokeWidth="2"
                                />
                              );
                            })}
                          </g>
                        )}
                        {isSelected && hex.zone !== "star" && (
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            className="fill-primary-foreground stroke-primary"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <p className="font-semibold">
                          {getZoneLabel(hex.zone)}
                        </p>
                        {hex.zone !== "star" && (
                          <p className="text-xs">
                            ~{calculateAuDistance(hex).toFixed(2)} AU from star
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </div>
        </div>

        {/* AU Distance Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-lg font-semibold flex items-center gap-2">
              AU Distance
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </Label>
            <span className="text-sm font-medium">
              {(auDistance[0] / 20).toFixed(2)} AU
            </span>
          </div>
          <Slider
            value={auDistance}
            onValueChange={setAuDistance}
            min={0}
            max={100}
            step={1}
            className="w-full"
            disabled={!selectedHex}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0 AU (Star)</span>
            <span>2.5 AU</span>
            <span>5 AU</span>
          </div>
          {!selectedHex && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Select a position on the hex map to adjust distance
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
