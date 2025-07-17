import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserCheck, 
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Employees",
      value: "1,248",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Present Today",
      value: "1,156",
      change: "92.6%",
      trend: "up",
      icon: UserCheck,
      color: "bg-green-500"
    },
    {
      title: "On Leave",
      value: "42",
      change: "-5%",
      trend: "down",
      icon: Calendar,
      color: "bg-orange-500"
    },
    {
      title: "Monthly Payroll",
      value: "$892,450",
      change: "+8%",
      trend: "up",
      icon: DollarSign,
      color: "bg-purple-500"
    }
  ];

  const pendingActions = [
    {
      type: "Leave Request",
      employee: "Sarah Johnson",
      department: "Marketing",
      status: "pending",
      days: 3,
      date: "Dec 15-17, 2024"
    },
    {
      type: "Expense Claim",
      employee: "Mike Chen",
      department: "Sales",
      status: "pending",
      amount: "$450",
      date: "Dec 10, 2024"
    },
    {
      type: "Loan Application",
      employee: "Emma Wilson",
      department: "IT",
      status: "review",
      amount: "$5,000",
      date: "Dec 8, 2024"
    }
  ];

  const recentActivities = [
    {
      action: "New employee onboarded",
      employee: "Alex Rodriguez",
      department: "Engineering",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      action: "Performance review completed",
      employee: "Lisa Park",
      department: "HR",
      time: "4 hours ago",
      icon: TrendingUp,
      color: "text-blue-500"
    },
    {
      action: "Overtime request submitted",
      employee: "David Kim",
      department: "Operations",
      time: "6 hours ago",
      icon: Clock,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening in your organization.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`w-3 h-3 mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pending Actions
            </CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{action.type}</Badge>
                    <Badge variant={action.status === 'pending' ? 'destructive' : 'default'} className="text-xs">
                      {action.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{action.employee}</p>
                  <p className="text-xs text-muted-foreground">{action.department} • {action.date}</p>
                  {action.days && <p className="text-xs text-muted-foreground">{action.days} days</p>}
                  {action.amount && <p className="text-xs text-muted-foreground">{action.amount}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest updates from your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <activity.icon className={`w-4 h-4 mt-0.5 ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.employee} • {activity.department}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Clock In/Out", icon: Clock, href: "/attendance" },
              { label: "Request Leave", icon: Calendar, href: "/leave" },
              { label: "Submit Expense", icon: DollarSign, href: "/expenses" },
              { label: "View Payroll", icon: DollarSign, href: "/payroll" },
              { label: "Time Sheets", icon: FileText, href: "/timesheets" },
              { label: "Performance", icon: TrendingUp, href: "/performance" }
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/20"
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}