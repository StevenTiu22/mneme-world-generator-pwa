import { useState, useRef } from "react";
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
import type { StarSystem } from "@/models/stellar/types/interface";
import type { WorldData } from "@/models/world/interface";
import {
  STELLAR_MASS,
  STELLAR_LUMINOSITY,
} from "@/models/stellar/data/constants";
import {
  downloadCompleteWorldAsJSON,
  downloadCompleteWorldAsCSV,
} from "@/lib/export/worldExport";
import { importStarSystemFromFile } from "@/lib/import/starImport";
import {
  getAllStarSystems,
  deleteStarSystem,
} from "@/lib/db/queries/starQueries";
import { getAllWorlds } from "@/lib/db/queries/worldQueries";
import { getPlanetsByStarSystem } from "@/lib/db/queries/planetQueries";

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
    name: string;
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

  // Load all worlds data
  const allWorlds = useLiveQuery(() => getAllWorlds());

  // Load planets for the selected star system
  const selectedSystemPlanets = useLiveQuery(
    async () => {
      if (!selectedWorld) return [];
      return await getPlanetsByStarSystem(selectedWorld.id);
    },
    [selectedWorld?.id]
  );

  // Debug: Log what allWorlds contains
  console.log(
    "🔍 MyWorlds render - allWorlds:",
    allWorlds?.length ?? 0,
    "worlds"
  );

  // Wait for data to load before processing
  const isLoading = !starSystems || !allWorlds;

  // Convert StarSystem[] to SavedWorld[] for display
  const worlds: SavedWorld[] = isLoading
    ? []
    : (starSystems ?? []).map((system) => {
        const stellarClass = system.primaryStar.stellarClass;
        const stellarGrade = system.primaryStar.stellarGrade;

        // Get actual stellar properties from lookup tables
        const mass = STELLAR_MASS[stellarClass][stellarGrade];
        const luminosity = STELLAR_LUMINOSITY[stellarClass][stellarGrade];

        // Get main world data for this system (use first world if available)
        const systemWorlds = (allWorlds || []).filter(
          (world) => world.starSystemId === system.id
        );
        const mainWorldData = systemWorlds[0];

        // Debug logging
        console.log(`🔍 System "${system.name}" (${system.id}):`, {
          systemWorldsCount: systemWorlds.length,
          hasMainWorld: !!mainWorldData,
          mainWorldType: mainWorldData?.type,
          mainWorldSize: mainWorldData?.size,
        });

        return {
          id: system.id,
          name: system.name,
          primaryStar: {
            name: system.primaryStar.name,
            class: `${stellarClass}${stellarGrade}`,
            luminosity: `${luminosity.toFixed(2)} L☉`,
            mass: `${mass.toFixed(2)} M☉`,
          },
          companionStars:
            system.companionStars.length > 0
              ? system.companionStars.map((companion) => {
                  const compClass = companion.stellarClass;
                  const compGrade = companion.stellarGrade;
                  const compMass = STELLAR_MASS[compClass][compGrade];
                  const compLuminosity =
                    STELLAR_LUMINOSITY[compClass][compGrade];

                  return {
                    name: companion.name,
                    class: `${compClass}${compGrade}`,
                    luminosity: `${compLuminosity.toFixed(2)} L☉`,
                    mass: `${compMass.toFixed(2)} M☉`,
                  };
                })
              : [],
          mainWorld: {
            name: mainWorldData?.name || "Primary World",
            type: mainWorldData?.type || "Habitat",
            size: mainWorldData
              ? `${Number(mainWorldData.size).toFixed(1)} EM`
              : "1.0 EM",
          },
          systemType:
            system.companionStars.length > 0
              ? `${system.companionStars.length + 1}-Star System`
              : "Single Star",
          techLevel: mainWorldData?.techLevel
            ? `TL ${mainWorldData.techLevel}`
            : "Space Age",
          habitability: mainWorldData?.habitabilityScore
            ? `${Number(mainWorldData.habitabilityScore).toFixed(1)}/10`
            : "Not set",
          position: "1.0 AU", // Position data would need to be added to WorldData interface
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
    return starSystems.find((sys) => sys.id === selectedWorld.id) ?? null;
  };

  // Get the complete WorldData for the selected world
  const getSelectedWorldData = (): WorldData | null => {
    if (!selectedWorld || !allWorlds) return null;
    const systemWorlds = allWorlds.filter(
      (world) => world.starSystemId === selectedWorld.id
    );
    return systemWorlds[0] ?? null;
  };

  const handleExportJSON = async () => {
    const system = getSelectedStarSystem();
    if (system) {
      try {
        await downloadCompleteWorldAsJSON(system);
      } catch (error) {
        console.error('Failed to export world as JSON:', error);
        setImportError('Failed to export world configuration. Please try again.');
      }
    } else {
      setImportError("No star system selected to export");
    }
  };

  const handleExportCSV = async () => {
    const system = getSelectedStarSystem();
    if (system) {
      try {
        await downloadCompleteWorldAsCSV(system);
      } catch (error) {
        console.error('Failed to export world as CSV:', error);
        setImportError('Failed to export world configuration. Please try again.');
      }
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
      setImportError(
        "Failed to import star system. Please check the file format."
      );
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
        const { updateStarSystem } = await import(
          "@/lib/db/queries/starQueries"
        );
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">My Saved Worlds</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button onClick={handleImportClick} variant="outline" size="default" className="flex-1 sm:flex-none">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button onClick={() => navigate("/create-new")} size="default" className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add New World</span>
            <span className="sm:hidden">New</span>
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
            onClick={() => {
              console.log("🎯 World card clicked:", {
                worldId: world.id,
                worldName: world.name,
                mainWorldType: world.mainWorld.type,
                mainWorldSize: world.mainWorld.size,
                techLevel: world.techLevel,
                habitability: world.habitability,
              });
              setSelectedWorld(world);
            }}
          >
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">{world.name}</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{world.primaryStar.name}</span>
                </div>

                {world.companionStars && world.companionStars.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                    <Star className="h-3 w-3" />
                    <span>
                      + {world.companionStars.length} companion
                      {world.companionStars.length > 1 ? "s" : ""}:
                      {world.companionStars.map((companion, idx) => (
                        <span key={idx} className="ml-1">
                          {companion.name}
                          {idx < world.companionStars.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{world.mainWorld.type}</span>
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
          {selectedWorld && (() => {
            const worldData = getSelectedWorldData();

            return (
            <div className="p-4 sm:p-6 pt-10 sm:pt-12">
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
                      <SheetTitle className="text-xl sm:text-2xl md:text-3xl">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-2">
                  <span>Created at: {selectedWorld.createdAt}</span>
                  <span>Last modified: {selectedWorld.lastModified}</span>
                </div>
              </SheetHeader>

              {/* Star Information Card */}
              <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-none">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                      {/* Star Visualization */}
                      <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-200 to-blue-400 shadow-2xl shadow-blue-500/50 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
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
              {selectedWorld.companionStars &&
                selectedWorld.companionStars.length > 0 && (
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm text-white/60 mb-2">
                                  Luminosity
                                </h5>
                                <p className="text-sm text-white">
                                  {companion.luminosity}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm text-white/60 mb-2">
                                  Mass
                                </h5>
                                <p className="text-sm text-white">
                                  {companion.mass}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Main World Section */}
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Main World</h3>
                <Card className="overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {/* World Visualization */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 shadow-lg shadow-emerald-500/30" />
                        <div>
                          <h4 className="text-xl font-bold text-white">
                            {selectedWorld.mainWorld.name || "Primary World"}
                          </h4>
                          <p className="text-sm text-white/60 capitalize">
                            {selectedWorld.mainWorld.type}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 capitalize">
                        {selectedWorld.mainWorld.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                      <div>
                        <h5 className="text-sm text-white/60 mb-1">Size</h5>
                        <p className="text-sm font-medium">
                          {selectedWorld.mainWorld.size}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm text-white/60 mb-1">
                          Tech Level
                        </h5>
                        <p className="text-sm font-medium">
                          {selectedWorld.techLevel}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm text-white/60 mb-1">
                          Habitability
                        </h5>
                        <p className="text-sm font-medium">
                          {selectedWorld.habitability}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm text-white/60 mb-1">Position</h5>
                        <p className="text-sm font-medium">
                          {selectedWorld.position}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Physical Properties Section */}
              {worldData && (worldData.mass !== undefined || worldData.gravity !== undefined) && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Physical Properties</h3>
                  <Card className="overflow-hidden bg-gradient-to-br from-purple-900 via-violet-950 to-purple-900">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
                        {worldData.mass !== undefined && worldData.mass !== null && (
                          <div>
                            <h5 className="text-sm text-white/60 mb-1">Mass</h5>
                            <p className="text-sm font-medium">
                              {Number(worldData.mass).toFixed(2)} EM
                            </p>
                          </div>
                        )}
                        {worldData.gravity !== undefined && worldData.gravity !== null && (
                          <div>
                            <h5 className="text-sm text-white/60 mb-1">Gravity</h5>
                            <p className="text-sm font-medium">
                              {Number(worldData.gravity).toFixed(2)} G
                            </p>
                          </div>
                        )}
                        {worldData.type === 'dwarf' && worldData.composition && (
                          <div>
                            <h5 className="text-sm text-white/60 mb-1">Composition</h5>
                            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 capitalize">
                              {worldData.composition}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Habitability Breakdown Section */}
              {worldData && (worldData.atmosphericPressure || worldData.temperature || worldData.hazardType || worldData.biochemicalResources) && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Habitability Breakdown</h3>
                  <Card className="overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-900">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                        {worldData.atmosphericPressure && (
                          <div>
                            <h5 className="text-sm text-white/60 mb-2">Atmosphere</h5>
                            <Badge className={
                              worldData.atmosphericPressure === 'Standard'
                                ? 'bg-green-500/20 text-green-200 border-green-400/30 capitalize'
                                : ['Thin', 'Dense'].includes(worldData.atmosphericPressure)
                                ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30 capitalize'
                                : 'bg-red-500/20 text-red-200 border-red-400/30 capitalize'
                            }>
                              {worldData.atmosphericPressure}
                            </Badge>
                          </div>
                        )}
                        {worldData.temperature && (
                          <div>
                            <h5 className="text-sm text-white/60 mb-2">Temperature</h5>
                            <Badge className={
                              worldData.temperature === 'Temperate'
                                ? 'bg-green-500/20 text-green-200 border-green-400/30 capitalize'
                                : ['Frozen', 'Cold'].includes(worldData.temperature)
                                ? 'bg-blue-500/20 text-blue-200 border-blue-400/30 capitalize'
                                : 'bg-red-500/20 text-red-200 border-red-400/30 capitalize'
                            }>
                              {worldData.temperature}
                            </Badge>
                          </div>
                        )}
                        {worldData.hazardType && (
                          <div>
                            <h5 className="text-sm text-white/60 mb-2">Hazard</h5>
                            <div className="flex flex-col gap-1">
                              <Badge className={
                                worldData.hazardType === 'None'
                                  ? 'bg-green-500/20 text-green-200 border-green-400/30 capitalize'
                                  : 'bg-red-500/20 text-red-200 border-red-400/30 capitalize'
                              }>
                                {worldData.hazardType}
                              </Badge>
                              {worldData.hazardIntensity && worldData.hazardType !== 'None' && (
                                <Badge variant="outline" className="text-xs">
                                  Intensity: {worldData.hazardIntensity}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {worldData.biochemicalResources && (
                          <div>
                            <h5 className="text-sm text-white/60 mb-2">Resources</h5>
                            <Badge className={
                              ['Rich', 'Very Rich'].includes(worldData.biochemicalResources)
                                ? 'bg-green-500/20 text-green-200 border-green-400/30 capitalize'
                                : worldData.biochemicalResources === 'Moderate'
                                ? 'bg-blue-500/20 text-blue-200 border-blue-400/30 capitalize'
                                : worldData.biochemicalResources === 'Poor'
                                ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30 capitalize'
                                : 'bg-red-500/20 text-red-200 border-red-400/30 capitalize'
                            }>
                              {worldData.biochemicalResources}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {worldData.habitabilityScore !== undefined && worldData.habitabilityScore !== null && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Total Habitability Score</span>
                            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-base">
                              {Number(worldData.habitabilityScore).toFixed(1)}/10
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Inhabitants & Governance Section */}
              {worldData && (worldData.population || worldData.wealth || worldData.powerStructure || worldData.governance || worldData.sourceOfPower) && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Inhabitants & Governance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {worldData.population !== undefined && worldData.population !== null && (
                      <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-gray-950 to-slate-900">
                        <CardContent className="p-6">
                          <h4 className="text-sm text-white/60 mb-2">Population</h4>
                          <p className="text-xl font-bold text-white">
                            {Number(worldData.population).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {worldData.wealth !== undefined && (
                      <Card className="overflow-hidden bg-gradient-to-br from-green-900 via-emerald-950 to-green-900">
                        <CardContent className="p-6">
                          <h4 className="text-sm text-white/60 mb-2">Wealth</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-white">{worldData.wealth}</p>
                            <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                              {worldData.wealth <= 4 ? 'Poor' : worldData.wealth <= 8 ? 'Moderate' : 'Rich'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {worldData.powerStructure && (
                      <Card className="overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-900">
                        <CardContent className="p-6">
                          <h4 className="text-sm text-white/60 mb-2">Power Structure</h4>
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 capitalize">
                            {worldData.powerStructure}
                          </Badge>
                        </CardContent>
                      </Card>
                    )}
                    {worldData.governance && (
                      <Card className="overflow-hidden bg-gradient-to-br from-purple-900 via-violet-950 to-purple-900">
                        <CardContent className="p-6">
                          <h4 className="text-sm text-white/60 mb-2">Governance</h4>
                          <Badge className={
                            worldData.governance === 'Chaotic'
                              ? 'bg-red-500/20 text-red-200 border-red-400/30 capitalize'
                              : ['Weak', 'Moderate'].includes(worldData.governance)
                              ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30 capitalize'
                              : 'bg-green-500/20 text-green-200 border-green-400/30 capitalize'
                          }>
                            {worldData.governance}
                          </Badge>
                        </CardContent>
                      </Card>
                    )}
                    {worldData.sourceOfPower && (
                      <Card className="overflow-hidden bg-gradient-to-br from-amber-900 via-orange-950 to-amber-900">
                        <CardContent className="p-6">
                          <h4 className="text-sm text-white/60 mb-2">Source of Power</h4>
                          <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 capitalize">
                            {worldData.sourceOfPower}
                          </Badge>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Starport & Development Section */}
              {worldData && (worldData.starportClass || worldData.developmentLevel) && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Starport & Development</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {worldData.starportClass && worldData.starportClass !== 'X' && (
                      <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-gray-950 to-slate-900">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-sm text-white/60 mb-1">Starport Class</h4>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-white">
                                  Class {worldData.starportClass}
                                </p>
                                <Badge className="bg-slate-500/20 text-slate-200 border-slate-400/30">
                                  {worldData.starportClass === 'A' ? 'Excellent' :
                                   worldData.starportClass === 'B' ? 'Good' :
                                   worldData.starportClass === 'C' ? 'Routine' :
                                   worldData.starportClass === 'D' ? 'Poor' :
                                   worldData.starportClass === 'E' ? 'Frontier' : 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                            {worldData.portValueScore !== undefined && (
                              <div className="text-right">
                                <h4 className="text-sm text-white/60 mb-1">Port Value Score</h4>
                                <p className="text-xl font-bold text-white">{worldData.portValueScore}</p>
                              </div>
                            )}
                          </div>
                          {worldData.starportFeatures && worldData.starportFeatures.length > 0 && (
                            <div>
                              <h5 className="text-sm text-white/60 mb-2">Features</h5>
                              <div className="flex flex-wrap gap-2">
                                {worldData.starportFeatures.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs capitalize">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {worldData.developmentLevel && (
                      <Card className="overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-900">
                        <CardContent className="p-6">
                          <h4 className="text-sm text-white/60 mb-2">Development Level</h4>
                          <Badge className={
                            ['underdeveloped', 'developing'].includes(worldData.developmentLevel.toLowerCase())
                              ? 'bg-red-500/20 text-red-200 border-red-400/30 capitalize'
                              : worldData.developmentLevel.toLowerCase() === 'mature'
                              ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30 capitalize'
                              : worldData.developmentLevel.toLowerCase() === 'developed'
                              ? 'bg-blue-500/20 text-blue-200 border-blue-400/30 capitalize'
                              : 'bg-green-500/20 text-green-200 border-green-400/30 capitalize'
                          }>
                            {worldData.developmentLevel.replace(/_/g, ' ')}
                          </Badge>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Circumstellar Disks Section */}
              {selectedSystemPlanets && selectedSystemPlanets.filter(p => p.planetType === 'circumstellar_disk').length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Circumstellar Disks</h3>
                  <div className="space-y-3">
                    {selectedSystemPlanets
                      .filter(planet => planet.planetType === 'circumstellar_disk')
                      .map((disk, idx) => (
                        <Card key={idx} className="overflow-hidden bg-gradient-to-br from-orange-900 via-red-950 to-orange-900">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-xl font-bold text-white mb-1">{disk.name}</h4>
                                <Badge className="bg-orange-500/20 text-orange-200 border-orange-400/30 capitalize">
                                  {disk.diskType?.replace(/_/g, ' ') || 'Disk'}
                                </Badge>
                              </div>
                              <Badge variant="outline" className="text-white">
                                Orbit {disk.orbitPosition}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-white">
                              {disk.diskZone && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Zone</h5>
                                  <p className="text-sm font-medium capitalize">{disk.diskZone.replace(/_/g, ' ')}</p>
                                </div>
                              )}
                              {disk.diskMass !== undefined && disk.diskMassUnit && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Mass</h5>
                                  <p className="text-sm font-medium">{disk.diskMass} {disk.diskMassUnit}</p>
                                </div>
                              )}
                              {disk.diskInnerRadius !== undefined && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Inner Radius</h5>
                                  <p className="text-sm font-medium">{disk.diskInnerRadius.toFixed(2)} AU</p>
                                </div>
                              )}
                              {disk.diskOuterRadius !== undefined && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Outer Radius</h5>
                                  <p className="text-sm font-medium">{disk.diskOuterRadius.toFixed(2)} AU</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Secondary Planets Section */}
              {selectedSystemPlanets && selectedSystemPlanets.filter(p => p.planetType !== 'circumstellar_disk').length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Secondary Planets</h3>
                  <div className="space-y-3">
                    {selectedSystemPlanets
                      .filter(planet => planet.planetType !== 'circumstellar_disk')
                      .map((planet, idx) => (
                        <Card key={idx} className="overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-950 to-indigo-900">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-xl font-bold text-white mb-1">{planet.name}</h4>
                                <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 capitalize">
                                  {planet.planetType.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <Badge variant="outline" className="text-white">
                                Orbit {planet.orbitPosition}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-white">
                              {planet.size !== undefined && (planet.planetType === 'gas_giant' || planet.planetType === 'ice_giant') && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Size</h5>
                                  <p className="text-sm font-medium">{planet.size.toFixed(2)} JM</p>
                                </div>
                              )}
                              {planet.mass !== undefined && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Mass</h5>
                                  <p className="text-sm font-medium">{planet.mass.toFixed(2)}</p>
                                </div>
                              )}
                              {planet.beltWidth !== undefined && (planet.planetType === 'asteroid_belt' || planet.planetType === 'planetoid_belt') && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Belt Width</h5>
                                  <p className="text-sm font-medium">{planet.beltWidth.toFixed(2)} AU</p>
                                </div>
                              )}
                              {planet.density && (planet.planetType === 'asteroid_belt' || planet.planetType === 'planetoid_belt') && (
                                <div>
                                  <h5 className="text-sm text-white/60 mb-1">Density</h5>
                                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 capitalize">
                                    {planet.density}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6">
                {/* Delete Button */}
                <Button
                  onClick={handleDeleteWorld}
                  variant="destructive"
                  size="default"
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Delete
                </Button>

                {/* Export Buttons */}
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    onClick={handleExportJSON}
                    variant="default"
                    size="default"
                    className="flex-1 sm:flex-none"
                  >
                    <FileJson className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export JSON</span>
                    <span className="sm:hidden">JSON</span>
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" size="default" className="flex-1 sm:flex-none">
                    <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">CSV</span>
                  </Button>
                </div>
              </div>
            </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
