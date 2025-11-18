import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Star,
  Globe,
  Link2,
  Wrench,
  Pencil,
  Upload,
  FileJson,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import type { StarData, StarSystem } from "@/models/stellar/types/interface";
import {
  STELLAR_MASS,
  STELLAR_LUMINOSITY,
} from "@/models/stellar/data/constants";
import type { StellarClass, StellarGrade } from "@/models/stellar/types/enums";
import { GenerationMethod } from "@/models/common/types";
import {
  downloadStarSystemAsJSON,
  downloadStarSystemAsCSV,
} from "@/lib/export/starExport";
import { importStarSystemFromFile } from "@/lib/import/starImport";
import { getAllStarSystems, generateSystemId, deleteStarSystem } from "@/lib/db/queries/starQueries";

interface SavedWorld {
  id: string;
  name: string;
  primaryStar: {
    name: string;
    class: string;
    luminosity: string;
    mass: string;
  };
  companionStars: Array<{
    name: string;
    class: string;
    luminosity: string;
    mass: string;
  }>;
  mainWorld: {
    type: string;
    size: string;
  };
  systemType: string;
  techLevel: string;
  habitability: string;
  position: string;
  createdAt: string;
  lastModified: string;
}

type SortOption = "oldest" | "newest" | "name-asc" | "name-desc";

