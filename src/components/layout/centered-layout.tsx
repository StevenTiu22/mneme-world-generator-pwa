import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CenteredLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nextDisabled, setNextDisabled] = useState(true);
  const [nextHandler, setNextHandler] = useState<() => void>(() => () => {});

  // Define navigation logic based on current route
  const getNavigationConfig = () => {
    const path = location.pathname;

    switch (path) {
      case "/create-new":
        return {
          showPrevious: false,
          showNext: true,
          previousPath: "/",
        };
      case "/create-new/primary-star":
        return {
          showPrevious: true,
          showNext: true,
          previousPath: "/create-new",
        };
      case "/create-new/companion-star":
        return {
          showPrevious: true,
          showNext: true,
          previousPath: "/create-new/primary-star",
        };
      case "/create-new/main-world":
        return {
          showPrevious: true,
          showNext: true,
          previousPath: "/create-new/companion-star",
        };
      default:
        return {
          showPrevious: false,
          showNext: false,
        };
    }
  };

  const navConfig = getNavigationConfig();

  const handlePrevious = () => {
    if (navConfig.previousPath) {
      navigate(navConfig.previousPath);
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    nextHandler();
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
