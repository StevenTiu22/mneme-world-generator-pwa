import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, ThermometerSun, Droplets, Snowflake, Wind } from 'lucide-react';
import type { StellarZones } from '@/models/stellar/types/interface';
import { formatDistance } from '@/lib/stellar/zoneCalculations';

interface StellarZonesDisplayProps {
  zones: StellarZones | null;
  companionDistance?: number;
  className?: string;
}

interface ZoneInfo {
  name: string;
  range: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

export function StellarZonesDisplay({
  zones,
  companionDistance,
  className = '',
}: StellarZonesDisplayProps) {
  const zoneInfo: ZoneInfo[] = useMemo(() => {
    if (!zones) return [];

    return [
      {
        name: 'Infernal',
        range: `${formatDistance(zones.infernal.innerBoundary)} - ${formatDistance(zones.infernal.outerBoundary)} AU`,
        icon: <Flame className="h-4 w-4" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
        description: 'Molten surface, extreme heat',
      },
      {
        name: 'Hot',
        range: `${formatDistance(zones.hot.innerBoundary)} - ${formatDistance(zones.hot.outerBoundary)} AU`,
        icon: <ThermometerSun className="h-4 w-4" />,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
        description: 'Hot desert worlds',
      },
      {
        name: 'Habitable',
        range: `${formatDistance(zones.conservativeHabitable.innerBoundary)} - ${formatDistance(zones.conservativeHabitable.outerBoundary)} AU`,
        icon: <Droplets className="h-4 w-4" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
        description: 'Liquid water possible',
      },
      {
        name: 'Cold',
        range: `${formatDistance(zones.cold.innerBoundary)} - ${formatDistance(zones.cold.outerBoundary)} AU`,
        icon: <Snowflake className="h-4 w-4" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
        description: 'Frozen surface',
      },
      {
        name: 'Outer',
        range: `${formatDistance(zones.outer.innerBoundary)} - ${formatDistance(zones.outer.outerBoundary)} AU`,
        icon: <Wind className="h-4 w-4" />,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
        description: 'Gas giants, ice worlds',
      },
    ];
  }, [zones]);

  const getZoneForDistance = (distance: number): number | null => {
    if (!zones) return null;

    if (distance >= zones.infernal.innerBoundary && distance < zones.infernal.outerBoundary) return 0;
    if (distance >= zones.hot.innerBoundary && distance < zones.hot.outerBoundary) return 1;
    if (distance >= zones.conservativeHabitable.innerBoundary && distance <= zones.conservativeHabitable.outerBoundary) return 2;
    if (distance >= zones.cold.innerBoundary && distance < zones.cold.outerBoundary) return 3;
    if (distance >= zones.outer.innerBoundary && distance <= zones.outer.outerBoundary) return 4;
    return null;
  };

  const companionZoneIndex = companionDistance !== undefined ? getZoneForDistance(companionDistance) : null;

  if (!zones) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No zone data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Stellar Zones</CardTitle>
        <p className="text-sm text-muted-foreground">
          Orbital zones based on stellar luminosity
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {zoneInfo.map((zone, index) => (
          <div
            key={zone.name}
            className={`p-3 rounded-lg border transition-all ${zone.bgColor} ${
              companionZoneIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={zone.color}>{zone.icon}</span>
                <span className="font-semibold text-sm">{zone.name} Zone</span>
                {companionZoneIndex === index && (
                  <Badge variant="default" className="text-xs h-5">
                    Companion
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {zone.range}
              </span>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {zone.description}
            </p>
          </div>
        ))}

        <div className="pt-2 mt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Frostline</span>
            <span className="font-mono">{formatDistance(zones.frostline)} AU</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
