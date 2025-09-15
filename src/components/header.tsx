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
}