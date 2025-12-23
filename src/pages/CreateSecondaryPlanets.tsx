import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Dices,
  Trash2,
  Pencil,
  AlertCircle,
  Info,
  PlusCircle,
  Globe,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generatePlanet } from '@/lib/generators/planetGenerator';
import {
  savePlanet,
  getPlanetsByStarSystem,
  deletePlanet,
  getAvailableOrbits,
} from '@/lib/db/queries/planetQueries';
import {
  getPlanetTypeLabel,
  isPlanetBelt,
  isPlanetGiant,
  type PlanetData,
} from '@/models/world/planet';
import type { CenteredLayoutContext } from '@/components/layout/centered-layout';

export function CreateSecondaryPlanets() {
  const context = useOutletContext<CenteredLayoutContext>();
  const navigate = useNavigate();

  // Load data from localStorage
  const worldData = JSON.parse(localStorage.getItem('mainWorld') || '{}');
  const worldContext = JSON.parse(localStorage.getItem('worldContext') || '{}');
  const starSystemId = worldContext.starSystemId;
  const worldName = worldData.name || 'Primary World';
  const primaryWorldOrbit = worldData.orbitPosition || 3; // Default to orbit 3

  // State management
  const [planetName, setPlanetName] = useState('');
  const [selectedOrbit, setSelectedOrbit] = useState<number | null>(null);
  const [generationMode, setGenerationMode] = useState<'procedural' | 'custom'>('procedural');
  const [generatedPlanet, setGeneratedPlanet] = useState<PlanetData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlanet, setEditingPlanet] = useState<PlanetData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load planets from database using useLiveQuery
  const planetsQuery =
    useLiveQuery(
      () => (starSystemId ? getPlanetsByStarSystem(starSystemId) : Promise.resolve([])),
      [starSystemId]
    ) || [];

  // Memoize planets to prevent recreating handleNext on every query update
  const planets = useMemo(() => planetsQuery, [JSON.stringify(planetsQuery.map(p => p.id))]);

  // Store planets ref for handleNext to avoid dependency recreation
  const planetsRef = useRef(planets);
  planetsRef.current = planets;

  // Load available orbits (excluding primary world)
  const availableOrbitsQuery = useLiveQuery(
    () => (starSystemId ? getAvailableOrbits(starSystemId, 10, [primaryWorldOrbit]) : Promise.resolve([])),
    [starSystemId, primaryWorldOrbit]
  );

  const availableOrbits = availableOrbitsQuery || [];
  const planetCount = planets.length;

  // Helper function to select intelligent orbit
  const getSmartOrbitSelection = (available: number[], primaryOrbit: number): number => {
    // Prefer orbit adjacent to primary (outer orbit first)
    const outerAdjacent = primaryOrbit + 1;
    const innerAdjacent = primaryOrbit - 1;

    if (available.includes(outerAdjacent)) return outerAdjacent;
    if (available.includes(innerAdjacent)) return innerAdjacent;

    // Otherwise, return first available
    return available[0];
  };

  // Helper function to generate planet name from orbit
  const generateDefaultName = (orbit: number): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const numeral = romanNumerals[orbit - 1] || String(orbit);
    return `Secondary Planet ${numeral}`;
  };

  // Auto-select first available orbit when available orbits change
  useEffect(() => {
    if (availableOrbits.length > 0 && selectedOrbit === null) {
      // Auto-select intelligent orbit
      const smartOrbit = getSmartOrbitSelection(availableOrbits, primaryWorldOrbit);
      setSelectedOrbit(smartOrbit);

      // Generate default planet name if empty
      if (planetName === '') {
        setPlanetName(generateDefaultName(smartOrbit));
      }
    }
    // If previously selected orbit becomes unavailable, clear it
    if (selectedOrbit !== null && !availableOrbits.includes(selectedOrbit)) {
      setSelectedOrbit(null);
    }
  }, [availableOrbits, selectedOrbit, primaryWorldOrbit]);

  // Update suggested name when orbit changes (if user hasn't customized the name)
  useEffect(() => {
    if (selectedOrbit !== null && planetName.trim() !== '') {
      // Check if current name matches the default pattern
      const currentDefaultName = generateDefaultName(selectedOrbit);
      const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      const isDefaultPattern = romanNumerals.some(numeral =>
        planetName === `Secondary Planet ${numeral}`
      );

      // Update name ONLY if it matches default pattern AND is different
      // Add additional check to prevent unnecessary updates
      if (isDefaultPattern && planetName !== currentDefaultName && currentDefaultName.trim() !== '') {
        setPlanetName(currentDefaultName);
      }
    }
  }, [selectedOrbit]);

  // Handle Next button
  const handleNext = useCallback(() => {
    // Use ref to get current planets to avoid recreating this callback on every planets change
    const currentPlanets = planetsRef.current;
    
    // Collect all planetary system data for comprehensive export
    try {
      const primaryStarData = JSON.parse(localStorage.getItem('primaryStar') || '{}');
      const companionStarsData = JSON.parse(localStorage.getItem('companionStars') || '{}');
      const mainWorldData = JSON.parse(localStorage.getItem('mainWorld') || '{}');
      const habitabilityData = JSON.parse(localStorage.getItem('habitability') || '{}');
      const positionData = JSON.parse(localStorage.getItem('position') || '{}');
      const inhabitantsData = JSON.parse(localStorage.getItem('inhabitants') || '{}');
      const worldCultureData = JSON.parse(localStorage.getItem('worldCulture') || '{}');
      const starportData = JSON.parse(localStorage.getItem('starport') || '{}');

      // Create comprehensive planetary system export
      const planetarySystemExport = {
        systemId: starSystemId,
        exportDate: new Date().toISOString(),
        version: '1.0',

        // Star system configuration
        starSystem: {
          primary: primaryStarData,
          companions: companionStarsData.companions || [],
          systemType: companionStarsData.systemType || 'single',
        },

        // Primary world details
        primaryWorld: {
          ...mainWorldData,
          habitability: habitabilityData,
          position: positionData,
          inhabitants: inhabitantsData,
          culture: worldCultureData,
          starport: starportData,
        },

        // Secondary planets and objects
        secondaryObjects: {
          planets: currentPlanets.map((planet) => ({
            id: planet.id,
            name: planet.name,
            type: planet.planetType,
            orbitPosition: planet.orbitPosition,
            size: planet.size,
            mass: planet.mass,
            density: planet.density,
            beltWidth: planet.beltWidth,
            generationMethod: planet.generationMethod,
            diceRolls: planet.diceRolls,
            createdAt: planet.createdAt,
          })),
          count: currentPlanets.length,
        },

        // System statistics
        statistics: {
          totalBodies: 1 + currentPlanets.length, // Primary world + secondaries
          totalPlanets: currentPlanets.filter(p => !p.planetType.includes('belt')).length,
          totalBelts: currentPlanets.filter(p => p.planetType.includes('belt')).length,
          hasCompanionStars: (companionStarsData.companions || []).length > 0,
          companionStarCount: (companionStarsData.companions || []).length,
        },
      };

      // Save comprehensive export
      localStorage.setItem('planetarySystemExport', JSON.stringify(planetarySystemExport));

      // Also save just secondary planets for backward compatibility
      localStorage.setItem('secondaryPlanets', JSON.stringify(currentPlanets));

      console.log('📦 Comprehensive planetary system export created:', planetarySystemExport);
    } catch (error) {
      console.error('Failed to create comprehensive export:', error);
      // Fallback to simple export
      localStorage.setItem('secondaryPlanets', JSON.stringify(planetsRef.current));
    }

    // Navigate to planetary system summary
    navigate('../planetary-system');
  }, [navigate, starSystemId]);

  // Configure next button disabled state
  useEffect(() => {
    if (context) {
      const isComplete = planetCount > 0 || hasSkipped;
      context.setNextDisabled(!isComplete);
    }
  }, [planetCount, hasSkipped, context]);

  // Configure next button handler (separate effect to prevent infinite loop)
  useEffect(() => {
    if (context) {
      context.setNextHandler(handleNext);
    }
  }, [handleNext, context]);

  // Generate a random planet
  const handleGeneratePlanet = () => {
    if (!starSystemId) {
      setError('Star System ID not found. Please go back and complete previous steps.');
      return;
    }

    if (selectedOrbit === null) {
      setError('Please select an orbit position.');
      return;
    }

    try {
      setError(null);
      const planet = generatePlanet({
        starSystemId,
        orbitPosition: selectedOrbit,
        planetName: planetName.trim() || undefined,
        advantage: 0,
        disadvantage: 0,
      });

      setGeneratedPlanet(planet);
    } catch (err) {
      console.error('Error generating planet:', err);
      setError('Failed to generate planet. Please try again.');
    }
  };

  // Add generated planet to database
  const handleAddPlanet = async () => {
    if (!generatedPlanet) return;

    try {
      setError(null);
      await savePlanet(generatedPlanet);
      setGeneratedPlanet(null);
      setPlanetName('');
      setSelectedOrbit(null);
    } catch (err) {
      console.error('Error saving planet:', err);
      setError('Failed to save planet. Please try again.');
    }
  };

  // Skip adding planets
  const handleSkip = () => {
    setHasSkipped(true);
  };

  // Open edit dialog
  const handleEditPlanet = (planet: PlanetData) => {
    setEditingPlanet({ ...planet });
    setIsEditDialogOpen(true);
  };

  // Save edited planet
  const handleSaveEdit = async () => {
    if (!editingPlanet) return;

    try {
      setError(null);
      await savePlanet(editingPlanet);
      setIsEditDialogOpen(false);
      setEditingPlanet(null);
    } catch (err) {
      console.error('Error updating planet:', err);
      setError('Failed to update planet. Please try again.');
    }
  };

  // Delete planet
  const handleDeletePlanet = async (id: string) => {
    try {
      setError(null);
      await deletePlanet(id);
      setDeleteConfirmId(null);
      setHasSkipped(false);
    } catch (err) {
      console.error('Error deleting planet:', err);
      setError('Failed to delete planet. Please try again.');
    }
  };

  // Get icon for planet type
  const getPlanetIcon = (planet: PlanetData) => {
    if (isPlanetBelt(planet.planetType)) {
      return '⚫'; // Circle for belts
    } else if (isPlanetGiant(planet.planetType)) {
      return planet.planetType === 'gas_giant' ? '🪐' : '🌀';
    }
    return '🌍';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Secondary Planets & Disks</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3">
          Add outer planets, gas giants, and belts (optional)
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="p-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* System Info */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 sm:gap-8 lg:gap-12">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Primary World</p>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">🌍</span>
                <p className="text-base sm:text-xl font-bold">
                  {worldName}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Orbital Position {primaryWorldOrbit}
              </p>
            </div>
            <div className="sm:text-right px-6 py-4 sm:px-10 sm:py-6 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Secondary Planets</p>
              <p className="text-2xl sm:text-4xl font-bold text-primary">{planetCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
        {/* Add Planet Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-primary/5 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Add Planet/Disk
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 lg:space-y-6 p-5 sm:p-6 lg:p-8">
          {/* Orbit Position Selector */}
          <div className="space-y-2">
            <Label htmlFor="orbit">Orbit Position</Label>
            <Select
              value={selectedOrbit?.toString() || ''}
              onValueChange={(value) => setSelectedOrbit(parseInt(value))}
            >
              <SelectTrigger id="orbit">
                <SelectValue placeholder="Select orbit position" />
              </SelectTrigger>
              <SelectContent>
                {availableOrbits.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No available orbits
                  </SelectItem>
                ) : (
                  availableOrbits.map((orbit) => (
                    <SelectItem key={orbit} value={orbit.toString()}>
                      Orbit {orbit} {orbit === primaryWorldOrbit && '(Primary World)'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Available orbits: {availableOrbits.join(', ') || 'None'}
              {availableOrbits.length > 0 && ` (Primary world at orbit ${primaryWorldOrbit})`}
            </p>
          </div>

          {/* Planet Name Input */}
          <div className="space-y-2">
            <Label htmlFor="planetName">Planet Name</Label>
            <Input
              id="planetName"
              placeholder="e.g., Jupiter, Gas Giant I"
              value={planetName}
              onChange={(e) => setPlanetName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for automatic naming based on type
            </p>
          </div>

          {/* Generation Mode */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Generation Mode</Label>
            <RadioGroup
              value={generationMode}
              onValueChange={(value) => setGenerationMode(value as 'procedural' | 'custom')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-2 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none">
                <RadioGroupItem value="procedural" id="procedural" />
                <Label htmlFor="procedural" className="text-sm sm:text-base font-normal cursor-pointer">
                  Procedural (2D6 generation)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-sm sm:text-base font-normal cursor-pointer">
                  Custom (manual entry)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Generate Button */}
          {generationMode === 'procedural' && (
            <Button onClick={handleGeneratePlanet} className="w-full text-sm sm:text-base" disabled={!selectedOrbit}>
              <Dices className="h-4 w-4 mr-2" />
              Generate Random Planet
            </Button>
          )}

          {/* Generated Planet Results */}
          {generatedPlanet && (
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5 border-t pt-4 sm:pt-6 bg-gradient-to-br from-primary/5 to-transparent p-5 sm:p-6 rounded-lg">
              <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                <Dices className="h-4 w-4 text-primary" />
                Generated Planet Properties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{generatedPlanet.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="secondary">{getPlanetTypeLabel(generatedPlanet.planetType)}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Orbit</p>
                  <p className="font-medium">Position {generatedPlanet.orbitPosition}</p>
                </div>
                {isPlanetGiant(generatedPlanet.planetType) && generatedPlanet.size && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{generatedPlanet.size.toFixed(2)} JM</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mass</p>
                      <p className="font-medium">{generatedPlanet.mass?.toFixed(2)} JM</p>
                    </div>
                  </>
                )}
                {isPlanetBelt(generatedPlanet.planetType) && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Density</p>
                      <Badge variant="outline">{generatedPlanet.density}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Width</p>
                      <p className="font-medium">{generatedPlanet.beltWidth} AU</p>
                    </div>
                  </>
                )}
                {generatedPlanet.diceRolls && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Dice Rolls</p>
                    <p className="font-medium text-xs">
                      Type: {generatedPlanet.diceRolls.typeRoll}
                      {generatedPlanet.diceRolls.sizeRoll && `, Size: ${generatedPlanet.diceRolls.sizeRoll}`}
                      {generatedPlanet.diceRolls.densityRoll && `, Density: ${generatedPlanet.diceRolls.densityRoll}`}
                    </p>
                  </div>
                )}
              </div>
              <Button onClick={handleAddPlanet} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add This Planet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Orbital Diagram */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-500/5 to-transparent border-b">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <span className="text-xl">☉</span>
              Orbital Diagram
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 lg:p-8">
            <div className="space-y-3 font-mono text-xs sm:text-sm overflow-x-auto">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <span className="text-2xl sm:text-3xl">☉</span>
                <div>
                  <span className="font-semibold text-sm sm:text-base block">Primary Star</span>
                  <span className="text-xs text-muted-foreground">System Center</span>
                </div>
              </div>
            <div className="ml-4 sm:ml-8 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((orbit) => {
                const planet = planets.find((p) => p.orbitPosition === orbit);
                const isPrimaryWorld = orbit === primaryWorldOrbit;

                return (
                  <div key={orbit} className={`flex items-center gap-2 py-1 px-2 rounded transition-colors ${
                    isPrimaryWorld ? 'bg-primary/10 font-semibold' :
                    planet ? 'bg-accent/30 hover:bg-accent/50' :
                    'hover:bg-muted/50'
                  }`}>
                    <span className="text-muted-foreground w-20">├─ Orbit {orbit}:</span>
                    {isPrimaryWorld ? (
                      <span className="flex items-center gap-1.5 font-semibold text-primary">
                        🌍 {worldName}
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      </span>
                    ) : planet ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{getPlanetIcon(planet)}</span>
                        <span className="font-medium">{planet.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getPlanetTypeLabel(planet.planetType)}
                        </Badge>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 italic text-xs">(empty orbit)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Planet List */}
      <Card className="border-primary/10">
        <CardHeader className="p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-green-500/5 to-transparent border-b">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            Secondary Planets ({planetCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 lg:p-8">
          {planetCount === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="text-sm sm:text-base">No secondary planets added yet</p>
              <p className="text-xs sm:text-sm mt-3">Generate planets or skip this step</p>
            </div>
          ) : (
            <TooltipProvider>
              <div className="space-y-3 sm:space-y-4">
                {planets.map((planet) => (
                  <div
                    key={planet.id}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 border rounded-lg hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg sm:text-xl">{getPlanetIcon(planet)}</span>
                        <p className="text-sm sm:text-base font-semibold">{planet.name}</p>
                        <Badge variant="outline" className="text-xs">{getPlanetTypeLabel(planet.planetType)}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Orbit {planet.orbitPosition}
                        {isPlanetGiant(planet.planetType) && planet.size && ` • ${planet.size.toFixed(2)} JM`}
                        {isPlanetBelt(planet.planetType) && planet.density && ` • ${planet.density} density`}
                      </p>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => planet.id && handleEditPlanet(planet)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Edit planet</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => planet.id && setDeleteConfirmId(planet.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Delete planet</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Skip Button */}
      {planetCount === 0 && !hasSkipped && (
        <Button variant="outline" onClick={handleSkip} className="w-full text-sm sm:text-base">
          Skip - No Other Planets
        </Button>
      )}

      {hasSkipped && planetCount === 0 && (
        <Alert className="p-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            You've chosen to skip adding secondary planets. Click Next to continue to the system
            summary.
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Planet</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Update planet properties</DialogDescription>
          </DialogHeader>
          {editingPlanet && (
            <div className="space-y-3 sm:space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingPlanet.name}
                  onChange={(e) => setEditingPlanet({ ...editingPlanet, name: e.target.value })}
                />
              </div>
              {isPlanetGiant(editingPlanet.planetType) && (
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Size (Jupiter masses)</Label>
                  <Input
                    id="edit-size"
                    type="number"
                    step="0.01"
                    value={editingPlanet.size || 0}
                    onChange={(e) =>
                      setEditingPlanet({ ...editingPlanet, size: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Delete Planet</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete this planet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeletePlanet(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
