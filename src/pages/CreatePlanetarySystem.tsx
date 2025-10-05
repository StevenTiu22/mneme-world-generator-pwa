import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ArrowDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CelestialBody {
  id: string;
  type: "star" | "world" | "disk";
  name: string;
  luminosity?: string;
  size?: string;
  position?: string;
  modifiers: string[];
}

export function CreatePlanetarySystem() {
  const navigate = useNavigate();
  const [bodies, setBodies] = useState<CelestialBody[]>([]);
  const [diskOpen, setDiskOpen] = useState(false);

  useEffect(() => {
    // Load data from previous steps
    const primaryStar = localStorage.getItem("primaryStar");
    const mainWorld = localStorage.getItem("mainWorld");

    const loadedBodies: CelestialBody[] = [];

    if (primaryStar) {
      const starData = JSON.parse(primaryStar);
      loadedBodies.push({
        id: "primary-star",
        type: "star",
        name: starData.name || "Star A9",
        luminosity: "1.0 L☉",
        size: "1.0 M☉",
        position: "0 AU",
        modifiers: [],
      });
    }

    if (mainWorld) {
      const worldData = JSON.parse(mainWorld);
      loadedBodies.push({
        id: "primary-world",
        type: "world",
        name: worldData.name || "Primary World",
        luminosity: "N/A",
        size: worldData.size || "1.0 EM",
        position: "1.0 AU",
        modifiers: [],
      });
    }

    setBodies(loadedBodies);
  }, []);

  const handleAddDisk = () => {
    const newDisk: CelestialBody = {
      id: `disk-${Date.now()}`,
      type: "disk",
      name: `Disk ${bodies.filter((b) => b.type === "disk").length + 1}`,
      position: "3.0 AU",
      modifiers: [],
    };
    setBodies([...bodies, newDisk]);
  };

  const CelestialCard = ({ body }: { body: CelestialBody }) => {
    const getGradient = (type: string) => {
      if (type === "star") {
        return "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900";
      }
      return "bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950";
    };

    return (
      <Card className={`overflow-hidden ${getGradient(body.type)}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Planet/Star Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200 to-blue-400 shadow-lg" />
              <div>
                <h3 className="text-2xl font-bold text-white">{body.name}</h3>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {body.modifiers.length === 0
                ? "No modifiers"
                : `${body.modifiers.length} modifiers`}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-white">
            {body.luminosity && (
              <div>
                <p className="text-sm text-white/60 mb-1">Luminosity</p>
                <p className="font-semibold">{body.luminosity}</p>
              </div>
            )}
            {body.size && (
              <div>
                <p className="text-sm text-white/60 mb-1">Size</p>
                <p className="font-semibold">{body.size}</p>
              </div>
            )}
          </div>

          {body.position && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-white/60 mb-1">Position</p>
              <p className="font-semibold text-white">{body.position}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Planetary System</h1>
        <p className="text-muted-foreground">
          Overview of your generated stellar system
        </p>
      </div>

      {/* Celestial Bodies */}
      <div className="space-y-6">
        {bodies.map((body, index) => (
          <div key={body.id}>
            <CelestialCard body={body} />
            {index < bodies.length - 1 && (
              <div className="flex justify-center py-4">
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Disk Section */}
        <Collapsible open={diskOpen} onOpenChange={setDiskOpen}>
          <div className="flex items-center justify-between py-4">
            <h2 className="text-xl font-semibold">Disk</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAddDisk}>
                <Plus className="h-4 w-4 mr-2" />
                Add Disk
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      diskOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="space-y-4">
              {bodies
                .filter((b) => b.type === "disk")
                .map((disk) => (
                  <CelestialCard key={disk.id} body={disk} />
                ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Complete Button */}
        <div className="pt-8">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/my-worlds")}
          >
            Complete World Generation
          </Button>
        </div>
      </div>
    </div>
  );
}
