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
    <header className="w-full py-4 md:py-8 px-4 md:px-8 lg:px-24">
      <NavigationMenu className="w-full max-w-none h-fit sticky">
        <div className="flex items-center justify-between w-full px-0 md:px-4 gap-2">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img
              src={logo}
              alt="Mneme Logo"
              className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-cover flex-shrink-0"
            />
            <span className="font-semibold text-sm md:text-lg truncate">
              Mneme<span className="hidden sm:inline"> World Generator</span>
            </span>
          </Link>
          <NavigationMenuList className="flex items-center gap-2 md:gap-6">
            <NavigationMenuItem className="hidden md:block">
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
                <NavLink to="/create-new" className="text-xs md:text-sm">
                  Create New
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <NavLink to="/my-worlds" className="text-xs md:text-sm">
                  My Worlds
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          <div className="flex items-center flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle Theme"
              className="h-9 w-9 md:h-10 md:w-10"
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
