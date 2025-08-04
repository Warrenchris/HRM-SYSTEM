import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            HRM Pro
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your HR processes with our comprehensive human resource management system
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Employee Login
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Employee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage employee records, profiles, and organizational structure
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track attendance, manage timesheets, and monitor work hours
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Leave Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Handle leave requests, approvals, and track time off
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Payroll & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Process payroll, generate reports, and manage compensation
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}