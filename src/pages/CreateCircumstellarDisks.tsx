import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TooltipProvider,
} from '@/components/ui/tooltip';
import { AlertCircle, Sparkles, Disc, RefreshCw } from 'lucide-react';
import { generateDisk, validateDiskData } from '@/lib/generators/diskGenerator';
import {
  PlanetType,
  DiskType,
  DiskZone,
  getDiskTypeLabel,
  getDiskZoneLabel,
  type PlanetData,
} from '@/models/world/planet';
import { GenerationMethod } from '@/models/common/types';
import { savePlanet, generatePlanetId } from '@/lib/db/queries/planetQueries';
import type { CenteredLayoutContext } from '@/components/layout/centered-layout';
import type { StellarZones } from '@/models/stellar/types/interface';

export default function CreateCircumstellarDisks() {
  const navigate = useNavigate();
  const context = useOutletContext<CenteredLayoutContext>();

  // State for disk properties
  const [diskId] = useState(() => generatePlanetId());
  const [diskName, setDiskName] = useState('Protoplanetary Disk (Hab-Outer)');
  const [diskType, setDiskType] = useState<DiskType>(DiskType.PROTOPLANETARY);
  const [diskZone, setDiskZone] = useState<DiskZone>(DiskZone.HABITABLE_OUTER);
  const [diskMass, setDiskMass] = useState(1);
  const [diskMassUnit, setDiskMassUnit] = useState<'CM' | 'LM' | 'EM' | 'JM'>('EM');
  const [diskInnerRadius, setDiskInnerRadius] = useState(1);
  const [diskOuterRadius, setDiskOuterRadius] = useState(2);
  const [orbitPosition, setOrbitPosition] = useState(1.5);

  // Dice rolls
  const [massRoll, setMassRoll] = useState<number | null>(null);
  const [zoneRoll, setZoneRoll] = useState<number | null>(null);
  const [typeRoll, setTypeRoll] = useState<number | null>(null);

  // UI state
  const [generationMode, setGenerationMode] = useState<'procedural' | 'manual'>('procedural');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [generatedDisk, setGeneratedDisk] = useState<PlanetData | null>(null);

  // Load star system data for stellar zones
  const [starSystemId, setStarSystemId] = useState<string | null>(null);
  const [stellarZones, setStellarZones] = useState<StellarZones | null>(null);

  // Load star system data from localStorage
  useEffect(() => {
    try {
      // Load world context to get starSystemId
      const worldContextData = localStorage.getItem('worldContext');
      if (worldContextData) {
        const worldContext = JSON.parse(worldContextData);
        setStarSystemId(worldContext.starSystemId);
      }

      // Load primary star to get stellar zones
      const primaryStarData = localStorage.getItem('primaryStar');
      if (primaryStarData) {
        const primaryStar = JSON.parse(primaryStarData);

        // Get stellar zones from primary star
        if (primaryStar.stellarZones) {
          setStellarZones(primaryStar.stellarZones);
        }
      }
    } catch (error) {
      console.error('Failed to load star system data:', error);
    }
  }, []);

  // Generate default name when disk properties change
  useEffect(() => {
    if (generationMode === 'procedural' && generatedDisk) {
      setDiskName(generatedDisk.name);
    } else if (generationMode === 'manual') {
      const typeLabel = diskType === DiskType.ACCRETION ? 'Accretion' : 'Protoplanetary';
      const zoneLabel = getDiskZoneLabel(diskZone)
        .replace(' Zone', '')
        .replace('Habitable ', 'Hab-');
      setDiskName(`${typeLabel} Disk (${zoneLabel})`);
    }
  }, [diskType, diskZone, generationMode, generatedDisk]);

  // Handle full disk generation
  const handleGenerateDisk = useCallback(() => {
    if (!stellarZones || !starSystemId) return;

    const disk = generateDisk({
      starSystemId: starSystemId,
      stellarZones,
    });

    // Update all state from generated disk
    setDiskType(disk.diskType!);
    setDiskZone(disk.diskZone!);
    setDiskMass(disk.diskMass!);
    setDiskMassUnit(disk.diskMassUnit as 'CM' | 'LM' | 'EM' | 'JM');
    setDiskInnerRadius(disk.diskInnerRadius!);
    setDiskOuterRadius(disk.diskOuterRadius!);
    setOrbitPosition(disk.orbitPosition);
    setDiskName(disk.name);

    const rolls = disk.diceRolls;
    setMassRoll(rolls?.massRoll ?? null);
    setZoneRoll(rolls?.zoneRoll ?? null);
    setTypeRoll(rolls?.typeRoll ?? null);

    setGeneratedDisk(disk);
    console.log('🌌 Generated complete disk:', disk);
  }, [stellarZones, starSystemId]);

  // Calculate disk width from zone for manual mode
  const calculateManualDiskWidth = useCallback(
    (zone: DiskZone) => {
      if (!stellarZones) return;

      let inner: number, outer: number;

      switch (zone) {
        case DiskZone.INFERNAL:
          inner = stellarZones.infernal.innerBoundary;
          outer = stellarZones.infernal.outerBoundary;
          break;
        case DiskZone.HOT:
          inner = stellarZones.hot.innerBoundary;
          outer = stellarZones.hot.outerBoundary;
          break;
        case DiskZone.HABITABLE_INNER:
          inner = stellarZones.conservativeHabitable.innerBoundary;
          outer =
            (stellarZones.conservativeHabitable.innerBoundary +
              stellarZones.conservativeHabitable.outerBoundary) /
            2;
          break;
        case DiskZone.HABITABLE_OUTER:
          inner =
            (stellarZones.conservativeHabitable.innerBoundary +
              stellarZones.conservativeHabitable.outerBoundary) /
            2;
          outer = stellarZones.conservativeHabitable.outerBoundary;
          break;
        case DiskZone.COLD:
          inner = stellarZones.cold.innerBoundary;
          outer = stellarZones.cold.outerBoundary;
          break;
        case DiskZone.OUTER:
          inner = stellarZones.outer.innerBoundary;
          outer = stellarZones.outer.outerBoundary;
          break;
        default:
          inner = 1;
          outer = 2;
      }

      const midpoint = (inner + outer) / 2;
      setDiskInnerRadius(parseFloat(inner.toFixed(2)));
      setDiskOuterRadius(parseFloat(outer.toFixed(2)));
      setOrbitPosition(parseFloat(midpoint.toFixed(2)));
    },
    [stellarZones]
  );

  // Initialize disk dimensions in manual mode when stellar zones become available
  useEffect(() => {
    if (generationMode === 'manual' && stellarZones) {
      calculateManualDiskWidth(diskZone);
    }
  }, [stellarZones, calculateManualDiskWidth, diskZone, generationMode]);

  // Validate disk when properties change
  useEffect(() => {
    if (!starSystemId) return;

    const diskData: PlanetData = {
      id: diskId,
      name: diskName,
      starSystemId: starSystemId,
      orbitPosition,
      planetType: PlanetType.CIRCUMSTELLAR_DISK,
      diskType,
      diskZone,
      diskMass,
      diskMassUnit,
      diskInnerRadius,
      diskOuterRadius,
      generationMethod: generationMode === 'procedural' ? GenerationMethod.PROCEDURAL : GenerationMethod.CUSTOM,
      diceRolls: {
        massRoll: massRoll ?? undefined,
        zoneRoll: zoneRoll ?? undefined,
        typeRoll: typeRoll ?? undefined,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
    };

    const validation = validateDiskData(diskData);
    setValidationErrors(validation.errors);
  }, [
    diskId,
    diskName,
    diskType,
    diskZone,
    diskMass,
    diskMassUnit,
    diskInnerRadius,
    diskOuterRadius,
    orbitPosition,
    massRoll,
    zoneRoll,
    typeRoll,
    starSystemId,
    generationMode,
  ]);

  // Handle save and navigation
  const handleNext = useCallback(async () => {
    if (!starSystemId || validationErrors.length > 0) return;

    try {
      const diskData: PlanetData = {
        id: diskId,
        name: diskName,
        starSystemId: starSystemId,
        orbitPosition,
        planetType: PlanetType.CIRCUMSTELLAR_DISK,
        diskType,
        diskZone,
        diskMass,
        diskMassUnit,
        diskInnerRadius,
        diskOuterRadius,
        generationMethod: generationMode === 'procedural' ? GenerationMethod.PROCEDURAL : GenerationMethod.CUSTOM,
        diceRolls: {
          massRoll: massRoll ?? undefined,
          zoneRoll: zoneRoll ?? undefined,
          typeRoll: typeRoll ?? undefined,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user',
      };

      await savePlanet(diskData);
      console.log('💾 Saved disk to database:', diskData);
      navigate('../secondary-planets');
    } catch (error) {
      console.error('Failed to save disk:', error);
      setValidationErrors(['Failed to save disk to database']);
    }
  }, [
    diskId,
    starSystemId,
    diskName,
    diskType,
    diskZone,
    diskMass,
    diskMassUnit,
    diskInnerRadius,
    diskOuterRadius,
    orbitPosition,
    massRoll,
    zoneRoll,
    typeRoll,
    generationMode,
    validationErrors,
    navigate,
  ]);

  // Configure next button disabled state
  useEffect(() => {
    const isDiskComplete =
      diskName.trim() !== '' &&
      diskInnerRadius > 0 &&
      diskOuterRadius > 0 &&
      validationErrors.length === 0;

    if (context) {
      context.setNextDisabled(!isDiskComplete);
    }
  }, [diskName, diskInnerRadius, diskOuterRadius, validationErrors, context]);

  // Configure next button handler (separate effect to prevent infinite loop)
  useEffect(() => {
    if (context) {
      context.setNextHandler(handleNext);
    }
  }, [handleNext, context]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'd' || e.key === 'D') && generationMode === 'procedural') {
        handleGenerateDisk();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleGenerateDisk, generationMode]);

  const isDiskComplete =
    diskName.trim() !== '' &&
    diskInnerRadius > 0 &&
    diskOuterRadius > 0 &&
    validationErrors.length === 0;

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Circumstellar Disks
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Generate disks of gas, dust, and planetoids orbiting the star.{' '}
            <span className="hidden sm:inline">
              Press{' '}
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                D
              </kbd>{' '}
              to generate a disk procedurally.
            </span>
          </p>
        </div>

        {/* Alert if no star system */}
        {!starSystemId && (
          <Alert className="mb-4 sm:mb-6 p-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              No star system found. Please complete the star system setup first.
            </AlertDescription>
          </Alert>
        )}

        {/* Alert if incomplete */}
        {starSystemId && !isDiskComplete && !validationErrors.length && (
          <Alert className="mb-4 sm:mb-6 p-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Generate or configure a circumstellar disk to proceed to the next step.
            </AlertDescription>
          </Alert>
        )}

        {starSystemId && (
          <div className="space-y-4 sm:space-y-6">
            {/* Generation Mode Selection */}
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Generation Mode</Label>
                  <RadioGroup
                    value={generationMode}
                    onValueChange={(value) => {
                      const newMode = value as 'procedural' | 'manual';
                      setGenerationMode(newMode);
                      setGeneratedDisk(null);

                      // Initialize manual mode with default values
                      if (newMode === 'manual' && stellarZones) {
                        calculateManualDiskWidth(diskZone);
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="flex items-center space-x-2 p-3 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none">
                      <RadioGroupItem value="procedural" id="procedural" />
                      <Label htmlFor="procedural" className="cursor-pointer text-sm sm:text-base">
                        Procedural (2D6 Rolls)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="cursor-pointer text-sm sm:text-base">
                        Manual Configuration
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Procedural Generation */}
                {generationMode === 'procedural' && (
                  <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold mb-1 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          Procedural Generation
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Generate a complete disk with all properties using 2D6 dice rolls.
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateDisk}
                        disabled={!stellarZones}
                        className="w-full sm:w-auto sm:ml-4"
                        size="lg"
                      >
                        <Disc className="h-4 w-4 mr-2" />
                        Generate Disk
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Manual Configuration */}
                {generationMode === 'manual' && (
                  <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-1">Manual Configuration</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                          Configure disk properties manually.
                        </p>
                      </div>

                      {/* Disk Type */}
                      <div>
                        <Label className="font-medium mb-2 block">Disk Type</Label>
                        <Select
                          value={diskType}
                          onValueChange={(value) => setDiskType(value as DiskType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DiskType.ACCRETION}>
                              {getDiskTypeLabel(DiskType.ACCRETION)}
                            </SelectItem>
                            <SelectItem value={DiskType.PROTOPLANETARY}>
                              {getDiskTypeLabel(DiskType.PROTOPLANETARY)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {diskType === DiskType.ACCRETION
                            ? 'Material fragmenting and collapsing inward'
                            : 'Material coalescing to form planets'}
                        </p>
                      </div>

                      {/* Disk Zone */}
                      <div>
                        <Label className="font-medium mb-2 block">Orbital Zone</Label>
                        <Select
                          value={diskZone}
                          onValueChange={(value) => {
                            const newZone = value as DiskZone;
                            setDiskZone(newZone);
                            calculateManualDiskWidth(newZone);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DiskZone.INFERNAL}>
                              {getDiskZoneLabel(DiskZone.INFERNAL)}
                            </SelectItem>
                            <SelectItem value={DiskZone.HOT}>
                              {getDiskZoneLabel(DiskZone.HOT)}
                            </SelectItem>
                            <SelectItem value={DiskZone.HABITABLE_INNER}>
                              {getDiskZoneLabel(DiskZone.HABITABLE_INNER)}
                            </SelectItem>
                            <SelectItem value={DiskZone.HABITABLE_OUTER}>
                              {getDiskZoneLabel(DiskZone.HABITABLE_OUTER)}
                            </SelectItem>
                            <SelectItem value={DiskZone.COLD}>
                              {getDiskZoneLabel(DiskZone.COLD)}
                            </SelectItem>
                            <SelectItem value={DiskZone.OUTER}>
                              {getDiskZoneLabel(DiskZone.OUTER)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Disk Mass */}
                      <div>
                        <Label className="font-medium mb-2 block">Disk Mass</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={diskMass}
                            onChange={(e) => setDiskMass(parseFloat(e.target.value))}
                            step="0.01"
                            min="0"
                            className="flex-1"
                          />
                          <Select
                            value={diskMassUnit}
                            onValueChange={(value) =>
                              setDiskMassUnit(value as 'CM' | 'LM' | 'EM' | 'JM')
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CM">CM</SelectItem>
                              <SelectItem value="LM">LM</SelectItem>
                              <SelectItem value="EM">EM</SelectItem>
                              <SelectItem value="JM">JM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          CM = Ceres, LM = Lunar, EM = Earth, JM = Jupiter Mass
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>

            {/* Disk Results */}
            {(generatedDisk || generationMode === 'manual') && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-lg sm:text-xl">Disk Configuration</span>
                    <Badge
                      variant={generationMode === 'procedural' ? 'default' : 'secondary'}
                      className="self-start sm:self-auto"
                    >
                      {generationMode === 'procedural' ? 'Procedural' : 'Manual'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  {/* Disk Name */}
                  <div>
                    <Label className="font-medium mb-2 block text-sm sm:text-base">Disk Name</Label>
                    <Input
                      value={diskName}
                      onChange={(e) => setDiskName(e.target.value)}
                      placeholder="Enter disk name"
                      className="text-sm sm:text-base"
                    />
                  </div>

                  {/* Properties Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Type</Label>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm font-medium">{getDiskTypeLabel(diskType)}</p>
                        {typeRoll && (
                          <Badge variant="outline" className="text-xs">
                            Roll: {typeRoll}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Zone</Label>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm font-medium">{getDiskZoneLabel(diskZone)}</p>
                        {zoneRoll && (
                          <Badge variant="outline" className="text-xs">
                            Roll: {zoneRoll}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Mass</Label>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm font-medium">
                          {diskMass} {diskMassUnit}
                        </p>
                        {massRoll && (
                          <Badge variant="outline" className="text-xs">
                            Roll: {massRoll}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Width</Label>
                      <p className="text-sm font-medium mt-1">
                        {(diskOuterRadius - diskInnerRadius).toFixed(2)} AU
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Inner Radius</Label>
                      <p className="text-sm font-medium mt-1">{diskInnerRadius} AU</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Outer Radius</Label>
                      <p className="text-sm font-medium mt-1">{diskOuterRadius} AU</p>
                    </div>
                  </div>

                  {/* Re-generate button for procedural mode */}
                  {generationMode === 'procedural' && (
                    <Button
                      variant="outline"
                      onClick={handleGenerateDisk}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-generate Disk
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="p-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
