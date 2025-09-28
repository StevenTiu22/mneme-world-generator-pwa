import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function CenteredLayout() {
  return (
    // 1. The root container is now a 'relative' positioning context.
    <div className="relative min-h-screen bg-background">
      {/* 2. The "Back" link is positioned absolutely within the root container. */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-10 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      {/* 3. The main content area remains a centered flex container, ignoring the absolute link. */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
}
