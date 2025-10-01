import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type WorldType = "habitat" | "terrestrial" | "dwarf" | "random";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => () => void) => void;
}

export function CreateMainWorld() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  const [worldName, setWorldName] = useState("Primary World #1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(worldName);
  const [selectedType, setSelectedType] = useState<WorldType | null>(null);
  const [worldSize, setWorldSize] = useState("");
  const [gravity, setGravity] = useState("");
  const [lesserEarthType, setLesserEarthType] = useState("");
  const [populationSize, setPopulationSize] = useState("");

  const handleSaveName = () => {
    setWorldName(tempName);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(worldName);
    setIsEditingName(false);
  };

  const handleEditClick = () => {
    setTempName(worldName);
    setIsEditingName(true);
  };

  // Handler for Next button
  const handleNext = useCallback(() => {
    // Navigate to next page in the creation flow
    // TODO: Update this path based on your next step in the workflow
    navigate("/"); // For now, return to home - update as needed
  }, [navigate]);

  // Update Next button state based on selection
  useEffect(() => {
    if (context) {
      // Enable Next button only when world type is selected
      context.setNextDisabled(!selectedType);
      context.setNextHandler(() => handleNext);
    }
  }, [selectedType, handleNext, context]);

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500">
      {/* Header with editable name */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Main World
        </h1>
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="text-lg font-semibold h-10 max-w-xs"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveName}
                className="h-8 w-8 text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                className="h-8 w-8 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">{worldName}</h2>
              <Pencil
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={handleEditClick}
              />
            </>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: World Type Selection */}
        <div>
          <Label className="text-base font-semibold mb-4 block">
            World Type
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <Card
              role="button"
              onClick={() => setSelectedType("habitat")}
              className={cn(
                "h-48 cursor-pointer transition-all hover:border-primary/50 relative",
                selectedType === "habitat" && "border-primary border-2"
              )}
            >
              <CardContent className="h-full flex items-center justify-center p-6">
                {selectedType === "habitat" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-background" />
                  </div>
                )}
                {selectedType !== "habitat" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-muted-foreground" />
                )}
                <h3 className="text-xl font-semibold">Habitat</h3>
              </CardContent>
            </Card>

            <Card
              role="button"
              onClick={() => setSelectedType("terrestrial")}
              className={cn(
                "h-48 cursor-pointer transition-all hover:border-primary/50 relative",
                selectedType === "terrestrial" && "border-primary border-2"
              )}
            >
              <CardContent className="h-full flex items-center justify-center p-6">
                {selectedType === "terrestrial" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-background" />
                  </div>
                )}
                {selectedType !== "terrestrial" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-muted-foreground" />
                )}
                <h3 className="text-xl font-semibold">Terrestrial</h3>
              </CardContent>
            </Card>

            <Card
              role="button"
              onClick={() => setSelectedType("dwarf")}
              className={cn(
                "h-48 cursor-pointer transition-all hover:border-primary/50 relative",
                selectedType === "dwarf" && "border-primary border-2"
              )}
            >
              <CardContent className="h-full flex items-center justify-center p-6">
                {selectedType === "dwarf" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-background" />
                  </div>
                )}
                {selectedType !== "dwarf" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-muted-foreground" />
                )}
                <h3 className="text-xl font-semibold">Dwarf</h3>
              </CardContent>
            </Card>

            <Card
              role="button"
              onClick={() => setSelectedType("random")}
              className={cn(
                "h-48 cursor-pointer transition-all hover:border-primary/50 relative",
                selectedType === "random" && "border-primary border-2"
              )}
            >
              <CardContent className="h-full flex items-center justify-center p-6">
                {selectedType === "random" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-background" />
                  </div>
                )}
                {selectedType !== "random" && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-muted-foreground" />
                )}
                <h3 className="text-xl font-semibold">Random</h3>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="world-size" className="text-base font-semibold">
              World Size
            </Label>
            <Select value={worldSize} onValueChange={setWorldSize}>
              <SelectTrigger id="world-size" className="mt-2">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiny">Tiny</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="huge">Huge</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gravity" className="text-base font-semibold">
              Gravity
            </Label>
            <Select value={gravity} onValueChange={setGravity}>
              <SelectTrigger id="gravity" className="mt-2">
                <SelectValue placeholder="Select gravity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (0.5-0.8 G)</SelectItem>
                <SelectItem value="normal">Normal (0.8-1.2 G)</SelectItem>
                <SelectItem value="high">High (1.2-2.0 G)</SelectItem>
                <SelectItem value="very-high">Very High (2.0+ G)</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="lesser-earth-type"
              className="text-base font-semibold"
            >
              Lesser Earth Type{" "}
              <span className="text-muted-foreground">(*)</span>
            </Label>
            <Select value={lesserEarthType} onValueChange={setLesserEarthType}>
              <SelectTrigger id="lesser-earth-type" className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desert">Desert</SelectItem>
                <SelectItem value="tundra">Tundra</SelectItem>
                <SelectItem value="ocean">Ocean</SelectItem>
                <SelectItem value="ice">Ice</SelectItem>
                <SelectItem value="volcanic">Volcanic</SelectItem>
                <SelectItem value="garden">Garden</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="population-size"
              className="text-base font-semibold"
            >
              Population Size
            </Label>
            <Select value={populationSize} onValueChange={setPopulationSize}>
              <SelectTrigger id="population-size" className="mt-2">
                <SelectValue placeholder="Select population" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uninhabited">Uninhabited</SelectItem>
                <SelectItem value="outpost">Outpost (100s)</SelectItem>
                <SelectItem value="settlement">Settlement (1000s)</SelectItem>
                <SelectItem value="colony">Colony (10,000s)</SelectItem>
                <SelectItem value="city">City (100,000s)</SelectItem>
                <SelectItem value="metropolis">
                  Metropolis (Millions)
                </SelectItem>
                <SelectItem value="world-city">
                  World City (Billions)
                </SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
