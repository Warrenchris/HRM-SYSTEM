import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Save, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    destructive: string;
    muted: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
  };
}

export function CustomThemeCreator() {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const { toast } = useToast();

  const defaultTheme: Omit<CustomTheme, 'id'> = {
    name: "",
    description: "",
    colors: {
      primary: "213 94% 68%",
      secondary: "210 40% 98%",
      accent: "210 40% 96%",
      destructive: "0 84% 60%",
      muted: "210 40% 96%",
      background: "0 0% 100%",
      foreground: "222 84% 5%",
      card: "0 0% 100%",
      border: "214 32% 91%",
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("hrm-custom-themes");
    if (saved) {
      setCustomThemes(JSON.parse(saved));
    }
  }, []);

  const saveCustomThemes = (themes: CustomTheme[]) => {
    localStorage.setItem("hrm-custom-themes", JSON.stringify(themes));
    setCustomThemes(themes);
  };

  const handleCreateTheme = () => {
    setEditingTheme({
      ...defaultTheme,
      id: `custom-${Date.now()}`,
    });
    setIsCreating(true);
  };

  const handleSaveTheme = () => {
    if (!editingTheme || !editingTheme.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a theme name",
        variant: "destructive",
      });
      return;
    }

    const existingIndex = customThemes.findIndex(t => t.id === editingTheme.id);
    let updatedThemes;

    if (existingIndex >= 0) {
      updatedThemes = [...customThemes];
      updatedThemes[existingIndex] = editingTheme;
    } else {
      updatedThemes = [...customThemes, editingTheme];
    }

    saveCustomThemes(updatedThemes);
    applyCustomTheme(editingTheme);
    setIsCreating(false);
    setEditingTheme(null);

    toast({
      title: "Success",
      description: "Custom theme saved and applied",
    });
  };

  const handleDeleteTheme = (themeId: string) => {
    const updatedThemes = customThemes.filter(t => t.id !== themeId);
    saveCustomThemes(updatedThemes);
    
    toast({
      title: "Success", 
      description: "Custom theme deleted",
    });
  };

  const applyCustomTheme = (theme: CustomTheme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    const existingClasses = Array.from(root.classList).filter(c => c.startsWith('theme-'));
    existingClasses.forEach(c => root.classList.remove(c));

    // Apply custom theme variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Save to localStorage
    localStorage.setItem("hrm-theme", theme.id);
    localStorage.setItem("hrm-current-custom-theme", JSON.stringify(theme));
  };

  const hslToHex = (hsl: string) => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    const hDecimal = h / 360;
    const sDecimal = s / 100;
    const lDecimal = l / 100;

    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs((hDecimal * 6) % 2 - 1));
    const m = lDecimal - c / 2;

    let r, g, b;
    if (hDecimal < 1/6) [r, g, b] = [c, x, 0];
    else if (hDecimal < 2/6) [r, g, b] = [x, c, 0];
    else if (hDecimal < 3/6) [r, g, b] = [0, c, x];
    else if (hDecimal < 4/6) [r, g, b] = [0, x, c];
    else if (hDecimal < 5/6) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const l = (max + min) / 2;
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

    return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Custom Theme Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Theme Button */}
        {!isCreating && (
          <Button onClick={handleCreateTheme} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Theme
          </Button>
        )}

        {/* Theme Creator/Editor */}
        {(isCreating || editingTheme) && editingTheme && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input
                  id="theme-name"
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme({
                    ...editingTheme,
                    name: e.target.value
                  })}
                  placeholder="My Custom Theme"
                />
              </div>
              <div>
                <Label htmlFor="theme-description">Description</Label>
                <Input
                  id="theme-description"
                  value={editingTheme.description}
                  onChange={(e) => setEditingTheme({
                    ...editingTheme,
                    description: e.target.value
                  })}
                  placeholder="A beautiful custom theme"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(editingTheme.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hslToHex(value)}
                      onChange={(e) => setEditingTheme({
                        ...editingTheme,
                        colors: {
                          ...editingTheme.colors,
                          [key]: hexToHsl(e.target.value)
                        }
                      })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={value}
                      onChange={(e) => setEditingTheme({
                        ...editingTheme,
                        colors: {
                          ...editingTheme.colors,
                          [key]: e.target.value
                        }
                      })}
                      placeholder="h s% l%"
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveTheme}>
                <Save className="h-4 w-4 mr-2" />
                Save Theme
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingTheme(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Custom Themes List */}
        {customThemes.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Your Custom Themes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{theme.name}</h5>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTheme(theme)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTheme(theme.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(theme.colors).slice(0, 5).map(([key, value]) => (
                      <div
                        key={key}
                        className="w-6 h-6 rounded border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${value})` }}
                        title={key}
                      />
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => applyCustomTheme(theme)}
                    className="w-full"
                  >
                    Apply Theme
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}