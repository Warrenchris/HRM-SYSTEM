import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Download, 
  Upload, 
  Shield, 
  Calendar, 
  HardDrive,
  Cloud,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function BackupSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Automated Backups
          </CardTitle>
          <CardDescription>
            Configure automatic backup schedules and retention policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Automated Backups</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup your data on a schedule
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Backup Time</Label>
              <Input type="time" defaultValue="02:00" />
              <p className="text-xs text-muted-foreground">
                When to run scheduled backups (UTC)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Retention Period (Days)</Label>
            <Input type="number" defaultValue="30" min="7" max="365" />
            <p className="text-xs text-muted-foreground">
              How long to keep backup files
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compress Backups</Label>
              <p className="text-sm text-muted-foreground">
                Reduce backup file size using compression
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Backup Storage
          </CardTitle>
          <CardDescription>
            Configure where your backups are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cloud className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Cloud Storage</h4>
                  <p className="text-sm text-muted-foreground">AWS S3 / Google Cloud</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <HardDrive className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium">Local Storage</h4>
                  <p className="text-sm text-muted-foreground">Server local disk</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Inactive</Badge>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Storage Usage</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Backup Storage Used</span>
                <span>2.4 GB / 10 GB</span>
              </div>
              <Progress value={24} className="w-full" />
              <p className="text-xs text-muted-foreground">
                7.6 GB remaining in your backup storage quota
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Backups
          </CardTitle>
          <CardDescription>
            View and manage your recent backup files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Daily Backup - Today</h4>
                  <p className="text-sm text-muted-foreground">2024-01-20 02:00 UTC • 125 MB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">Restore</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Daily Backup - Yesterday</h4>
                  <p className="text-sm text-muted-foreground">2024-01-19 02:00 UTC • 124 MB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">Restore</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium">Weekly Backup - Failed</h4>
                  <p className="text-sm text-muted-foreground">2024-01-18 02:00 UTC • Storage quota exceeded</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Retry</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Data Import/Export
          </CardTitle>
          <CardDescription>
            Import or export your HR data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Import Data</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Import employee data, attendance records, or other HR information from CSV files
                </p>
                <Button variant="outline" className="w-full">
                  Select File to Import
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Export Data</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export your current HR data in various formats for analysis or migration
                </p>
                <Button variant="outline" className="w-full">
                  Export All Data
                </Button>
              </div>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Export Options</h4>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="employees" defaultChecked />
                <Label htmlFor="employees">Employee Records</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="attendance" defaultChecked />
                <Label htmlFor="attendance">Attendance Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="payroll" />
                <Label htmlFor="payroll">Payroll Records</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="performance" />
                <Label htmlFor="performance">Performance Reviews</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm text-blue-800">
              All backups are encrypted using AES-256 encryption
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm text-blue-800">
              Backup transfers use TLS encryption in transit
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm text-blue-800">
              Access to backups requires administrator privileges
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Create Manual Backup</Button>
        <Button>Save Backup Settings</Button>
      </div>
    </div>
  );
}