import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Download,
} from "lucide-react";

interface SavedWorld {
  id: string;
  name: string;
  primaryStar: {
    name: string;
    class: string;
    luminosity: string;
    mass: string;
  };
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
  const [worlds, setWorlds] = useState<SavedWorld[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<SavedWorld | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("oldest");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  // Load saved worlds from localStorage
  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = () => {
    const sampleWorlds: SavedWorld[] = [];

    const primaryStar = localStorage.getItem("primaryStar");
    const mainWorld = localStorage.getItem("mainWorld");
    const companionStars = localStorage.getItem("companionStars");
    const worldContext = localStorage.getItem("worldContext");
    const habitability = localStorage.getItem("habitability");
    const position = localStorage.getItem("position");

    if (primaryStar && mainWorld) {
      try {
        const starData = JSON.parse(primaryStar);
        const worldData = JSON.parse(mainWorld);
        const companionData = companionStars
          ? JSON.parse(companionStars)
          : null;
        const contextData = worldContext ? JSON.parse(worldContext) : null;
        const habitabilityData = habitability ? JSON.parse(habitability) : null;
        const positionData = position ? JSON.parse(position) : null;

        sampleWorlds.push({
          id: "world-1",
          name: "World #1",
          primaryStar: {
            name: starData.name || "Star A9",
            class: starData.class || "A9",
            luminosity: `${starData.luminosity || "1.0"} L☉`,
            mass: `${starData.mass || "1.0"} M☉`,
          },
          mainWorld: {
            type: worldData.type || "Habitat",
            size: worldData.size || "1.0 EM",
          },
          systemType:
            companionData?.companions?.length > 0
              ? "Binary Star System"
              : "Single Star",
          techLevel: contextData?.techLevel
            ? `TL ${contextData.techLevel}`
            : "Space Age",
          habitability: habitabilityData ? "Configured" : "Not set",
          position: positionData
            ? `${(positionData.auDistance / 20).toFixed(2)} AU`
            : "1.0 AU",
          createdAt: "01/01/2025, 12:00 AM",
          lastModified: "01/02/2025, 1:00 AM",
        });
      } catch (e) {
        console.error("Failed to load world data", e);
      }
    }

    setWorlds(sampleWorlds);
  };

  const sortWorlds = (worldsList: SavedWorld[]) => {
    const sorted = [...worldsList];
    switch (sortBy) {
      case "newest":
        return sorted.reverse();
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const handleExportWorld = (world: SavedWorld) => {
    const dataStr = JSON.stringify(world, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${world.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveName = () => {
    if (selectedWorld && editedName.trim()) {
      const updatedWorlds = worlds.map((w) =>
        w.id === selectedWorld.id ? { ...w, name: editedName.trim() } : w
      );
      setWorlds(updatedWorlds);
      setSelectedWorld({ ...selectedWorld, name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const sortedWorlds = sortWorlds(worlds);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">My Saved Worlds</h1>
        <Button onClick={() => navigate("/create-new")} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add New World
        </Button>
      </div>

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

              {/* Export Button */}
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => handleExportWorld(selectedWorld)}
                  variant="default"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export to JSON
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
