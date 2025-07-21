import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Shield, Bell, Database, Clock, Save, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  is_system_setting: boolean;
  updated_at: string;
}

export function UserSettings() {
  const [settings, setSettings] = useState<UserSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
        return;
      }

      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (settingKey: string, newValue: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update setting",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Setting Updated",
        description: "Setting has been updated successfully",
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setEditingKey(null);
    }
  };

  const formatSettingValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const parseSettingValue = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'authentication':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'notifications':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'system':
        return <Database className="h-4 w-4 text-green-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, UserSetting[]>);

  const renderSettingValue = (setting: UserSetting) => {
    const value = setting.setting_value;
    
    if (editingKey === setting.setting_key) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleUpdateSetting(setting.setting_key, parseSettingValue(editValue))}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingKey(null)}
          >
            Cancel
          </Button>
        </div>
      );
    }

    // Handle different types of settings
    if (setting.setting_key === 'email_notifications' && typeof value === 'object') {
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={value?.enabled || false}
            onCheckedChange={(checked) => 
              handleUpdateSetting(setting.setting_key, { ...value, enabled: checked })
            }
          />
          <span className="text-sm">
            {value?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div className="space-y-2">
          <pre className="text-xs bg-muted p-2 rounded max-w-xs overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
          {!setting.is_system_setting && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingKey(setting.setting_key);
                setEditValue(JSON.stringify(value, null, 2));
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{String(value)}</span>
        {!setting.is_system_setting && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingKey(setting.setting_key);
              setEditValue(String(value));
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage system-wide settings and configurations
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading settings...</div>
          ) : (
            <Tabs defaultValue="security" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                <TabsContent key={category} value={category.toLowerCase()} className="space-y-4">
                  <div className="grid gap-4">
                    {categorySettings.map((setting) => (
                      <Card key={setting.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(category)}
                                <h3 className="font-medium">
                                  {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h3>
                                {setting.is_system_setting && (
                                  <Badge variant="outline" className="text-xs">
                                    System
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Last updated: {new Date(setting.updated_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="ml-4">
                              {renderSettingValue(setting)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
            <Button variant="outline" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Clear Audit Logs
            </Button>
            <Button variant="outline" className="justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Test Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}