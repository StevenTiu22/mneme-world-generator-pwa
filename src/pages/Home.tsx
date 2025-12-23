import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FilePlus, FolderOpen } from "lucide-react";

export function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 animate-in fade-in duration-1000">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tighter text-foreground [text-shadow:0_0_15px_hsl(var(--primary)),0_0_40px_hsl(var(--primary))]">
        Ready to Generate Worlds?
      </h1>

      <p className="mt-4 mb-8 sm:mb-12 font-mono text-xs sm:text-sm uppercase tracking-widest text-muted-foreground dark:text-muted-foreground/80">
        System Online // Awaiting Command
      </p>

      <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-xs">
        <Button
          asChild
          size="lg"
          className="w-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold bg-slate-800/50 border border-slate-700 text-slate-300 transition-colors hover:border-accent hover:text-accent"
        >
          <Link to="/create-new">
            <FilePlus className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
            Create New World
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          className="w-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold bg-slate-900/50 border border-slate-700 text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          <Link to="/my-worlds">
            <FolderOpen className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
            Open Existing World
          </Link>
        </Button>
      </div>
    </div>
  );
}
