import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key, Eye, AlertTriangle, Users } from "lucide-react";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Configure user authentication and password policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all user accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                Recommended
              </Badge>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Password Minimum Length</Label>
              <Input type="number" defaultValue="8" min="6" max="32" />
            </div>

            <div className="space-y-2">
              <Label>Password Expiry (Days)</Label>
              <Input type="number" defaultValue="90" min="30" max="365" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Special Characters</Label>
              <p className="text-sm text-muted-foreground">
                Passwords must include symbols and numbers
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Max Login Attempts</Label>
              <Input type="number" defaultValue="5" min="3" max="10" />
            </div>

            <div className="space-y-2">
              <Label>Account Lockout Duration (Minutes)</Label>
              <Input type="number" defaultValue="30" min="5" max="180" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Manage access permissions and role-based security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Role-Based Access Control</Label>
              <p className="text-sm text-muted-foreground">
                Enable granular permission management
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Address Restrictions</Label>
              <p className="text-sm text-muted-foreground">
                Limit access to specific IP ranges
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Default User Role</Label>
            <Select defaultValue="employee">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">HR Staff</SelectItem>
                <SelectItem value="viewer">Read Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Session Timeout (Hours)</Label>
            <Input type="number" defaultValue="8" min="1" max="24" />
            <p className="text-xs text-muted-foreground">
              Automatically log out inactive users
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Audit & Monitoring
          </CardTitle>
          <CardDescription>
            Configure security monitoring and audit logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all user actions and system changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Failed Login Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Send alerts for suspicious login attempts
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Real-time Security Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Monitor for security threats and anomalies
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Log Retention Period (Days)</Label>
            <Input type="number" defaultValue="365" min="90" max="2555" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-orange-500" />
            <div>
              <p className="text-sm text-orange-800">
                Enable two-factor authentication for all administrator accounts
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-orange-500" />
            <div>
              <p className="text-sm text-orange-800">
                Regularly review user permissions and remove unused accounts
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-orange-500" />
            <div>
              <p className="text-sm text-orange-800">
                Configure backup authentication methods for critical users
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
}