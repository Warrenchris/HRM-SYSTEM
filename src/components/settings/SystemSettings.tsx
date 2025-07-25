import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Monitor, Moon, Sun, Globe, Clock, Calendar, Fingerprint, Shield } from "lucide-react";

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select defaultValue="system">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use a more compact layout to fit more content
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better accessibility
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>
            Configure language and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Region</Label>
              <Select defaultValue="ng">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dz">Algeria</SelectItem>
                  <SelectItem value="ao">Angola</SelectItem>
                  <SelectItem value="bj">Benin</SelectItem>
                  <SelectItem value="bw">Botswana</SelectItem>
                  <SelectItem value="bf">Burkina Faso</SelectItem>
                  <SelectItem value="bi">Burundi</SelectItem>
                  <SelectItem value="cv">Cabo Verde</SelectItem>
                  <SelectItem value="cm">Cameroon</SelectItem>
                  <SelectItem value="cf">Central African Republic</SelectItem>
                  <SelectItem value="td">Chad</SelectItem>
                  <SelectItem value="km">Comoros</SelectItem>
                  <SelectItem value="cg">Congo</SelectItem>
                  <SelectItem value="cd">Democratic Republic of the Congo</SelectItem>
                  <SelectItem value="dj">Djibouti</SelectItem>
                  <SelectItem value="eg">Egypt</SelectItem>
                  <SelectItem value="gq">Equatorial Guinea</SelectItem>
                  <SelectItem value="er">Eritrea</SelectItem>
                  <SelectItem value="sz">Eswatini</SelectItem>
                  <SelectItem value="et">Ethiopia</SelectItem>
                  <SelectItem value="ga">Gabon</SelectItem>
                  <SelectItem value="gm">Gambia</SelectItem>
                  <SelectItem value="gh">Ghana</SelectItem>
                  <SelectItem value="gn">Guinea</SelectItem>
                  <SelectItem value="gw">Guinea-Bissau</SelectItem>
                  <SelectItem value="ci">Ivory Coast</SelectItem>
                  <SelectItem value="ke">Kenya</SelectItem>
                  <SelectItem value="ls">Lesotho</SelectItem>
                  <SelectItem value="lr">Liberia</SelectItem>
                  <SelectItem value="ly">Libya</SelectItem>
                  <SelectItem value="mg">Madagascar</SelectItem>
                  <SelectItem value="mw">Malawi</SelectItem>
                  <SelectItem value="ml">Mali</SelectItem>
                  <SelectItem value="mr">Mauritania</SelectItem>
                  <SelectItem value="mu">Mauritius</SelectItem>
                  <SelectItem value="ma">Morocco</SelectItem>
                  <SelectItem value="mz">Mozambique</SelectItem>
                  <SelectItem value="na">Namibia</SelectItem>
                  <SelectItem value="ne">Niger</SelectItem>
                  <SelectItem value="ng">Nigeria</SelectItem>
                  <SelectItem value="rw">Rwanda</SelectItem>
                  <SelectItem value="st">São Tomé and Príncipe</SelectItem>
                  <SelectItem value="sn">Senegal</SelectItem>
                  <SelectItem value="sc">Seychelles</SelectItem>
                  <SelectItem value="sl">Sierra Leone</SelectItem>
                  <SelectItem value="so">Somalia</SelectItem>
                  <SelectItem value="za">South Africa</SelectItem>
                  <SelectItem value="ss">South Sudan</SelectItem>
                  <SelectItem value="sd">Sudan</SelectItem>
                  <SelectItem value="tz">Tanzania</SelectItem>
                  <SelectItem value="tg">Togo</SelectItem>
                  <SelectItem value="tn">Tunisia</SelectItem>
                  <SelectItem value="ug">Uganda</SelectItem>
                  <SelectItem value="zm">Zambia</SelectItem>
                  <SelectItem value="zw">Zimbabwe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Zone
              </Label>
              <Select defaultValue="utc-5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="utc+0">GMT (UTC+0)</SelectItem>
                  <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Format
              </Label>
              <Select defaultValue="mdy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  <SelectItem value="long">Month DD, YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>
            Configure performance and data retention settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Data Retention (Days)</Label>
              <Input type="number" defaultValue="365" min="30" max="2555" />
              <p className="text-xs text-muted-foreground">
                How long to keep audit logs and activity data
              </p>
            </div>

            <div className="space-y-2">
              <Label>Auto-refresh Interval (Seconds)</Label>
              <Input type="number" defaultValue="30" min="10" max="300" />
              <p className="text-xs text-muted-foreground">
                Automatic refresh frequency for dashboard data
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Data Caching</Label>
              <p className="text-sm text-muted-foreground">
                Cache frequently accessed data for better performance
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Background Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync data in the background
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Configure biometric authentication settings for attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Biometric Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Allow employees to use fingerprint or face recognition for attendance
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Biometric for Clock In</Label>
              <p className="text-sm text-muted-foreground">
                Make biometric authentication mandatory for clocking in
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Biometric for Clock Out</Label>
              <p className="text-sm text-muted-foreground">
                Make biometric authentication mandatory for clocking out
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Biometric Authentication Timeout (Seconds)</Label>
            <Input type="number" defaultValue="60" min="30" max="180" />
            <p className="text-xs text-muted-foreground">
              Maximum time to wait for biometric authentication
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Fallback to PIN/Password</Label>
              <p className="text-sm text-muted-foreground">
                Allow PIN or password if biometric authentication fails
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Configure security settings for biometric data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Store Biometric Templates Locally</Label>
              <p className="text-sm text-muted-foreground">
                Keep biometric templates on device only (recommended)
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audit Biometric Usage</Label>
              <p className="text-sm text-muted-foreground">
                Log all biometric authentication attempts
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Biometric Data Retention (Days)</Label>
            <Input type="number" defaultValue="90" min="30" max="365" />
            <p className="text-xs text-muted-foreground">
              How long to keep biometric audit logs
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}