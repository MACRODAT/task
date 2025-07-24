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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const themes = [
  { name: "Zinc", class: "zinc" },
  { name: "Red", class: "theme-red" },
  { name: "Blue", class: "theme-blue" },
];

const localStorageKey = "custom-theme-vars";

export function ThemeSwitcher() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [currentThemeClass, setCurrentThemeClass] = React.useState(theme)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    // Load custom theme from localStorage on mount
    const savedTheme = localStorage.getItem(localStorageKey);
    if (savedTheme) {
      try {
        const customVars = JSON.parse(savedTheme);
        for (const [variable, value] of Object.entries(customVars)) {
          document.documentElement.style.setProperty(variable, value as string);
        }
      } catch (error) {
        console.error("Failed to parse custom theme from localStorage:", error);
      }
    }
  }, []);

  const handleThemeChange = (newTheme: string, newClass: string) => {
    // Remove existing theme classes
    document.body.classList.remove("theme-red", "theme-blue", "zinc");
    
    // Add the new theme class
    if (newClass !== "zinc") {
      document.body.classList.add(newClass);
    }
    
    setTheme(newTheme)
    setCurrentThemeClass(newClass)

    // Clear custom theme from localStorage when switching to a preset theme
    localStorage.removeItem(localStorageKey);
  }

  const handleCustomThemeChange = (variable: string, value: string) => {
    document.documentElement.style.setProperty(variable, value);

    // Save custom theme to localStorage
    const savedTheme = localStorage.getItem(localStorageKey);
    const customVars = savedTheme ? JSON.parse(savedTheme) : {};
    customVars[variable] = value;
    localStorage.setItem(localStorageKey, JSON.stringify(customVars));
  }

  const themeVariableGroups = [
    {
      name: "Background & Foreground",
      variables: [
        "--background",
        "--foreground",
        "--card",
        "--card-foreground",
        "--popover",
      ],
    },
    {
      name: "Popover & Primary",
      variables: [
        "--popover-foreground",
        "--primary",
        "--primary-foreground",
        "--secondary",
        "--secondary-foreground",
      ],
    },
    {
      name: "Muted & Accent",
      variables: [
        "--muted",
        "--muted-foreground",
        "--accent",
        "--accent-foreground",
      ],
    },
    {
      name: "Destructive & Border",
      variables: [
        "--destructive",
        "--destructive-foreground",
        "--border",
        "--input",
        "--ring",
      ],
    },
    {
      name: "Radius & Service",
      variables: [
        "--radius",
        "--service-prop",
        "--service-elec",
        "--service-chaud",
        "--service-sic",
      ],
    },
  ];


  return (
    <div className="flex items-center space-x-2">
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
          <DropdownMenuItem onClick={() => handleThemeChange(resolvedTheme === 'dark' ? 'dark' : 'light', 'theme-red')}>
            Red
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange(resolvedTheme === 'dark' ? 'dark' : 'light', 'theme-blue')}>
            Blue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Palette className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Customize theme</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Theme</DialogTitle>
            <DialogDescription>
              Adjust the CSS variables to create your own theme.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue={themeVariableGroups[0].name} className="w-full">
            <TabsList className="flex-wrap">
              {themeVariableGroups.map((group) => (
                <TabsTrigger key={group.name} value={group.name}>
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {themeVariableGroups.map((group) => (
              <TabsContent key={group.name} value={group.name}>
                <div className="grid gap-4 py-4">
                  {group.variables.map((variable) => (
                    <div key={variable} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={variable} className="text-right">
                        {variable}
                      </Label>
                      <Input
                        id={variable}
                        defaultValue={typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(variable).trim() : ''}
                        className="col-span-3"
                        onChange={(e) => handleCustomThemeChange(variable, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
