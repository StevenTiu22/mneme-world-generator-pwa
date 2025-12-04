import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
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

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

export function CreateSecondaryPlanets() {
  const context = useOutletContext<LayoutContext>();

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
  const planets =
    useLiveQuery(
      () => (starSystemId ? getPlanetsByStarSystem(starSystemId) : Promise.resolve([])),
      [starSystemId]
    ) || [];

  // Load available orbits
  const availableOrbitsQuery = useLiveQuery(
    () => (starSystemId ? getAvailableOrbits(starSystemId, 10) : Promise.resolve([])),
    [starSystemId, planets.length]
  );

  const availableOrbits = availableOrbitsQuery || [];
  const planetCount = planets.length;

  // Enable Next button if planets exist OR user has skipped
  useEffect(() => {
    context.setNextDisabled(planetCount === 0 && !hasSkipped);
  }, [planetCount, hasSkipped, context]);

  // Handle Next button
  const handleNext = useCallback(() => {
    localStorage.setItem('secondaryPlanets', JSON.stringify(planets));
    // Navigate to planetary system summary
  }, [planets]);

  useEffect(() => {
    context.setNextHandler(() => handleNext);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Secondary Planets & Disks</h1>
        <p className="text-muted-foreground mt-2">
          Add outer planets, gas giants, and belts (optional)
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Primary World</p>
                <p className="text-lg font-semibold">
                  {worldName} (Orbit {primaryWorldOrbit})
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Secondary Planets</p>
                <p className="text-2xl font-bold">{planetCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Planet Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Add Planet/Disk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label>Generation Mode</Label>
            <RadioGroup
              value={generationMode}
              onValueChange={(value) => setGenerationMode(value as 'procedural' | 'custom')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="procedural" id="procedural" />
                <Label htmlFor="procedural" className="font-normal cursor-pointer">
                  Procedural (2D6 generation)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
                  Custom (manual entry)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Generate Button */}
          {generationMode === 'procedural' && (
            <Button onClick={handleGeneratePlanet} className="w-full" disabled={!selectedOrbit}>
              <Dices className="h-4 w-4 mr-2" />
              Generate Random Planet
            </Button>
          )}

          {/* Generated Planet Results */}
          {generatedPlanet && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Generated Planet Properties</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
      <Card>
        <CardHeader>
          <CardTitle>Orbital Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☉</span>
              <span className="font-semibold">Star</span>
            </div>
            <div className="ml-8 space-y-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((orbit) => {
                const planet = planets.find((p) => p.orbitPosition === orbit);
                const isPrimaryWorld = orbit === primaryWorldOrbit;

                return (
                  <div key={orbit} className="flex items-center gap-2">
                    <span className="text-muted-foreground">├─ Orbit {orbit}:</span>
                    {isPrimaryWorld ? (
                      <span className="flex items-center gap-1 font-semibold">
                        🌍 {worldName}
                      </span>
                    ) : planet ? (
                      <span className="flex items-center gap-1">
                        <span>{getPlanetIcon(planet)}</span>
                        <span>{planet.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getPlanetTypeLabel(planet.planetType)}
                        </Badge>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">(empty)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planet List */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Planets ({planetCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {planetCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No secondary planets added yet</p>
              <p className="text-sm mt-2">Generate planets or skip this step</p>
            </div>
          ) : (
            <div className="space-y-3">
              {planets.map((planet) => (
                <div
                  key={planet.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getPlanetIcon(planet)}</span>
                      <p className="font-semibold">{planet.name}</p>
                      <Badge variant="outline">{getPlanetTypeLabel(planet.planetType)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Orbit {planet.orbitPosition}
                      {isPlanetGiant(planet.planetType) && planet.size && ` • ${planet.size.toFixed(2)} JM`}
                      {isPlanetBelt(planet.planetType) && planet.density && ` • ${planet.density} density`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => planet.id && handleEditPlanet(planet)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit planet</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => planet.id && setDeleteConfirmId(planet.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete planet</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Button */}
      {planetCount === 0 && !hasSkipped && (
        <Button variant="outline" onClick={handleSkip} className="w-full">
          Skip - No Other Planets
        </Button>
      )}

      {hasSkipped && planetCount === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You've chosen to skip adding secondary planets. Click Next to continue to the system
            summary.
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Planet</DialogTitle>
            <DialogDescription>Update planet properties</DialogDescription>
          </DialogHeader>
          {editingPlanet && (
            <div className="space-y-4 py-4">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Planet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this planet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
