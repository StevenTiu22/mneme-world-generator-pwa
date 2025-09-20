// import { NavLink } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

export function Header() {
  // const { setTheme } = useTheme();

  return (
    <NavigationMenu className="w-full max-w-none h-fit">
      <NavigationMenuList className="w-full flex relative gap-x-100">
        <NavigationMenuItem>
          <h1>Mneme World Generator</h1>
        </NavigationMenuItem>
        <div className="flex-1 flex items-center justify-center">
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/home">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link to="/">Create New</Link>
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
        </div>
        <NavigationMenuItem>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              type="text"
              className="w-96 pl-10 rounded-xl"
            />
          </div>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
