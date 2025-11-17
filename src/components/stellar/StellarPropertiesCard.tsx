import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface StellarPropertiesCardProps {
  color: string;
  mass: number;
  luminosity: number;
  temperature: string;
}

export function StellarPropertiesCard({
  color,
  mass,
  luminosity,
  temperature,
}: StellarPropertiesCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    } else {
      return num.toFixed(2);
    }
  };

  return (
    <div>
      <Label className="text-base mb-4 block">Stellar Properties</Label>
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-sm text-muted-foreground">Color</span>
            <span className="font-semibold">{color}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-sm text-muted-foreground">Mass</span>
            <span className="font-semibold">
              {mass.toFixed(2)} <span className="text-sm font-normal">M☉</span>
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-sm text-muted-foreground">Luminosity</span>
            <span className="font-semibold">
              {formatNumber(luminosity)}{" "}
              <span className="text-sm font-normal">L☉</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Temperature</span>
            <span className="font-semibold text-sm">{temperature}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
