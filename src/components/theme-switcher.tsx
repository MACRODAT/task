"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  { name: "Zinc", class: "zinc" },
  { name: "Rose", class: "theme-rose" },
  { name: "Blue", class: "theme-blue" },
];

export function ThemeSwitcher() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [currentThemeClass, setCurrentThemeClass] = React.useState(theme)

  const handleThemeChange = (newTheme: string, newClass: string) => {
    // Remove existing theme classes
    document.body.classList.remove("theme-rose", "theme-blue", "zinc");
    
    // Add the new theme class
    if (newClass !== "zinc") {
      document.body.classList.add(newClass);
    }
    
    setTheme(newTheme)
    setCurrentThemeClass(newClass)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light", "zinc")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark", "zinc")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange(resolvedTheme === 'dark' ? 'dark' : 'light', 'theme-rose')}>
          Rose
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange(resolvedTheme === 'dark' ? 'dark' : 'light', 'theme-blue')}>
          Blue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
