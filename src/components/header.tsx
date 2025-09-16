import { NavLink } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Header() {
    const { setTheme } = useTheme()

    const navLinkClass = ({ isActive }:{ isActive: boolean }) => cn(
        "px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
            ? "bg-secondary text-primary"
            : "text-text/70 hover:bg-secondary/50 hover:text-text"
    )

    return (
        <header className="sticky top-0 z-50 w-full border-b border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex items-center">
                <span className="font-bold text-lg">Mneme World Gen</span>
                </div>

                <nav className="flex items-center space-x-4 lg:space-x-6">
                <NavLink to="/" className={navLinkClass}>Generator</NavLink>
                <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
                <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
                </nav>

                <div className="flex flex-1 items-center justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </div>
        </header>
    )
}