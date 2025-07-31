import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  TrendingUp,
  AlertCircle,
  User,
  FileText,
  CalendarDays,
  Timer,
  CreditCard,
  Megaphone
} from "lucide-react";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { Progress } from "@/components/ui/progress";
import { PayslipSection } from "@/components/employees/PayslipSection";
import { Skeleton } from "@/components/ui/skeleton";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { employee, loading: employeeLoading, error } = useCurrentEmployee();

  // Mock data for now to ensure the dashboard displays
  const mockStats = {
    attendance: {
      totalHours: 156.5,
      daysPresent: 18,
      avgHoursPerDay: 8.7
    },
    leave: {
      totalLeave: 20,
      usedLeave: 3,
      pendingRequests: 1
    },
    tasks: {
      totalTasks: 12,
      completedTasks: 8,
      pendingTasks: 4,
      overdueTasks: 1
    }
  };

  const stats = [
    {
      title: "Hours This Month",
      value: `${mockStats.attendance.totalHours}h`,
      change: `${mockStats.attendance.daysPresent} days present`,
      icon: Clock,
      color: "text-blue-500"
    },
    {
      title: "Leave Balance",
      value: `${mockStats.leave.totalLeave - mockStats.leave.usedLeave}`,
      change: `${mockStats.leave.usedLeave} days used`,
      icon: Calendar,
      color: "text-green-500"
    },
    {
      title: "Active Tasks",
      value: `${mockStats.tasks.pendingTasks}`,
      change: `${mockStats.tasks.completedTasks} completed`,
      icon: CheckSquare,
      color: "text-orange-500"
    },
    {
      title: "Performance",
      value: mockStats.tasks.totalTasks > 0 ? `${Math.round((mockStats.tasks.completedTasks / mockStats.tasks.totalTasks) * 100)}%` : "0%",
      change: "Task completion rate",
      icon: TrendingUp,
      color: "text-purple-500"
    }
  ];

  const upcomingDeadlines = [
    {
      title: "Project Report Submission",
      dueDate: "Dec 25, 2024",
      type: "Task",
      priority: "high"
    },
    {
      title: "Performance Review Meeting",
      dueDate: "Dec 30, 2024",
      type: "Appraisal",
      priority: "medium"
    },
    {
      title: "Annual Leave Request",
      dueDate: "Jan 5, 2025",
      type: "Leave",
      priority: "low"
    }
  ];

  const quickActions = [
    { label: "Clock In/Out", icon: Timer, href: "/attendance", color: "bg-blue-500" },
    { label: "Request Leave", icon: CalendarDays, href: "/leave", color: "bg-green-500" },
    { label: "Submit Expense", icon: CreditCard, href: "/expenses", color: "bg-purple-500" },
    { label: "View Tasks", icon: CheckSquare, href: "/tasks", color: "bg-orange-500" },
    { label: "Timesheets", icon: FileText, href: "/timesheets", color: "bg-indigo-500" },
    { label: "Generate Payslip", icon: FileText, href: "#payslip", color: "bg-teal-500" },
    { label: "Performance", icon: TrendingUp, href: "/performance", color: "bg-pink-500" }
  ];

  // Loading state
  if (employeeLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <Skeleton className="h-40" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Unable to Load Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading your dashboard data. You can still access the basic features.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.slice(0, 4).map((action, index) => (
                <Button key={index} asChild variant="outline" className="h-16 flex flex-col gap-1">
                  <Link to={action.href}>
                    <action.icon className="w-4 h-4" />
                    <span className="text-xs">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {employee?.first_name || 'Employee'}!
          </h1>
          <p className="text-muted-foreground">
            {employee?.position} • {employee?.department}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Here's your personal dashboard overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Employee
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/attendance">
              <Clock className="w-4 h-4 mr-2" />
              Quick Clock In
            </Link>
          </Button>
        </div>
      </div>

      {/* Personal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used functions and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild={action.href !== "#payslip"}
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                onClick={action.href === "#payslip" ? () => {
                  const payslipSection = document.getElementById('payslip-section');
                  payslipSection?.scrollIntoView({ behavior: 'smooth' });
                } : undefined}
              >
                {action.href !== "#payslip" ? (
                  <Link to={action.href}>
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-1`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-center">{action.label}</span>
                  </Link>
                ) : (
                  <>
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-1`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-center">{action.label}</span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementList refreshTrigger={0} isHR={false} />
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-orange-500" />
              Task Progress
            </CardTitle>
            <CardDescription>Your current task completion status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Tasks</span>
              <span className="text-sm text-muted-foreground">
                {mockStats.tasks.completedTasks}/{mockStats.tasks.totalTasks}
              </span>
            </div>
            <Progress 
              value={mockStats.tasks.totalTasks > 0 ? (mockStats.tasks.completedTasks / mockStats.tasks.totalTasks) * 100 : 0} 
              className="h-2"
            />
            
            {mockStats.tasks.overdueTasks > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">
                  {mockStats.tasks.overdueTasks} overdue task{mockStats.tasks.overdueTasks > 1 ? 's' : ''}
                </span>
                <Button asChild variant="destructive" size="sm" className="ml-auto">
                  <Link to="/tasks">View Tasks</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{deadline.title}</p>
                  <p className="text-xs text-muted-foreground">{deadline.dueDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={deadline.priority === 'high' ? 'destructive' : deadline.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {deadline.type}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Leave Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-500" />
            Leave Balance Overview
          </CardTitle>
          <CardDescription>Your annual leave allocation and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{mockStats.leave.totalLeave - mockStats.leave.usedLeave}</div>
              <div className="text-sm text-muted-foreground">Days Remaining</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{mockStats.leave.usedLeave}</div>
              <div className="text-sm text-muted-foreground">Days Used</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{mockStats.leave.pendingRequests}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Annual Leave Progress</span>
              <span>{mockStats.leave.usedLeave}/{mockStats.leave.totalLeave} days</span>
            </div>
            <Progress value={(mockStats.leave.usedLeave / mockStats.leave.totalLeave) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Payslip Section */}
      <div id="payslip-section">
        <PayslipSection />
      </div>
    </div>
  );
}