export function MyWorlds() {
  const navigate = useNavigate();
  const [selectedWorld, setSelectedWorld] = useState<SavedWorld | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("oldest");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load star systems from IndexedDB with reactive updates
  const starSystems = useLiveQuery(() => getAllStarSystems());

  // Convert StarSystem[] to SavedWorld[] for display
  const worlds: SavedWorld[] = (starSystems ?? []).map((system) => {
    const stellarClass = system.primaryStar.stellarClass;
    const stellarGrade = system.primaryStar.stellarGrade;

    // Get actual stellar properties from lookup tables
    const mass = STELLAR_MASS[stellarClass][stellarGrade];
    const luminosity = STELLAR_LUMINOSITY[stellarClass][stellarGrade];

    return {
      id: system.id,
      name: system.name,
      primaryStar: {
        name: system.primaryStar.name,
        class: `${stellarClass}${stellarGrade}`,
        luminosity: `${luminosity.toFixed(2)} L☉`,
        mass: `${mass.toFixed(2)} M☉`,
      },
      companionStars: system.companionStars.map((companion) => {
        const compClass = companion.stellarClass;
        const compGrade = companion.stellarGrade;
        const compMass = STELLAR_MASS[compClass][compGrade];
        const compLuminosity = STELLAR_LUMINOSITY[compClass][compGrade];

        return {
          name: companion.name,
          class: `${compClass}${compGrade}`,
          luminosity: `${compLuminosity.toFixed(2)} L☉`,
          mass: `${compMass.toFixed(2)} M☉`,
        };
      }),
      mainWorld: {
        type: "Habitat", // Placeholder - extend when world data is added
        size: "1.0 EM",  // Placeholder
      },
      systemType:
        system.companionStars.length > 0
          ? `${system.companionStars.length + 1}-Star System`
          : "Single Star",
      techLevel: "Space Age", // Placeholder - extend when tech level is added
      habitability: "Not set",  // Placeholder - extend when habitability is added
      position: "1.0 AU",       // Placeholder - extend when position is added
      createdAt: new Date(system.createdAt).toLocaleString(),
      lastModified: new Date(system.updatedAt).toLocaleString(),
    };
  });

  const sortWorlds = (worldsList: SavedWorld[]) => {
    const sorted = [...worldsList];
    switch (sortBy) {
      case "newest":
        return sorted; // Already newest first from DB
      case "oldest":
        return sorted.reverse(); // Reverse to get oldest first
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted; // Default to newest first
    }
  };

  // Get the StarSystem for the selected world from the database
  const getSelectedStarSystem = (): StarSystem | null => {
    if (!selectedWorld || !starSystems) return null;
    return starSystems.find(sys => sys.id === selectedWorld.id) ?? null;
  };

  const handleExportJSON = () => {
    const system = getSelectedStarSystem();
    if (system) {
      downloadStarSystemAsJSON(system);
    } else {
      setImportError("No star system selected to export");
    }
  };

  const handleExportCSV = () => {
    const system = getSelectedStarSystem();
    if (system) {
      downloadStarSystemAsCSV(system);
    } else {
      setImportError("No star system selected to export");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const result = await importStarSystemFromFile(file);

      if (result.success && result.data) {
        // Save imported system to IndexedDB
        const { saveStarSystem } = await import("@/lib/db/queries/starQueries");
        await saveStarSystem(result.data);

        if (result.warnings.length > 0) {
          console.warn("Import warnings:", result.warnings);
        }

        // No need to reload - useLiveQuery will automatically update
        alert(
          `Successfully imported star system: ${result.data.name}\n${
            result.warnings.length > 0
              ? `\nWarnings:\n${result.warnings.join("\n")}`
              : ""
          }`
        );
      } else {
        setImportError(
          `Import failed:\n${result.errors.join("\n")}${
            result.warnings.length > 0
              ? `\n\nWarnings:\n${result.warnings.join("\n")}`
              : ""
          }`
        );
      }
    } catch (error) {
      console.error("Failed to import star system:", error);
      setImportError("Failed to import star system. Please check the file format.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveName = async () => {
    if (selectedWorld && editedName.trim()) {
      try {
        // Update the system name in the database
        const { updateStarSystem } = await import("@/lib/db/queries/starQueries");
        await updateStarSystem(selectedWorld.id, { name: editedName.trim() });

        // Update local state
        setSelectedWorld({ ...selectedWorld, name: editedName.trim() });
        setIsEditingName(false);

        // No need to manually update worlds - useLiveQuery will handle it
      } catch (error) {
        console.error("Failed to update system name:", error);
        alert("Failed to update system name. Please try again.");
      }
    }
  };

  const handleDeleteWorld = async () => {
    if (!selectedWorld) return;

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedWorld.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Delete from database
      await deleteStarSystem(selectedWorld.id);
      console.log(`🗑️ Deleted star system: ${selectedWorld.name}`);

      // Close the sheet
      setSelectedWorld(null);

      // No need to manually update worlds - useLiveQuery will handle it
    } catch (error) {
      console.error("Failed to delete star system:", error);
      alert("Failed to delete star system. Please try again.");
    }
  };

  const sortedWorlds = sortWorlds(worlds);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Hidden file input for imports */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json,.csv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">My Saved Worlds</h1>
        <div className="flex items-center gap-3">
          <Button onClick={handleImportClick} variant="outline" size="lg">
            <Upload className="h-5 w-5 mr-2" />
            Import
          </Button>
          <Button onClick={() => navigate("/create-new")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add New World
          </Button>
        </div>
      </div>

      {/* Import Error Display */}
      {importError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive whitespace-pre-line">
            {importError}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setImportError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Sort Controls */}
      <div className="mb-6">
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Worlds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedWorlds.map((world) => (
          <Card
            key={world.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
            onClick={() => setSelectedWorld(world)}
          >
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">{world.name}</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{world.primaryStar.name}</span>
                </div>

                {world.companionStars.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                    <Star className="h-3 w-3" />
                    <span>
                      + {world.companionStars.length} companion{world.companionStars.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{world.mainWorld.type}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span>{world.systemType}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <span>{world.techLevel}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-1">
                <p>Last modified: {world.lastModified}</p>
                <p>Created at: {world.createdAt}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New World Card */}
        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 border-dashed"
          onClick={() => navigate("/create-new")}
        >
          <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Create New World</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* World Detail Sheet (Slide-out) */}
      <Sheet open={!!selectedWorld} onOpenChange={() => setSelectedWorld(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl lg:max-w-4xl overflow-y-auto p-0 [&>button]:left-4 [&>button]:right-auto"
        >
          {selectedWorld && (
            <div className="p-6 pt-12">
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-3">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") {
                            setIsEditingName(false);
                            setEditedName(selectedWorld.name);
                          }
                        }}
                        className="text-2xl font-bold h-auto"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveName}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <SheetTitle className="text-3xl">
                        {selectedWorld.name}
                      </SheetTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsEditingName(true);
                          setEditedName(selectedWorld.name);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <span>Created at: {selectedWorld.createdAt}</span>
                  <span>Last modified: {selectedWorld.lastModified}</span>
                </div>
              </SheetHeader>

              {/* Star Information Card */}
              <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-none">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6">
                      {/* Star Visualization */}
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-200 to-blue-400 shadow-2xl shadow-blue-500/50" />
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          {selectedWorld.primaryStar.name}
                        </h3>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                      {selectedWorld.primaryStar.class}
                    </Badge>
                  </div>

                  <Badge variant="secondary" className="mb-4">
                    No modifiers
                  </Badge>

                  <div className="grid grid-cols-2 gap-6 text-white">
                    <div>
                      <h4 className="text-sm text-white/60 mb-2">Luminosity</h4>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-3/4" />
                      </div>
                      <p className="text-sm mt-1">
                        {selectedWorld.primaryStar.luminosity}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm text-white/60 mb-2">Solar Mass</h4>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-2/3" />
                      </div>
                      <p className="text-sm mt-1">
                        {selectedWorld.primaryStar.mass}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm text-white/60 mb-2">Tech Level</h4>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 w-1/2" />
                      </div>
                      <p className="text-sm mt-1">{selectedWorld.techLevel}</p>
                    </div>

                    <div>
                      <h4 className="text-sm text-white/60 mb-2">Size</h4>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 w-4/5" />
                      </div>
                      <p className="text-sm mt-1">
                        {selectedWorld.mainWorld.size}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm text-white/60 mb-2">
                        Habitability
                      </h4>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 w-3/5" />
                      </div>
                      <p className="text-sm mt-1">
                        {selectedWorld.habitability}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm text-white/60 mb-2">
                        Main Position
                      </h4>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 w-1/2" />
                      </div>
                      <p className="text-sm mt-1">{selectedWorld.position}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Companion Stars Section */}
              {selectedWorld.companionStars.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Companion Stars</h3>
                  <div className="space-y-4">
                    {selectedWorld.companionStars.map((companion, idx) => (
                      <Card
                        key={idx}
                        className="overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold text-white">
                              {companion.name}
                            </h4>
                            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                              {companion.class}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm text-white/60 mb-2">
                                Luminosity
                              </h5>
                              <p className="text-sm text-white">
                                {companion.luminosity}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-sm text-white/60 mb-2">Mass</h5>
                              <p className="text-sm text-white">{companion.mass}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-3 mt-6">
                {/* Delete Button */}
                <Button
                  onClick={handleDeleteWorld}
                  variant="destructive"
                  size="lg"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </Button>

                {/* Export Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleExportJSON} variant="default" size="lg">
                    <FileJson className="h-5 w-5 mr-2" />
                    Export JSON
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" size="lg">
                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
