import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Better type for the context
export interface CenteredLayoutContext {
  setNextDisabled: (disabled: boolean) => void;
  setNextHandler: (handler: () => void) => void;
  setFinishHandler?: (handler: () => void) => void;
}

// Navigation route configuration
interface RouteConfig {
  showPrevious: boolean;
  showNext: boolean;
  showFinish?: boolean;
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
    nextPath: "/create-new/main-world",
  },
  "/create-new/main-world": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/companion-star",
    nextPath: "/create-new/world-culture",
  },
  "/create-new/world-culture": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/main-world",
    nextPath: "/create-new/habitability",
  },
  "/create-new/habitability": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/world-culture",
    nextPath: "/create-new/inhabitants",
  },
  "/create-new/inhabitants": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/habitability",
    nextPath: "/create-new/world-starport",
  },
  "/create-new/world-starport": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/inhabitants",
    nextPath: "/create-new/position",
  },
  "/create-new/position": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/world-starport",
    nextPath: "/create-new/moons",
  },
  "/create-new/moons": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/position",
    nextPath: "/create-new/secondary-planets",
  },
  "/create-new/secondary-planets": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/moons",
    nextPath: "/create-new/planetary-system",
  },
  "/create-new/planetary-system": {
    showPrevious: true,
    showNext: false,
    previousPath: "/create-new/secondary-planets",
  },
};

export function CenteredLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nextDisabled, setNextDisabled] = useState(true);
  const [nextHandler, setNextHandler] = useState<() => void>(() => () => {});
  const [finishHandler, setFinishHandler] = useState<() => void>(
    () => () => {}
  );
  const [showButtons, setShowButtons] = useState(false);

  const navConfig: RouteConfig = ROUTE_CONFIG[location.pathname] || {
    showPrevious: false,
    showNext: false,
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Show buttons when user has scrolled to within 100px of the bottom
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      setShowButtons(distanceFromBottom <= 100);
    };

    // Check on mount
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);

    // Also check on resize (in case content height changes)
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Reset button visibility when route changes
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      setShowButtons(distanceFromBottom <= 100);
    };

    // Check immediately on route change
    setTimeout(handleScroll, 100);
  }, [location.pathname]);

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

  const handleFinish = () => {
    if (finishHandler) {
      finishHandler();
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Sticky Back to Home link */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center px-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main content area with centered content */}
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 pb-32">
        <div className="w-full">
          <Outlet
            context={{ setNextDisabled, setNextHandler, setFinishHandler }}
          />
        </div>
      </div>

      {/* Fixed navigation buttons at bottom right - only visible when scrolled to bottom */}
      {(navConfig.showPrevious ||
        navConfig.showNext ||
        navConfig.showFinish) && (
        <div
          className={`fixed bottom-8 right-8 z-40 flex gap-4 transition-all duration-300 ${
            showButtons
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {navConfig.showPrevious && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              className="gap-2 shadow-lg"
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
              className="gap-2 shadow-lg"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {navConfig.showFinish && (
            <Button
              size="lg"
              onClick={handleFinish}
              className="gap-2 shadow-lg"
            >
              <Check className="h-4 w-4" />
              Finish & Save
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
