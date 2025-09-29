import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FilePlus, FolderOpen } from "lucide-react";

export function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
      <h1 className="text-5xl font-extrabold tracking-tighter md:text-7xl text-foreground [text-shadow:0_0_15px_hsl(var(--primary)),0_0_40px_hsl(var(--primary))]">
        Ready to Generate Worlds?
      </h1>

      <p className="mt-4 mb-12 font-mono text-sm uppercase tracking-widest text-muted-foreground dark:text-muted-foreground/80">
        System Online // Awaiting Command
      </p>

      <div className="flex flex-col items-center gap-4">
        <Button
          asChild
          size="lg"
          className="w-full max-w-xs px-8 py-6 text-base font-semibold bg-slate-800/50 border border-slate-700 text-slate-300 transition-colors hover:border-accent hover:text-accent"
        >
          <Link to="/create-new">
            <FilePlus className="mr-3 h-5 w-5" />
            Create New World
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          className="w-full max-w-xs px-8 py-6 text-base font-semibold bg-slate-900/50 border border-slate-700 text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          <Link to="/my-worlds">
            <FolderOpen className="mr-3 h-5 w-5" />
            Open Existing World
          </Link>
        </Button>
      </div>
    </div>
  );
}
