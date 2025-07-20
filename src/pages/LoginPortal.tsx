import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <User className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SigmaHRM</h1>
              <p className="text-lg text-muted-foreground">Human Capital Suite</p>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your access portal to continue to the platform
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Employee Portal */}
          <Card className="hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40 group">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Employee Portal</CardTitle>
              <CardDescription className="text-base">
                Access your personal workspace for attendance, leave requests, and timesheets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Track your attendance with GPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Submit leave requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>View your timesheet records</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Access performance reviews</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/employee-login">
                  Access Employee Portal
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-all duration-300 border-orange-200 hover:border-orange-300 group">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Administrator Portal</CardTitle>
              <CardDescription className="text-base">
                Full system access for managing users, settings, and organizational data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Manage employee records</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Configure system settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Generate reports and analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Control user permissions</span>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full border-orange-200 hover:bg-orange-50">
                <Link to="/admin-login">
                  Access Admin Portal
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 SigmaHRM. All rights reserved.</p>
          <p className="mt-1">
            Need help? Contact{" "}
            <Link to="#" className="text-primary hover:underline">
              support@sigmahrm.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}