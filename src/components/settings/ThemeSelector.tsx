import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Check } from "lucide-react";

const themes = [
  {
    id: "default",
    name: "Professional Blue",
    description: "Classic corporate blue theme",
    primary: "hsl(213 94% 68%)",
    className: "",
  },
  {
    id: "green",
    name: "Green Corporate",
    description: "Nature-inspired professional theme",
    primary: "hsl(142 71% 45%)",
    className: "theme-green",
  },
  {
    id: "purple",
    name: "Purple Executive",
    description: "Premium executive theme",
    primary: "hsl(262 83% 58%)",
    className: "theme-purple",
  },
  {
    id: "orange",
    name: "Orange Dynamic",
    description: "Energetic and modern theme",
    primary: "hsl(24 94% 53%)",
    className: "theme-orange",
  },
  {
    id: "teal",
    name: "Teal Modern",
    description: "Contemporary tech theme",
    primary: "hsl(173 80% 40%)",
    className: "theme-teal",
  },
  {
    id: "red",
    name: "Red Corporate",
    description: "Bold and confident theme",
    primary: "hsl(0 72% 51%)",
    className: "theme-red",
  },
];

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState("default");

  useEffect(() => {
    const savedTheme = localStorage.getItem("hrm-theme") || "default";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Remove all theme classes
    themes.forEach(t => {
      if (t.className) {
        document.documentElement.classList.remove(t.className);
      }
    });

    // Apply new theme class
    if (theme.className) {
      document.documentElement.classList.add(theme.className);
    }

    localStorage.setItem("hrm-theme", themeId);
    setCurrentTheme(themeId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                currentTheme === theme.id
                  ? "border-primary shadow-medium"
                  : "border-border hover:border-muted-foreground"
              }`}
              onClick={() => applyTheme(theme.id)}
            >
              {currentTheme === theme.id && (
                <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
              )}
              
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                />
                <div>
                  <h3 className="font-medium">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
              
              {currentTheme === theme.id && (
                <Badge variant="default" className="mt-2">
                  Active
                </Badge>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Preview</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm">Primary Button</Button>
            <Button variant="secondary" size="sm">Secondary</Button>
            <Button variant="outline" size="sm">Outline</Button>
            <Badge>Sample Badge</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}