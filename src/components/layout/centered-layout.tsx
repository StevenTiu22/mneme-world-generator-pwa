import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

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
    nextPath: "/create-new/circumstellar-disks",
  },
  "/create-new/circumstellar-disks": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/moons",
    nextPath: "/create-new/secondary-planets",
  },
  "/create-new/secondary-planets": {
    showPrevious: true,
    showNext: true,
    previousPath: "/create-new/circumstellar-disks",
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
  const [nextHandler, setNextHandlerState] = useState<() => void>(() => () => {});
  const [finishHandler, setFinishHandlerState] = useState<() => void>(
    () => () => {}
  );

  // Wrap setters to avoid React's updater function behavior
  // When passing a function to setState, React calls it as (prevState) => newState
  // We need to wrap it to force React to use the function as the actual value
  // Using useCallback to prevent recreation on every render
  const setNextHandler = useCallback((handler: () => void) => {
    setNextHandlerState(() => handler);
  }, []);

  const setFinishHandler = useCallback((handler: () => void) => {
    setFinishHandlerState(() => handler);
  }, []);

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

    // Observe DOM changes to re-check scroll position when content loads dynamically
    // This is crucial for pages that load data asynchronously (like Starport page)
    const observer = new MutationObserver(() => {
      // Debounce the check to avoid excessive calls
      setTimeout(handleScroll, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'], // Only watch style/class changes that might affect layout
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      observer.disconnect();
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

    // Also check after a longer delay to catch slower-loading content
    setTimeout(handleScroll, 500);
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
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-2 sm:p-4 pb-24 md:pb-32">
        <div className="w-full">
          <Outlet
            context={{ setNextDisabled, setNextHandler, setFinishHandler }}
          />
        </div>
      </div>

      {/* Fixed navigation buttons - mobile: bottom-center stacked, desktop: bottom-right horizontal */}
      {(navConfig.showPrevious ||
        navConfig.showNext ||
        navConfig.showFinish) && (
        <div
          className={cn(
            "fixed z-40 transition-all duration-300",
            "left-1/2 -translate-x-1/2 bottom-4 flex flex-col gap-2 w-[calc(100%-2rem)]",
            "md:left-auto md:translate-x-0 md:right-8 md:bottom-8 md:flex-row md:gap-4 md:w-auto",
            // On mobile (< md): always visible
            // On desktop (>= md): only visible when scrolled to bottom
            showButtons
              ? "opacity-100 translate-y-0"
              : "opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:pointer-events-none"
          )}
        >
          {navConfig.showPrevious && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              className="gap-2 shadow-lg w-full md:w-auto"
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
              className="gap-2 shadow-lg w-full md:w-auto"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {navConfig.showFinish && (
            <Button
              size="lg"
              onClick={handleFinish}
              className="gap-2 shadow-lg w-full md:w-auto"
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
