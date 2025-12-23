import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dices, RefreshCw, Info, Sparkles, AlertCircle } from "lucide-react";
import { generateCulture, generateCultureTrait } from "@/lib/generators/cultureGenerator";
import { CultureCategory, type CultureTrait } from "@/models/world/culture";
import {
  CULTURE_SOCIAL_VALUES,
  CULTURE_ECONOMIC_FOCUS,
  CULTURE_TECH_ATTITUDE,
} from "@/lib/generators/worldTables";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

interface WorldContextData {
  name: string;
  worldId?: string;
}

interface CulturePageData {
  traits: CultureTrait[];
  generationMethod: 'procedural' | 'custom';
}

export function CreateWorldCulture() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  // State
  const [worldName, setWorldName] = useState("Unknown World");
  const [worldId, setWorldId] = useState<string | null>(null);
  const [traits, setTraits] = useState<CultureTrait[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generation mode state
  const [generationMode, setGenerationMode] = useState<'procedural' | 'manual'>('procedural');

  // Manual selection values
  const [manualSocial, setManualSocial] = useState<string>("");
  const [manualEconomic, setManualEconomic] = useState<string>("");
  const [manualTech, setManualTech] = useState<string>("");

  // Check if culture is complete
  const isCultureComplete = traits.length === 3;

  // Get trait by category
  const getTraitByCategory = (category: CultureCategory): CultureTrait | undefined => {
    return traits.find(t => t.category === category);
  };

  // Handle full culture generation
  const handleGenerateCulture = useCallback(() => {
    if (!worldId) {
      console.error("No world ID available for culture generation");
      return;
    }

    const cultureData = generateCulture({ worldId });
    setTraits(cultureData.traits);

    console.log("🎭 Generated complete culture:", cultureData);
  }, [worldId]);

  // Handle manual culture creation
  const handleCreateManualCulture = useCallback(() => {
    if (!manualSocial || !manualEconomic || !manualTech) {
      console.error("All three traits must be selected for manual culture creation");
      return;
    }

    const newTraits: CultureTrait[] = [];

    // Social trait
    const socialEntry = CULTURE_SOCIAL_VALUES.find(t => t.trait === manualSocial);
    if (socialEntry) {
      newTraits.push({
        category: CultureCategory.SOCIAL,
        trait: socialEntry.trait,
        description: socialEntry.description,
        roll: socialEntry.d66,
      });
    }

    // Economic trait
    const economicEntry = CULTURE_ECONOMIC_FOCUS.find(t => t.trait === manualEconomic);
    if (economicEntry) {
      newTraits.push({
        category: CultureCategory.ECONOMIC,
        trait: economicEntry.trait,
        description: economicEntry.description,
        roll: economicEntry.d66,
      });
    }

    // Tech trait
    const techEntry = CULTURE_TECH_ATTITUDE.find(t => t.trait === manualTech);
    if (techEntry) {
      newTraits.push({
        category: CultureCategory.TECHNOLOGICAL,
        trait: techEntry.trait,
        description: techEntry.description,
        roll: techEntry.d66,
      });
    }

    setTraits(newTraits);
    console.log("✍️ Created manual culture:", newTraits);
  }, [manualSocial, manualEconomic, manualTech]);

  // Handle re-roll of specific trait
  const handleRerollTrait = useCallback((category: CultureCategory) => {
    const { trait } = generateCultureTrait(category);

    setTraits(prevTraits => {
      // Replace the trait for this category
      const newTraits = prevTraits.filter(t => t.category !== category);
      return [...newTraits, trait].sort((a, b) => {
        // Sort by category order: social, economic, tech
        const order = [CultureCategory.SOCIAL, CultureCategory.ECONOMIC, CultureCategory.TECHNOLOGICAL];
        return order.indexOf(a.category) - order.indexOf(b.category);
      });
    });

    console.log(`🔄 Re-rolled ${category} trait:`, trait);
  }, []);

  // Save data to localStorage
  const saveData = useCallback(() => {
    const data: CulturePageData = {
      traits,
      generationMethod: generationMode === 'procedural' ? 'procedural' : 'custom',
    };
    localStorage.setItem("worldCulture", JSON.stringify(data));
    console.log("💾 Saved culture data to localStorage");
  }, [traits, generationMode]);

  // Load world data from previous step
  useEffect(() => {
    const loadWorldData = () => {
      try {
        const mainWorldData = localStorage.getItem("mainWorld");
        if (mainWorldData) {
          const parsed: WorldContextData = JSON.parse(mainWorldData);
          setWorldName(parsed.name || "Unknown World");
          setWorldId(parsed.worldId || `world-${Date.now()}`);
        }

        // Try to load existing culture data
        const savedCulture = localStorage.getItem("worldCulture");
        if (savedCulture) {
          const cultureData: CulturePageData = JSON.parse(savedCulture);
          setTraits(cultureData.traits);
          console.log("✅ Loaded existing culture data from localStorage");
        }
      } catch (error) {
        console.error("Failed to load world or culture data:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadWorldData();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialized && traits.length > 0) {
      saveData();
    }
  }, [isInitialized, traits, saveData]);

  // Handle Next button
  const handleNext = useCallback(() => {
    saveData();
    // Navigate to the next step in the wizard flow
    navigate("../habitability");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!isCultureComplete);
      context.setNextHandler(handleNext);
    }
  }, [isCultureComplete, handleNext, context]);

  // Keyboard shortcut for generation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") {
        handleGenerateCulture();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleGenerateCulture]);

  // Get color scheme for each category
  const getCategoryColor = (category: CultureCategory) => {
    switch (category) {
      case CultureCategory.SOCIAL:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-200 dark:border-blue-900",
          badge: "border-blue-600 text-blue-600",
          text: "text-blue-600 dark:text-blue-400",
          button: "text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-950",
        };
      case CultureCategory.ECONOMIC:
        return {
          bg: "bg-green-50 dark:bg-green-950/30",
          border: "border-green-200 dark:border-green-900",
          badge: "border-green-600 text-green-600",
          text: "text-green-600 dark:text-green-400",
          button: "text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-950",
        };
      case CultureCategory.TECHNOLOGICAL:
        return {
          bg: "bg-purple-50 dark:bg-purple-950/30",
          border: "border-purple-200 dark:border-purple-900",
          badge: "border-purple-600 text-purple-600",
          text: "text-purple-600 dark:text-purple-400",
          button: "text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-950",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-950/30",
          border: "border-gray-200 dark:border-gray-900",
          badge: "border-gray-600 text-gray-600",
          text: "text-gray-600 dark:text-gray-400",
          button: "text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-950",
        };
    }
  };

  // Get category label and icon
  const getCategoryInfo = (category: CultureCategory): { label: string; icon: string } => {
    switch (category) {
      case CultureCategory.SOCIAL:
        return { label: "Social Values", icon: "👥" };
      case CultureCategory.ECONOMIC:
        return { label: "Economic Focus", icon: "💼" };
      case CultureCategory.TECHNOLOGICAL:
        return { label: "Technological Attitude", icon: "🔬" };
      default:
        return { label: category, icon: "📋" };
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Cultural Profile
          </h1>
          <p className="text-muted-foreground">
            Define the cultural characteristics of <span className="font-semibold">{worldName}</span>. Press{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              C
            </kbd>{" "}
            to generate culture using d66 tables.
          </p>
        </div>

        {/* Alert if incomplete */}
        {!isCultureComplete && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Generate cultural traits to proceed to the next step.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Generation Mode Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Generation Mode</Label>
                <RadioGroup
                  value={generationMode}
                  onValueChange={(value) => setGenerationMode(value as 'procedural' | 'manual')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="procedural" id="procedural" />
                    <Label htmlFor="procedural" className="cursor-pointer">
                      Procedural (d66 Tables)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="cursor-pointer">
                      Manual Selection
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Procedural Generation */}
              {generationMode === 'procedural' && (
                <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                        Procedural Generation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generate three cultural traits using the d66 system from Mneme rules.
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateCulture}
                      className="ml-4"
                      size="lg"
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      Generate Culture
                    </Button>
                  </div>
                </Card>
              )}

              {/* Manual Selection */}
              {generationMode === 'manual' && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Manual Selection</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose specific cultural traits from the complete list. All three traits must be selected.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Social Values Selector */}
                      <div>
                        <Label htmlFor="social-selector" className="mb-2 block">
                          Social Values
                        </Label>
                        <Select
                          value={manualSocial}
                          onValueChange={setManualSocial}
                        >
                          <SelectTrigger id="social-selector">
                            <SelectValue placeholder="Select a social value" />
                          </SelectTrigger>
                          <SelectContent>
                            {CULTURE_SOCIAL_VALUES.map((entry) => (
                              <SelectItem key={entry.d66} value={entry.trait}>
                                {entry.trait} - {entry.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Economic Focus Selector */}
                      <div>
                        <Label htmlFor="economic-selector" className="mb-2 block">
                          Economic Focus
                        </Label>
                        <Select
                          value={manualEconomic}
                          onValueChange={setManualEconomic}
                        >
                          <SelectTrigger id="economic-selector">
                            <SelectValue placeholder="Select an economic focus" />
                          </SelectTrigger>
                          <SelectContent>
                            {CULTURE_ECONOMIC_FOCUS.map((entry) => (
                              <SelectItem key={entry.d66} value={entry.trait}>
                                {entry.trait} - {entry.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Technological Attitude Selector */}
                      <div>
                        <Label htmlFor="tech-selector" className="mb-2 block">
                          Technological Attitude
                        </Label>
                        <Select
                          value={manualTech}
                          onValueChange={setManualTech}
                        >
                          <SelectTrigger id="tech-selector">
                            <SelectValue placeholder="Select a technological attitude" />
                          </SelectTrigger>
                          <SelectContent>
                            {CULTURE_TECH_ATTITUDE.map((entry) => (
                              <SelectItem key={entry.d66} value={entry.trait}>
                                {entry.trait} - {entry.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateManualCulture}
                      size="lg"
                      className="w-full mt-2"
                      disabled={!manualSocial || !manualEconomic || !manualTech}
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      Create Culture
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </Card>

          {/* Cultural Traits Display */}
          {isCultureComplete && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Label className="text-lg font-semibold">Cultural Traits</Label>
              </div>

              {/* Display each trait */}
              {[CultureCategory.SOCIAL, CultureCategory.ECONOMIC, CultureCategory.TECHNOLOGICAL].map(category => {
                const trait = getTraitByCategory(category);
                if (!trait) return null;

                const colors = getCategoryColor(category);
                const info = getCategoryInfo(category);

                return (
                  <Card key={trait.category} className={`p-6 ${colors.bg} ${colors.border}`}>
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{info.icon}</span>
                          <div>
                            <Badge variant="outline" className={`${colors.badge} mb-2`}>
                              {info.label}
                            </Badge>
                            <CardTitle className="text-2xl">{trait.trait}</CardTitle>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                                {trait.roll}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>d66 roll result</p>
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRerollTrait(trait.category)}
                            className={`h-8 w-8 ${colors.button}`}
                            title="Re-roll this trait"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-muted-foreground text-base">{trait.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info Card */}
          {!isCultureComplete && (
            <Card className="p-6 bg-muted/30">
              <div className="flex items-start gap-4">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">About Cultural Traits</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Culture is generated using three d66 rolls (rolling two six-sided dice, reading the first as tens and second as ones):
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span><strong>Social Values:</strong> Core values and beliefs about relationships and society</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span><strong>Economic Focus:</strong> Primary economic activities and trade orientation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span><strong>Technological Attitude:</strong> How the culture views and adopts technology</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Cultural traits help define the character and flavor of your world's inhabitants.
            You can re-roll individual traits or regenerate the entire culture at any time.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
