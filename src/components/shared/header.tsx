// import { NavLink } from "react-router-dom";
import { Search, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Button } from "../ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <NavigationMenu className="w-full max-w-none h-fit sticky">
      <div className="flex items-center justify-between w-full px-4">
        <h1 className="font-semibold">Mneme World Generator</h1>
        <NavigationMenuList className="flex items-center gap-6">
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/create-new">Create New</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/my-worlds">My Worlds</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              type="text"
              className="w-96 pl-10 rounded-xl"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </NavigationMenu>
  );
}
