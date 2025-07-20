import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Settings, Users, BarChart3, Database } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username && password) {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the administration dashboard.",
      });
      navigate("/"); // Redirect to dashboard for admin
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid administrator credentials.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SigmaHRM</h1>
              <p className="text-sm text-slate-300">Human Capital Suite</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Administrator Portal
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Administrator Access</CardTitle>
            <CardDescription className="text-center">
              Manage users, system settings, and organizational data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember this device
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In as Admin"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Need support?{" "}
              <Link to="#" className="text-orange-600 hover:underline">
                Contact System Admin
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Admin Features */}
        <Card className="bg-white/95 backdrop-blur border-slate-200">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3 text-center">Administrative Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span>User Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-600" />
                <span>System Settings</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <span>Analytics & Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-600" />
                <span>Data Management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Switch to Employee */}
        <div className="text-center">
          <p className="text-sm text-slate-300">
            Employee access?{" "}
            <Link to="/employee-login" className="text-orange-400 hover:underline font-medium">
              Switch to Employee Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}