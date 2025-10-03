import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Better type for the context
export interface CenteredLayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
}

// Navigation route configuration
interface RouteConfig {
  showPrevious: boolean;
  showNext: boolean;
  previousPath?: string;
  nextPath?: string;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  "/create-new": {
    showPrevious: false,
    showNext: true,
    previousPath: "/",
  },
  "/create-new/primary-star": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new",
  },
  "/create-new/world-context": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/primary-star",
  },
  "/create-new/companion-star": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/world-context",
  },
  "/create-new/main-world": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/companion-star",
  },
  "/create-new/habitability": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/main-world",
  },
};

export function CenteredLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nextDisabled, setNextDisabled] = useState(true);
  const [nextHandler, setNextHandler] = useState<() => void>(() => () => {});

  const navConfig: RouteConfig = ROUTE_CONFIG[location.pathname] || {
    showPrevious: false,
    showNext: false,
  };

  const handlePrevious = () => {
    if (navConfig.previousPath) {
      navigate(navConfig.previousPath);
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (nextHandler) {
      nextHandler();
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Link
        to="/"
        className="absolute top-8 left-8 z-10 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="min-h-screen flex items-center justify-center p-4">
        <Outlet context={{ setNextDisabled, setNextHandler }} />
      </div>

      {/* Fixed navigation buttons at bottom right */}
      {(navConfig.showPrevious || navConfig.showNext) && (
        <div className="fixed bottom-8 right-8 z-10 flex gap-4">
          {navConfig.showPrevious && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
          {navConfig.showNext && (
            <Button
              variant="outline"
              size="lg"
              disabled={nextDisabled}
              onClick={handleNext}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
