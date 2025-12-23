import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Orbit, Sparkles } from "lucide-react";
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

// Generate hexagonal grid with zones (corrected heat gradient from star)
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
      } else if (distanceFromCenter === 1) {
        zone = "hot"; // Closest to star = hottest
      } else if (distanceFromCenter === 2 || distanceFromCenter === 3) {
        zone = "habitable";
      } else if (distanceFromCenter === 4) {
        zone = "cold";
      } else if (distanceFromCenter === 5) {
        zone = "outer";
      }

      hexes.push({ q, r, zone });
    }
  }

  return hexes;
};

const getZoneLabel = (zone: HexPosition["zone"]) => {
  switch (zone) {
    case "star":
      return "Primary Star";
    case "hot":
      return "Hot Zone";
    case "habitable":
      return "Habitable Zone";
    case "cold":
      return "Cold Zone";
    case "outer":
      return "Outer System";
    case "empty":
      return "Deep Space";
    default:
      return "";
  }
};

const getZoneDescription = (zone: HexPosition["zone"]) => {
  switch (zone) {
    case "star":
      return "The heart of the system";
    case "hot":
      return "Intense radiation, volcanic worlds";
    case "habitable":
      return "Ideal for life-bearing worlds";
    case "cold":
      return "Frozen worlds, ice giants";
    case "outer":
      return "Distant, sparse matter";
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
  const [hoveredHex, setHoveredHex] = useState<HexPosition | null>(null);

  // Hex to pixel conversion - larger for mobile touch
  const hexSize = 32;
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
    if (hex.zone === "star") return;
    setSelectedHex(hex);
    const au = calculateAuDistance(hex);
    setAuDistance([au * 20]);
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
    navigate("../moons");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!isFormComplete);
      context.setNextHandler(handleNext);
    }
  }, [isFormComplete, handleNext, context]);

  // Calculate viewBox for SVG
  const viewBoxSize = hexSize * 14;
  const viewBoxOffset = viewBoxSize / 2;

  // Generate starfield background points
  const starfieldPoints = Array.from({ length: 60 }, (_, i) => ({
    x: (Math.sin(i * 7.3) * 0.5 + 0.5) * viewBoxSize - viewBoxOffset,
    y: (Math.cos(i * 11.7) * 0.5 + 0.5) * viewBoxSize - viewBoxOffset,
    size: 0.5 + Math.random() * 1.5,
    opacity: 0.3 + Math.random() * 0.7,
  }));

  return (
    <TooltipProvider>
      <div className="w-full min-h-[calc(100vh-200px)] flex flex-col">
        {/* Header - Compact for mobile */}
        <div className="px-4 py-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-200 bg-clip-text text-transparent">
            Orbital Position
          </h1>
          <p className="text-sm text-muted-foreground">
            Select where your world orbits within the stellar system
          </p>
        </div>

        {/* Main Content - Hex Grid takes center stage */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-2">
          {/* Hex Grid Container with glassmorphism */}
          <div className="relative w-full max-w-md aspect-square">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-indigo-500/10 rounded-3xl blur-xl" />
            
            {/* Glass panel */}
            <div className="relative w-full h-full bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
              
              <svg
                width="100%"
                height="100%"
                viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`}
                className="relative z-10"
              >
                {/* SVG Definitions for gradients and filters */}
                <defs>
                  {/* Star core gradient */}
                  <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="40%" stopColor="#fbbf24" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </radialGradient>
                  
                  {/* Star glow */}
                  <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                  
                  {/* Hot zone gradient */}
                  <linearGradient id="hotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
                  </linearGradient>
                  
                  {/* Habitable zone gradient */}
                  <linearGradient id="habitableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3" />
                  </linearGradient>
                  
                  {/* Cold zone gradient */}
                  <linearGradient id="coldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                  </linearGradient>
                  
                  {/* Outer zone gradient */}
                  <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                  </linearGradient>
                  
                  {/* Selection glow filter */}
                  <filter id="selectionGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Hover glow */}
                  <filter id="hoverGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Starfield background */}
                {starfieldPoints.map((star, i) => (
                  <circle
                    key={`star-${i}`}
                    cx={star.x}
                    cy={star.y}
                    r={star.size}
                    fill="white"
                    opacity={star.opacity * 0.5}
                  />
                ))}
                
                {/* Star glow background (large) */}
                <circle
                  cx={0}
                  cy={0}
                  r={hexSize * 2.5}
                  fill="url(#starGlow)"
                  className="animate-pulse"
                  style={{ animationDuration: '3s' }}
                />
                
                {/* Hex Grid */}
                {hexGrid.map((hex, index) => {
                  const { x, y } = hexToPixel(hex.q, hex.r);
                  const isSelected = selectedHex?.q === hex.q && selectedHex?.r === hex.r;
                  const isHovered = hoveredHex?.q === hex.q && hoveredHex?.r === hex.r;
                  
                  // Hexagon path points
                  const points = [];
                  for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const px = x + (hexSize - 2) * Math.cos(angle);
                    const py = y + (hexSize - 2) * Math.sin(angle);
                    points.push(`${px},${py}`);
                  }
                  
                  // Get fill based on zone
                  const getFill = () => {
                    if (hex.zone === "star") return "url(#starGradient)";
                    if (hex.zone === "hot") return "url(#hotGradient)";
                    if (hex.zone === "habitable") return "url(#habitableGradient)";
                    if (hex.zone === "cold") return "url(#coldGradient)";
                    if (hex.zone === "outer") return "url(#outerGradient)";
                    return "rgba(255,255,255,0.05)";
                  };
                  
                  // Get stroke color
                  const getStroke = () => {
                    if (isSelected) return "#fbbf24";
                    if (isHovered && hex.zone !== "star") return "rgba(255,255,255,0.5)";
                    if (hex.zone === "star") return "#fbbf24";
                    if (hex.zone === "hot") return "rgba(239,68,68,0.4)";
                    if (hex.zone === "habitable") return "rgba(16,185,129,0.4)";
                    if (hex.zone === "cold") return "rgba(59,130,246,0.4)";
                    if (hex.zone === "outer") return "rgba(99,102,241,0.3)";
                    return "rgba(255,255,255,0.1)";
                  };
                  
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <g
                          onClick={() => handleHexClick(hex)}
                          onMouseEnter={() => setHoveredHex(hex)}
                          onMouseLeave={() => setHoveredHex(null)}
                          className={cn(
                            "transition-all duration-200",
                            hex.zone !== "star" && "cursor-pointer"
                          )}
                          style={{
                            filter: isSelected ? "url(#selectionGlow)" : isHovered && hex.zone !== "star" ? "url(#hoverGlow)" : undefined,
                            transform: isSelected ? "scale(1.05)" : isHovered && hex.zone !== "star" ? "scale(1.02)" : undefined,
                            transformOrigin: `${x}px ${y}px`,
                          }}
                        >
                          {/* Main hex */}
                          <polygon
                            points={points.join(" ")}
                            fill={getFill()}
                            stroke={getStroke()}
                            strokeWidth={isSelected ? 2 : 1}
                          />
                          
                          {/* Star decoration */}
                          {hex.zone === "star" && (
                            <g>
                              <circle
                                cx={x}
                                cy={y}
                                r={hexSize * 0.6}
                                fill="url(#starGradient)"
                                className="animate-pulse"
                                style={{ animationDuration: '2s' }}
                              />
                              {/* Corona rays */}
                              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                                const angle = (Math.PI / 4) * i;
                                const x1 = x + Math.cos(angle) * (hexSize * 0.5);
                                const y1 = y + Math.sin(angle) * (hexSize * 0.5);
                                const x2 = x + Math.cos(angle) * (hexSize * 0.8);
                                const y2 = y + Math.sin(angle) * (hexSize * 0.8);
                                return (
                                  <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#fef3c7"
                                    strokeWidth="2"
                                    opacity={0.6}
                                    strokeLinecap="round"
                                  />
                                );
                              })}
                            </g>
                          )}
                          
                          {/* Selection indicator */}
                          {isSelected && hex.zone !== "star" && (
                            <g>
                              {/* Pulsing ring */}
                              <circle
                                cx={x}
                                cy={y}
                                r={hexSize * 0.4}
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="2"
                                className="animate-ping"
                                style={{ animationDuration: '1.5s' }}
                                opacity={0.5}
                              />
                              {/* Solid center */}
                              <circle
                                cx={x}
                                cy={y}
                                r={hexSize * 0.25}
                                fill="#fbbf24"
                              />
                              {/* Inner highlight */}
                              <circle
                                cx={x}
                                cy={y}
                                r={hexSize * 0.15}
                                fill="#fef3c7"
                              />
                            </g>
                          )}
                        </g>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="bg-black/90 backdrop-blur-sm border-white/20"
                      >
                        <div className="text-center">
                          <p className="font-semibold text-white">
                            {getZoneLabel(hex.zone)}
                          </p>
                          <p className="text-xs text-white/70">
                            {getZoneDescription(hex.zone)}
                          </p>
                          {hex.zone !== "star" && (
                            <p className="text-xs text-amber-300 mt-1">
                              ~{calculateAuDistance(hex).toFixed(2)} AU
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
          
          {/* Zone Info Card - Floating below grid */}
          <div className="w-full max-w-md mt-4">
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
              {selectedHex ? (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      selectedHex.zone === "hot" && "bg-gradient-to-br from-red-500/30 to-orange-500/30",
                      selectedHex.zone === "habitable" && "bg-gradient-to-br from-emerald-500/30 to-teal-500/30",
                      selectedHex.zone === "cold" && "bg-gradient-to-br from-blue-500/30 to-indigo-500/30",
                      selectedHex.zone === "outer" && "bg-gradient-to-br from-indigo-500/30 to-purple-500/30",
                    )}>
                      <Orbit className="w-6 h-6 text-white/80" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">
                      {getZoneLabel(selectedHex.zone)}
                    </h3>
                    <p className="text-sm text-white/60">
                      {getZoneDescription(selectedHex.zone)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-300">
                      {calculateAuDistance(selectedHex).toFixed(2)}
                    </div>
                    <div className="text-xs text-white/50">AU</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 py-2 text-white/50">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Tap a hex to select orbital position</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Panel - AU Distance Fine-tuning */}
        <div className="px-4 pb-6 pt-2">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Orbit className="w-4 h-4" />
                  Fine-tune Distance
                </Label>
                <span className="text-sm font-mono font-bold text-amber-300">
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
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>0 AU</span>
                <span>2.5 AU</span>
                <span>5 AU</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
