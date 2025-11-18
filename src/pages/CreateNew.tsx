import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type CreationMode = "quick" | "custom";

interface LayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => () => void) => void;
}

export function CreateNewPage() {
  const [selection, setSelection] = useState<CreationMode | null>(null);
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContext>();

  // Create a stable handler reference that navigates based on selection
  const handleNext = useCallback(() => {
    if (selection === "custom") {
      navigate("primary-star");
    } else if (selection === "quick") {
      navigate("quick");
    }
  }, [selection, navigate]);

  // Update Next button state based on selection
  useEffect(() => {
    if (context) {
      // Enable/disable Next button
      context.setNextDisabled(!selection);

      // Set Next button handler - wrap in a function to avoid immediate execution
      context.setNextHandler(() => handleNext);
    }
  }, [selection, handleNext, context]);

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-center md:text-left">
        How do you want to create your world?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Option 1: Quick Generate (using Card component) */}
        <Card
          role="button"
          onClick={() => setSelection("quick")}
          onKeyDown={(e) => e.key === "Enter" && setSelection("quick")}
          className={cn(
            "h-64 cursor-pointer transition-colors flex flex-col items-center justify-center",
            selection === "quick" ? "border-primary" : "hover:border-slate-400"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
            <Zap
              className={cn(
                "h-12 w-12",
                selection === "quick" ? "text-primary" : "text-muted-foreground"
              )}
            />
            <h2 className="text-base font-medium">Quick Generate</h2>
          </CardContent>
        </Card>

        {/* Option 2: Create Customized World (using Card component) */}
        <Card
          role="button"
          onClick={() => setSelection("custom")}
          onKeyDown={(e) => e.key === "Enter" && setSelection("custom")}
          className={cn(
            "h-64 cursor-pointer transition-colors flex flex-col items-center justify-center",
            selection === "custom" ? "border-primary" : "hover:border-slate-400"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
            <Settings
              className={cn(
                "h-12 w-12",
                selection === "custom"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            />
            <h2 className="text-base font-medium">Create Customized World</h2>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
