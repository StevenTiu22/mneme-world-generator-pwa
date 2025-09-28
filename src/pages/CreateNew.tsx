import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // 1. Import Card components
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type CreationMode = "quick" | "custom";

export function CreateNewPage() {
  const [selection, setSelection] = useState<CreationMode | null>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (selection) {
      navigate(`/create-new/${selection}`);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-500">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-center md:text-left">
        How do you want to create your world?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Option 1: Quick Generate (using Card component) */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setSelection("quick")}
          onKeyDown={(e) => e.key === "Enter" && setSelection("quick")}
          className={cn(
            "h-64 cursor-pointer transition-colors flex flex-col", // Use flexbox to position content
            selection === "quick" ? "border-primary" : "hover:border-slate-400"
          )}
        >
          <CardHeader className="flex-row items-center justify-end p-4">
            <ShieldCheck
              className={cn(
                "h-5 w-5",
                selection === "quick" ? "text-primary" : "text-muted-foreground"
              )}
            />
          </CardHeader>
          <CardContent className="flex-grow flex items-end p-4">
            <h2 className="text-base font-medium">Quick Generate</h2>
          </CardContent>
        </Card>

        {/* Option 2: Create Customized World (using Card component) */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setSelection("custom")}
          onKeyDown={(e) => e.key === "Enter" && setSelection("custom")}
          className={cn(
            "h-64 cursor-pointer transition-colors flex flex-col",
            selection === "custom" ? "border-primary" : "hover:border-slate-400"
          )}
        >
          {/* This card has no icon, so the header is empty or omitted */}
          <CardHeader className="p-4"></CardHeader>
          <CardContent className="flex-grow flex items-end p-4">
            <h2 className="text-base font-medium">Create Customized World</h2>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="lg"
          disabled={!selection}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
