import logo from "@/assets/230109-game-in-the-brain-logo-e1723817632320-150x150.png";
import { Sun, Moon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full py-8 px-24">
      <NavigationMenu className="w-full max-w-none h-fit sticky">
        <div className="flex items-center justify-between w-full px-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Mneme Logo"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-semibold text-lg">Mneme World Generator</span>
          </Link>
          <NavigationMenuList className="flex items-center gap-6">
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <NavLink to="/">Home</NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <NavLink to="/create-new">Create New</NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <NavLink to="/my-worlds">My Worlds</NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
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
    </header>
  );
}
