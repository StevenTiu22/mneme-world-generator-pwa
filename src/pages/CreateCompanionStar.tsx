import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Add TypeScript types
type StarClass = "O" | "B" | "A" | "F" | "G" | "K" | "M" | "Random";

interface Companion {
  id: number;
  name: string;
  class: StarClass | null;
}

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => () => void) => void;
}

export function CreateCompanionStar() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();
  const [systemType, setSystemType] = useState("Binary");
  const [activeCompanion, setActiveCompanion] = useState<number | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const starClasses: StarClass[] = [
    "O",
    "B",
    "A",
    "F",
    "G",
    "K",
    "M",
    "Random",
  ];

  const handleClassSelect = (starClass: StarClass) => {
    if (activeCompanion === null) return;
    const updated = [...companions];
    updated[activeCompanion].class = starClass;
    setCompanions(updated);
  };

  const addCompanion = () => {
    const newCompanion: Companion = {
      id: Date.now(),
      name: `Companion Star ${companions.length + 1}`,
      class: null,
    };
    setCompanions([...companions, newCompanion]);
    setActiveCompanion(companions.length);
  };

  const openRenameDialog = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setRenameValue(companions[index].name);
    setIsRenameOpen(true);
  };

  const handleRename = () => {
    if (activeCompanion === null) return;
    const updated = [...companions];
    updated[activeCompanion].name = renameValue;
    setCompanions(updated);
    setIsRenameOpen(false);
  };

  const removeCompanion = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = companions.filter((_, i) => i !== index);
    setCompanions(updated);

    if (activeCompanion === index) {
      setActiveCompanion(null);
    } else if (activeCompanion !== null && activeCompanion > index) {
      setActiveCompanion(activeCompanion - 1);
    }
  };

  const getActiveColor = () => {
    return activeCompanion !== null ? "bg-foreground" : "bg-accent";
  };

  // Handler for Next button to navigate to main-world
  const handleNext = useCallback(() => {
    navigate("../main-world");
  }, [navigate]);

  // Update Next button state - always enabled on this page
  useEffect(() => {
    if (context) {
      context.setNextDisabled(false);
      context.setNextHandler(() => handleNext);
    }
  }, [handleNext, context]);

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">
        Creating your Companion Star(s)
      </h1>

      <div className="flex gap-0 rounded-lg overflow-hidden shadow-lg min-h-[500px]">
        {/* Left Panel */}
        <div className="bg-muted pl-8 py-8 w-80 flex-shrink-0 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="pr-8">
              <Label htmlFor="system-type">System Type</Label>
              <Select value={systemType} onValueChange={setSystemType}>
                <SelectTrigger id="system-type" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Binary">Binary</SelectItem>
                  <SelectItem value="Trinary">Trinary</SelectItem>
                  <SelectItem value="Quaternary">Quaternary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1">
              {companions.map((companion, index) => (
                <Button
                  key={companion.id}
                  onClick={() => setActiveCompanion(index)}
                  variant={activeCompanion === index ? "default" : "outline"}
                  className={`w-full justify-between h-auto py-3 text-left font-normal ${
                    activeCompanion === index
                      ? "rounded-l-md rounded-r-none"
                      : "mr-8 pr-8"
                  }`}
                >
                  <span>{companion.name}</span>
                  {activeCompanion === index && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-background/20"
                        onClick={(e) => openRenameDialog(e, index)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-background/20"
                        onClick={(e) => removeCompanion(e, index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </Button>
              ))}
            </div>

            <div className="pr-8">
              <Button
                variant="outline"
                className="w-full"
                onClick={addCompanion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Companion
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Scrollable - Color matches active button */}
        <div
          className={`flex-1 p-8 overflow-y-auto max-h-[600px] transition-colors ${getActiveColor()}`}
        >
          {activeCompanion !== null ? (
            <div className="space-y-8">
              <div>
                <h2
                  className={`text-lg font-medium mb-4 ${
                    activeCompanion !== null
                      ? "text-background"
                      : "text-accent-foreground"
                  }`}
                >
                  Star Class
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {starClasses.map((starClass) => (
                    <Button
                      key={starClass}
                      variant={
                        companions[activeCompanion].class === starClass
                          ? "default"
                          : "secondary"
                      }
                      onClick={() => handleClassSelect(starClass)}
                      className="h-20 text-lg font-bold"
                    >
                      {starClass}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Additional Settings Section */}
              <div>
                <h2
                  className={`text-lg font-medium mb-4 ${
                    activeCompanion !== null
                      ? "text-background"
                      : "text-accent-foreground"
                  }`}
                >
                  Additional Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="luminosity"
                      className={
                        activeCompanion !== null ? "text-background" : ""
                      }
                    >
                      Luminosity
                    </Label>
                    <Select>
                      <SelectTrigger id="luminosity" className="mt-2">
                        <SelectValue placeholder="Random" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">Random</SelectItem>
                        <SelectItem value="i">I - Supergiant</SelectItem>
                        <SelectItem value="ii">II - Bright Giant</SelectItem>
                        <SelectItem value="iii">III - Giant</SelectItem>
                        <SelectItem value="iv">IV - Subgiant</SelectItem>
                        <SelectItem value="v">V - Main Sequence</SelectItem>
                        <SelectItem value="vi">VI - Subdwarf</SelectItem>
                        <SelectItem value="vii">VII - White Dwarf</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="orbital-distance"
                      className={
                        activeCompanion !== null ? "text-background" : ""
                      }
                    >
                      Orbital Distance
                    </Label>
                    <input
                      id="orbital-distance"
                      type="range"
                      min="0"
                      max="100"
                      className="w-full mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="mass"
                      className={
                        activeCompanion !== null ? "text-background" : ""
                      }
                    >
                      Mass (Solar Masses)
                    </Label>
                    <Input
                      id="mass"
                      type="number"
                      step="0.1"
                      placeholder="Auto-generated"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="age"
                      className={
                        activeCompanion !== null ? "text-background" : ""
                      }
                    >
                      Age (Billion Years)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      step="0.1"
                      placeholder="Auto-generated"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-accent-foreground">
              <p className="text-lg">
                Select or add a companion star to configure
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Companion Star</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="star-name">Star Name</Label>
            <Input
              id="star-name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
