import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shuffle, Info } from "lucide-react";

const STAR_CLASSES = ["O", "B", "A", "F", "G", "K", "M"] as const;
type StarClass = (typeof STAR_CLASSES)[number];

interface StarClassSelectorProps {
  selectedClass: StarClass;
  onClassSelect: (starClass: StarClass) => void;
  onRandomGenerate: () => void;
  starColor?: string;
  starDescription?: string;
  starTemperature?: string;
}

// Star class information
const STAR_CLASS_INFO: Record<StarClass, {
  color: string;
  description: string;
  temperature: string;
  examples: string;
  characteristics: string;
}> = {
  O: {
    color: "Blue",
    description: "The hottest and most massive main sequence stars",
    temperature: "≥30,000 K",
    examples: "Albireo (O9.5), Theta1 Orionis C",
    characteristics: "Extremely luminous, short-lived (few million years), rare"
  },
  B: {
    color: "Blue-White",
    description: "Hot massive stars with strong hydrogen absorption",
    temperature: "10,000-30,000 K",
    examples: "Rigel, Spica, Regulus",
    characteristics: "Luminous, moderately long-lived, fairly rare"
  },
  A: {
    color: "White",
    description: "Hot stars with balanced hydrogen and ionized metals",
    temperature: "7,500-10,000 K",
    examples: "Sirius A, Vega, Altair",
    characteristics: "Moderately luminous, common, stable"
  },
  F: {
    color: "Yellow-White",
    description: "Intermediate between hot and cool stars",
    temperature: "6,000-7,500 K",
    examples: "Procyon A, Canopus (F-type supergiant)",
    characteristics: "Yellow-white hue, relatively common"
  },
  G: {
    color: "Yellow",
    description: "Sun-like stars with balanced fusion and long lifespans",
    temperature: "5,200-6,000 K",
    examples: "The Sun, Alpha Centauri A, Tau Ceti",
    characteristics: "Stable, long-lived (billions of years), favorable for life"
  },
  K: {
    color: "Orange",
    description: "Cool stars with lower luminosity than the Sun",
    temperature: "3,700-5,200 K",
    examples: "Proxima Centauri, Epsilon Eridani, Mizar B",
    characteristics: "Long-lived, common, small but stable"
  },
  M: {
    color: "Red",
    description: "The coolest and smallest main sequence stars",
    temperature: "2,400-3,700 K",
    examples: "Proxima Centauri, TRAPPIST-1, Barnard's Star",
    characteristics: "Most common type, very long-lived, low luminosity"
  }
};

export function StarClassSelector({
  selectedClass,
  onClassSelect,
  onRandomGenerate,
  starColor,
  starDescription,
  starTemperature,
}: StarClassSelectorProps) {
  return (
    <div>
      <Label className="text-base mb-3 flex items-center gap-2">
        Star Class
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Harvard spectral classification: O (hottest) to M (coolest)</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <div className="grid grid-cols-4 gap-3">
        {STAR_CLASSES.map((starClass) => (
          <Tooltip key={starClass}>
            <TooltipTrigger asChild>
              <Button
                variant={selectedClass === starClass ? "default" : "outline"}
                className="h-20 text-2xl font-bold relative"
                onClick={() => onClassSelect(starClass)}
              >
                {starClass}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">
                  {selectedClass === starClass && starColor
                    ? starColor
                    : "Loading..."}
                </p>
                <p className="text-sm">
                  {selectedClass === starClass && starDescription
                    ? starDescription
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedClass === starClass && starTemperature
                    ? starTemperature
                    : ""}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        <Button
          variant="secondary"
          className="h-20 text-base font-semibold"
          onClick={onRandomGenerate}
        >
          <Shuffle className="h-5 w-5 mr-1" />
          Random
        </Button>
      </div>
      {/* Selected class info */}
      {selectedClass && STAR_CLASS_INFO[selectedClass] && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-muted/50 rounded-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold">{STAR_CLASS_INFO[selectedClass].color}</span>
              </div>
              <Badge variant="outline">
                {STAR_CLASS_INFO[selectedClass].temperature}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {STAR_CLASS_INFO[selectedClass].description}
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">CHARACTERISTICS</span>
                <p className="text-muted-foreground">{STAR_CLASS_INFO[selectedClass].characteristics}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">EXAMPLES</span>
                <p className="text-muted-foreground">{STAR_CLASS_INFO[selectedClass].examples}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { STAR_CLASSES };
export type { StarClass };
