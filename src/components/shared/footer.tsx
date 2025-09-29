import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t bg-background/80 py-6 text-muted-foreground transition-colors dark:bg-background/40">
      <div className="container mx-auto text-center space-y-2">
        <p className="text-sm">Owned by Justin Cesar Aquino</p>
        <Link
          to="https://discord.com/users/justinaquino"
          className="gap-4 inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary dark:hover:text-primary"
        >
          <FaDiscord className="h-4 w-4" />
          @justinaquino
        </Link>
      </div>
    </footer>
  );
}
