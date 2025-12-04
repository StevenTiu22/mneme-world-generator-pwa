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
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generateMoon, generateNamedMoon } from '@/lib/generators/moonGenerator';
import { saveMoon, getMoonsByWorld, deleteMoon } from '@/lib/db/queries/moonQueries';
import { MoonType, getMoonTypeLabel, type MoonData } from '@/models/world/moon';

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

export function CreateMoons() {
  const context = useOutletContext<LayoutContext>();

  // Load world data from localStorage
  const worldData = JSON.parse(localStorage.getItem('mainWorld') || '{}');
  const worldContext = JSON.parse(localStorage.getItem('worldContext') || '{}');
  const worldId = worldData.worldId;
  const worldName = worldData.name || 'Primary World';
  const starSystemId = worldContext.starSystemId;

  // State management
  const [moonName, setMoonName] = useState('');
  const [generationMode, setGenerationMode] = useState<'procedural' | 'custom'>('procedural');
  const [generatedMoon, setGeneratedMoon] = useState<MoonData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMoon, setEditingMoon] = useState<MoonData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load moons from database using useLiveQuery
  const moons =
    useLiveQuery(() => (worldId ? getMoonsByWorld(worldId) : Promise.resolve([])), [worldId]) || [];

  const moonCount = moons.length;

  // Enable Next button if moons exist OR user has skipped
  useEffect(() => {
    context.setNextDisabled(moonCount === 0 && !hasSkipped);
  }, [moonCount, hasSkipped, context]);

  // Handle Next button
  const handleNext = useCallback(() => {
    // Save moons data to localStorage for persistence
    localStorage.setItem('moons', JSON.stringify(moons));
    // Navigate to next page (secondary planets)
    // Note: actual route will be set up in routing configuration
  }, [moons]);

  useEffect(() => {
    context.setNextHandler(() => handleNext);
  }, [handleNext, context]);

  // Generate a random moon
  const handleGenerateMoon = () => {
    if (!worldId || !starSystemId) {
      setError('World ID or Star System ID not found. Please go back and complete previous steps.');
      return;
    }

    try {
      setError(null);
      const nextOrbitPosition = moonCount + 1;

      const moon = generateMoon({
        worldId,
        starSystemId,
        orbitPosition: nextOrbitPosition,
        moonName: moonName.trim() || generateNamedMoon(worldName, nextOrbitPosition, MoonType.MAJOR),
        advantage: 0,
        disadvantage: 0,
      });

      setGeneratedMoon(moon);
    } catch (err) {
      console.error('Error generating moon:', err);
      setError('Failed to generate moon. Please try again.');
    }
  };

  // Add generated moon to database
  const handleAddMoon = async () => {
    if (!generatedMoon) return;

    try {
      setError(null);
      await saveMoon(generatedMoon);
      setGeneratedMoon(null);
      setMoonName('');
    } catch (err) {
      console.error('Error saving moon:', err);
      setError('Failed to save moon. Please try again.');
    }
  };

  // Skip adding moons
  const handleSkip = () => {
    setHasSkipped(true);
  };

  // Open edit dialog
  const handleEditMoon = (moon: MoonData) => {
    setEditingMoon({ ...moon });
    setIsEditDialogOpen(true);
  };

  // Save edited moon
  const handleSaveEdit = async () => {
    if (!editingMoon) return;

    try {
      setError(null);
      await saveMoon(editingMoon);
      setIsEditDialogOpen(false);
      setEditingMoon(null);
    } catch (err) {
      console.error('Error updating moon:', err);
      setError('Failed to update moon. Please try again.');
    }
  };

  // Delete moon
  const handleDeleteMoon = async (id: string) => {
    try {
      setError(null);
      await deleteMoon(id);
      setDeleteConfirmId(null);
      setHasSkipped(false); // Reset skip state if user starts adding moons again
    } catch (err) {
      console.error('Error deleting moon:', err);
      setError('Failed to delete moon. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Moons</h1>
        <p className="text-muted-foreground mt-2">
          Add natural satellites to your world (optional)
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* World Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current World</p>
              <p className="text-lg font-semibold">{worldName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Moons</p>
              <p className="text-2xl font-bold">{moonCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Moon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            Generate Moon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Moon Name Input */}
          <div className="space-y-2">
            <Label htmlFor="moonName">Moon Name</Label>
            <Input
              id="moonName"
              placeholder={`e.g., ${worldName} I, ${worldName} II`}
              value={moonName}
              onChange={(e) => setMoonName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for automatic naming (Moon I, Moon II, etc.)
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
            <Button onClick={handleGenerateMoon} className="w-full">
              <Dices className="h-4 w-4 mr-2" />
              Generate Random Moon
            </Button>
          )}

          {/* Generated Moon Results */}
          {generatedMoon && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Generated Moon Properties</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{generatedMoon.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="secondary">{getMoonTypeLabel(generatedMoon.moonType)}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{generatedMoon.size.toFixed(2)} LM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mass</p>
                  <p className="font-medium">{generatedMoon.mass.toFixed(2)} LM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gravity</p>
                  <p className="font-medium">{generatedMoon.gravity.toFixed(3)} G</p>
                </div>
                {generatedMoon.diceRolls && (
                  <div>
                    <p className="text-muted-foreground">Dice Rolls</p>
                    <p className="font-medium text-xs">
                      Type: {generatedMoon.diceRolls.typeRoll}, Size:{' '}
                      {generatedMoon.diceRolls.sizeRoll}
                    </p>
                  </div>
                )}
              </div>
              <Button onClick={handleAddMoon} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add This Moon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moon List */}
      <Card>
        <CardHeader>
          <CardTitle>Moons ({moonCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {moonCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No moons added yet</p>
              <p className="text-sm mt-2">Generate a moon or skip this step</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moons.map((moon, index) => (
                <div
                  key={moon.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{moon.name}</p>
                      <Badge variant="outline">{getMoonTypeLabel(moon.moonType)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {moon.size.toFixed(2)} LM • {moon.mass.toFixed(2)} LM • {moon.gravity.toFixed(3)} G
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moon.id && handleEditMoon(moon)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit moon</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moon.id && setDeleteConfirmId(moon.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete moon</TooltipContent>
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
      {moonCount === 0 && !hasSkipped && (
        <Button variant="outline" onClick={handleSkip} className="w-full">
          Skip - No Moons
        </Button>
      )}

      {hasSkipped && moonCount === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You've chosen to skip adding moons. Click Next to continue, or generate a moon above to
            add satellites.
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Moon</DialogTitle>
            <DialogDescription>Update moon properties</DialogDescription>
          </DialogHeader>
          {editingMoon && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingMoon.name}
                  onChange={(e) => setEditingMoon({ ...editingMoon, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Size (LM)</Label>
                  <Input
                    id="edit-size"
                    type="number"
                    step="0.01"
                    value={editingMoon.size}
                    onChange={(e) =>
                      setEditingMoon({ ...editingMoon, size: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gravity">Gravity (G)</Label>
                  <Input
                    id="edit-gravity"
                    type="number"
                    step="0.001"
                    value={editingMoon.gravity}
                    onChange={(e) =>
                      setEditingMoon({ ...editingMoon, gravity: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
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
            <DialogTitle>Delete Moon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this moon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteMoon(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
