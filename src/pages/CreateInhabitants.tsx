import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Dices, Info, Sparkles, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { roll2D6 } from "@/lib/dice";
import {
  WEALTH_TABLE,
  POWER_STRUCTURE_TABLE,
  GOVERNANCE_TABLE,
  SOURCE_OF_POWER_TABLE,
  getWealthFromRoll,
  getPowerStructureFromRoll,
  getGovernanceFromRoll,
  getSourceOfPowerFromRoll,
} from "@/lib/generators/worldTables";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

// Development options (from Mneme documentation)
const DEVELOPMENT_OPTIONS = [
  { value: "underdeveloped", label: "Underdeveloped", hdi: "0.0-0.59", soc: 2 },
  { value: "developing", label: "Developing", hdi: "0.60-0.69", soc: 5 },
  { value: "mature", label: "Mature", hdi: "0.70-0.79", soc: 6 },
  { value: "developed", label: "Developed", hdi: "0.80-0.89", soc: 8 },
  { value: "well-developed", label: "Well Developed", hdi: "0.90-0.94", soc: 9 },
  { value: "very-developed", label: "Very Developed", hdi: ">0.95", soc: 10 },
];

// Amber Zone Reasons
const AMBER_ZONE_REASONS = [
  { value: "war", label: "War", icon: "⚔️" },
  { value: "plague", label: "Plague", icon: "🦠" },
  { value: "insurgency", label: "Major Insurgency", icon: "💣" },
  { value: "security", label: "Heightened Security", icon: "🚨" },
  { value: "purging", label: "Political Purging", icon: "⚖️" },
  { value: "economic-crisis", label: "Economic Crisis", icon: "📉" },
  { value: "political-issue", label: "Political Issue", icon: "🏛️" },
  { value: "environmental", label: "Environmental Disaster", icon: "🌪️" },
  { value: "social-issue", label: "Major Social Issue", icon: "👥" },
  { value: "engineering", label: "Engineering Disaster", icon: "⚙️" },
  { value: "collapse", label: "Economic Collapse", icon: "💥" },
];

interface InhabitantsData {
  population: string;
  wealthRoll?: number;
  wealth: string;
  wealthValue: number;
  powerStructureRoll?: number;
  powerStructure: string;
  development: string;
  developmentSoc: number;
  governanceRoll?: number;
  governance: string;
  sourceOfPowerRoll?: number;
  sourceOfPower: string;
  amberZone: boolean;
  amberZoneReason: string;
}

export function CreateInhabitants() {
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  // State
  const [worldName, setWorldName] = useState("Unknown World");
  const [isInitialized, setIsInitialized] = useState(false);

  // Generation mode state
  const [generationMode, setGenerationMode] = useState<'procedural' | 'manual'>('procedural');

  // Form data
  const [population, setPopulation] = useState("100000000");
  const [wealthRoll, setWealthRoll] = useState<number | null>(null);
  const [wealth, setWealth] = useState("");
  const [wealthValue, setWealthValue] = useState(0);
  const [powerStructureRoll, setPowerStructureRoll] = useState<number | null>(null);
  const [powerStructure, setPowerStructure] = useState("");
  const [development, setDevelopment] = useState("");
  const [governanceRoll, setGovernanceRoll] = useState<number | null>(null);
  const [governance, setGovernance] = useState("");
  const [sourceOfPowerRoll, setSourceOfPowerRoll] = useState<number | null>(null);
  const [sourceOfPower, setSourceOfPower] = useState("");
  const [amberZone, setAmberZone] = useState(false);
  const [amberZoneReason, setAmberZoneReason] = useState("");

  // Manual selection values
  const [manualWealth, setManualWealth] = useState("");
  const [manualPowerStructure, setManualPowerStructure] = useState("");
  const [manualDevelopment, setManualDevelopment] = useState("");
  const [manualGovernance, setManualGovernance] = useState("");
  const [manualSourceOfPower, setManualSourceOfPower] = useState("");

  const formatPopulation = (value: string) => {
    return parseInt(value || "0").toLocaleString();
  };

  // Get development SOC value
  const getDevelopmentSoc = useCallback((dev: string): number => {
    const devOption = DEVELOPMENT_OPTIONS.find(d => d.value === dev);
    return devOption?.soc || 0;
  }, []);

  // Check if form is complete
  const isFormComplete =
    population && wealth && powerStructure && development && governance && sourceOfPower;

  // Handle procedural generation
  const handleGenerateInhabitants = useCallback(() => {
    // Roll wealth
    const wealthResult = roll2D6();
    const wealthEntry = getWealthFromRoll(wealthResult.total);
    setWealthRoll(wealthResult.total);
    setWealth(wealthEntry.label);
    setWealthValue(wealthEntry.wealth);

    // Roll power structure
    const powerResult = roll2D6();
    const powerEntry = getPowerStructureFromRoll(powerResult.total);
    setPowerStructureRoll(powerResult.total);
    setPowerStructure(powerEntry.structure);

    // Roll governance
    const govResult = roll2D6();
    const govEntry = getGovernanceFromRoll(govResult.total);
    setGovernanceRoll(govResult.total);
    setGovernance(govEntry.governance);

    // Roll source of power
    const sourceResult = roll2D6();
    const sourceEntry = getSourceOfPowerFromRoll(sourceResult.total);
    setSourceOfPowerRoll(sourceResult.total);
    setSourceOfPower(sourceEntry.source);

    // Default to mature development (can be changed manually)
    if (!development) {
      setDevelopment("mature");
    }

    console.log("👥 Generated inhabitants:", {
      wealth: wealthEntry.label,
      powerStructure: powerEntry.structure,
      governance: govEntry.governance,
      sourceOfPower: sourceEntry.source,
    });
  }, [development]);

  // Handle manual creation
  const handleCreateManualInhabitants = useCallback(() => {
    if (!manualWealth || !manualPowerStructure || !manualDevelopment ||
        !manualGovernance || !manualSourceOfPower) {
      console.error("All fields must be filled for manual creation");
      return;
    }

    // Find entries from tables
    const wealthEntry = WEALTH_TABLE.find(w => w.label === manualWealth);
    const powerEntry = POWER_STRUCTURE_TABLE.find(p => p.structure === manualPowerStructure);
    const govEntry = GOVERNANCE_TABLE.find(g => g.governance === manualGovernance);
    const sourceEntry = SOURCE_OF_POWER_TABLE.find(s => s.source === manualSourceOfPower);

    if (wealthEntry) {
      setWealth(wealthEntry.label);
      setWealthValue(wealthEntry.wealth);
      setWealthRoll(null);
    }

    if (powerEntry) {
      setPowerStructure(powerEntry.structure);
      setPowerStructureRoll(null);
    }

    setDevelopment(manualDevelopment);

    if (govEntry) {
      setGovernance(govEntry.governance);
      setGovernanceRoll(null);
    }

    if (sourceEntry) {
      setSourceOfPower(sourceEntry.source);
      setSourceOfPowerRoll(null);
    }

    console.log("✍️ Created manual inhabitants");
  }, [manualWealth, manualPowerStructure, manualDevelopment, manualGovernance, manualSourceOfPower]);

  // Save data
  const saveData = useCallback(() => {
    const data: InhabitantsData = {
      population,
      wealthRoll: wealthRoll ?? undefined,
      wealth,
      wealthValue,
      powerStructureRoll: powerStructureRoll ?? undefined,
      powerStructure,
      development,
      developmentSoc: getDevelopmentSoc(development),
      governanceRoll: governanceRoll ?? undefined,
      governance,
      sourceOfPowerRoll: sourceOfPowerRoll ?? undefined,
      sourceOfPower,
      amberZone,
      amberZoneReason,
    };
    localStorage.setItem("inhabitants", JSON.stringify(data));
    console.log("💾 Saved inhabitants data");
  }, [
    population,
    wealthRoll,
    wealth,
    wealthValue,
    powerStructureRoll,
    powerStructure,
    development,
    getDevelopmentSoc,
    governanceRoll,
    governance,
    sourceOfPowerRoll,
    sourceOfPower,
    amberZone,
    amberZoneReason,
  ]);

  // Load world data from previous step
  useEffect(() => {
    const loadWorldData = () => {
      try {
        const mainWorldData = localStorage.getItem("mainWorld");
        if (mainWorldData) {
          const parsed = JSON.parse(mainWorldData);
          setWorldName(parsed.name || "Unknown World");
        }

        // Try to load existing inhabitants data
        const savedInhabitants = localStorage.getItem("inhabitants");
        if (savedInhabitants) {
          const data: InhabitantsData = JSON.parse(savedInhabitants);
          setPopulation(data.population);
          setWealthRoll(data.wealthRoll ?? null);
          setWealth(data.wealth);
          setWealthValue(data.wealthValue);
          setPowerStructureRoll(data.powerStructureRoll ?? null);
          setPowerStructure(data.powerStructure);
          setDevelopment(data.development);
          setGovernanceRoll(data.governanceRoll ?? null);
          setGovernance(data.governance);
          setSourceOfPowerRoll(data.sourceOfPowerRoll ?? null);
          setSourceOfPower(data.sourceOfPower);
          setAmberZone(data.amberZone);
          setAmberZoneReason(data.amberZoneReason);
          console.log("✅ Loaded existing inhabitants data");
        }
      } catch (error) {
        console.error("Failed to load world or inhabitants data:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadWorldData();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialized && isFormComplete) {
      saveData();
    }
  }, [isInitialized, isFormComplete, saveData]);

  // Handler for Next button
  const handleNext = useCallback(() => {
    saveData();
    navigate("../world-starport");
  }, [navigate, saveData]);

  // Update Next button state
  useEffect(() => {
    if (context) {
      context.setNextDisabled(!isFormComplete);
      context.setNextHandler(() => handleNext);
    }
  }, [isFormComplete, handleNext, context]);

  // Keyboard shortcut for generation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "i" || e.key === "I") {
        handleGenerateInhabitants();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleGenerateInhabitants]);

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Inhabitants & Governance
          </h1>
          <p className="text-muted-foreground">
            Configure population and societal characteristics for <span className="font-semibold">{worldName}</span>. Press{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              I
            </kbd>{" "}
            to generate using 2D6 tables.
          </p>
        </div>

        {/* Alert if incomplete */}
        {!isFormComplete && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure all inhabitant parameters to proceed to the next step.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Population Input */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <Label htmlFor="population" className="text-lg font-semibold">
                  Population
                </Label>
              </div>
              <Input
                id="population"
                type="number"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="text-xl font-semibold text-center"
                placeholder="Enter population"
              />
              <p className="text-sm text-muted-foreground text-center font-medium">
                {formatPopulation(population)}
              </p>
            </div>
          </Card>

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
                      Procedural (2D6 Tables)
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
                <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-900">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-600" />
                        Procedural Generation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generate governance parameters using 2D6 rolls from Mneme tables.
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateInhabitants}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      Generate
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
                        Choose specific governance parameters from the complete list.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Wealth */}
                      <div>
                        <Label htmlFor="manual-wealth" className="mb-2 block">
                          Wealth
                        </Label>
                        <Select value={manualWealth} onValueChange={setManualWealth}>
                          <SelectTrigger id="manual-wealth">
                            <SelectValue placeholder="Select wealth level" />
                          </SelectTrigger>
                          <SelectContent>
                            {WEALTH_TABLE.map((entry) => (
                              <SelectItem key={entry.roll} value={entry.label}>
                                {entry.label} - {entry.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Power Structure */}
                      <div>
                        <Label htmlFor="manual-power" className="mb-2 block">
                          Power Structure
                        </Label>
                        <Select value={manualPowerStructure} onValueChange={setManualPowerStructure}>
                          <SelectTrigger id="manual-power">
                            <SelectValue placeholder="Select power structure" />
                          </SelectTrigger>
                          <SelectContent>
                            {POWER_STRUCTURE_TABLE.map((entry) => (
                              <SelectItem key={entry.roll} value={entry.structure}>
                                {entry.label} - {entry.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Development */}
                      <div>
                        <Label htmlFor="manual-development" className="mb-2 block">
                          Development Level
                        </Label>
                        <Select value={manualDevelopment} onValueChange={setManualDevelopment}>
                          <SelectTrigger id="manual-development">
                            <SelectValue placeholder="Select development" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEVELOPMENT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} (HDI: {option.hdi})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Governance */}
                      <div>
                        <Label htmlFor="manual-governance" className="mb-2 block">
                          Governance Quality
                        </Label>
                        <Select value={manualGovernance} onValueChange={setManualGovernance}>
                          <SelectTrigger id="manual-governance">
                            <SelectValue placeholder="Select governance" />
                          </SelectTrigger>
                          <SelectContent>
                            {GOVERNANCE_TABLE.map((entry) => (
                              <SelectItem key={entry.roll} value={entry.governance}>
                                {entry.label} - {entry.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Source of Power */}
                      <div className="sm:col-span-2">
                        <Label htmlFor="manual-source" className="mb-2 block">
                          Source of Power
                        </Label>
                        <Select value={manualSourceOfPower} onValueChange={setManualSourceOfPower}>
                          <SelectTrigger id="manual-source">
                            <SelectValue placeholder="Select source of power" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOURCE_OF_POWER_TABLE.map((entry) => (
                              <SelectItem key={entry.roll} value={entry.source}>
                                {entry.label} - {entry.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateManualInhabitants}
                      size="lg"
                      className="w-full mt-2"
                      disabled={!manualWealth || !manualPowerStructure || !manualDevelopment ||
                               !manualGovernance || !manualSourceOfPower}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Create Inhabitants
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </Card>

          {/* Development Level (always visible for adjustment) */}
          {isFormComplete && (
            <Card className="p-6">
              <div className="space-y-4">
                <Label htmlFor="development-adjust" className="text-base font-semibold flex items-center gap-2">
                  Development Level
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adjust the world's development level if needed</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={development} onValueChange={setDevelopment}>
                  <SelectTrigger id="development-adjust">
                    <SelectValue placeholder="Select development level" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVELOPMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} (HDI: {option.hdi})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          )}

          {/* Governance Summary */}
          {isFormComplete && (
            <div className="space-y-6">
              <Label className="text-lg font-semibold">Governance Summary</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wealth Card */}
                <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">💰</span>
                        <div>
                          <Badge variant="outline" className="border-green-600 text-green-600 mb-2">
                            Wealth
                          </Badge>
                          <CardTitle className="text-xl">{wealth}</CardTitle>
                        </div>
                      </div>
                      {wealthRoll && (
                        <Badge variant="secondary" className="font-mono">
                          2D6: {wealthRoll}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SOC Modifier:</span>
                        <span className="font-medium">
                          {wealthValue !== 0 ? `+${wealthValue}` : "±0"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Power Structure Card */}
                <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🏛️</span>
                        <div>
                          <Badge variant="outline" className="border-blue-600 text-blue-600 mb-2">
                            Power Structure
                          </Badge>
                          <CardTitle className="text-xl">{powerStructure}</CardTitle>
                        </div>
                      </div>
                      {powerStructureRoll && (
                        <Badge variant="secondary" className="font-mono">
                          2D6: {powerStructureRoll}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Governance Card */}
                <Card className="p-6 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">⚖️</span>
                        <div>
                          <Badge variant="outline" className="border-purple-600 text-purple-600 mb-2">
                            Governance
                          </Badge>
                          <CardTitle className="text-xl">{governance}</CardTitle>
                        </div>
                      </div>
                      {governanceRoll && (
                        <Badge variant="secondary" className="font-mono">
                          2D6: {governanceRoll}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Source of Power Card */}
                <Card className="p-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">👑</span>
                        <div>
                          <Badge variant="outline" className="border-amber-600 text-amber-600 mb-2">
                            Source of Power
                          </Badge>
                          <CardTitle className="text-xl">{sourceOfPower}</CardTitle>
                        </div>
                      </div>
                      {sourceOfPowerRoll && (
                        <Badge variant="secondary" className="font-mono">
                          2D6: {sourceOfPowerRoll}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Development & SOC Summary */}
              <Card className="p-6 bg-muted/30">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Development & Social Standing
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">Development:</span>
                          <span className="font-medium">
                            {DEVELOPMENT_OPTIONS.find(d => d.value === development)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HDI Range:</span>
                          <span className="font-medium">
                            {DEVELOPMENT_OPTIONS.find(d => d.value === development)?.hdi}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base SOC:</span>
                          <span className="font-medium">
                            {getDevelopmentSoc(development)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wealth Modifier:</span>
                          <span className="font-medium">
                            {wealthValue !== 0 ? `+${wealthValue}` : "±0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Amber Zone */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="amber-zone"
                      checked={amberZone}
                      onCheckedChange={(checked) => setAmberZone(checked as boolean)}
                    />
                    <Label
                      htmlFor="amber-zone"
                      className="text-base font-semibold cursor-pointer flex items-center gap-2"
                    >
                      Amber Zone Classification
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>World deemed dangerous; travelers should be cautious</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  </div>

                  {amberZone && (
                    <div>
                      <Label htmlFor="amber-reason" className="text-sm mb-2 block">
                        Amber Zone Reason
                      </Label>
                      <Select value={amberZoneReason} onValueChange={setAmberZoneReason}>
                        <SelectTrigger id="amber-reason">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {AMBER_ZONE_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              <span className="flex items-center gap-2">
                                <span>{reason.icon}</span>
                                <span>{reason.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {amberZoneReason && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <span className="text-xl">
                              {AMBER_ZONE_REASONS.find(r => r.value === amberZoneReason)?.icon}
                            </span>
                            <span className="font-medium">
                              ⚠️ {AMBER_ZONE_REASONS.find(r => r.value === amberZoneReason)?.label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Info Card */}
          {!isFormComplete && (
            <Card className="p-6 bg-muted/30">
              <div className="flex items-start gap-4">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">About Inhabitants & Governance</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Governance parameters are generated using 2D6 rolls from Mneme tables:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span><strong>Wealth:</strong> Economic prosperity affecting port quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span><strong>Power Structure:</strong> Political organization type</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span><strong>Governance:</strong> Quality and effectiveness of rule</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                      <span><strong>Source of Power:</strong> Basis of authority</span>
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
            Population and governance parameters help determine starport quality, world trade classification, and social dynamics.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
