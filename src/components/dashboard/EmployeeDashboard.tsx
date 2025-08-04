import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { PayslipSection } from "@/components/employees/PayslipSection";

interface EmployeeProfile {
  employee_id: string;
  role: string;
  employee?: {
    first_name: string;
    last_name: string;
    department: string;
    position: string;
  };
}

interface AttendanceData {
  totalHours: number;
  daysPresent: number;
  avgHoursPerDay: number;
}

interface LeaveData {
  totalLeave: number;
  usedLeave: number;
  pendingRequests: number;
}

interface TaskData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData>({
    totalHours: 0,
    daysPresent: 0,
    avgHoursPerDay: 0
  });
  const [leave, setLeave] = useState<LeaveData>({
    totalLeave: 20,
    usedLeave: 0,
    pendingRequests: 0
  });
  const [tasks, setTasks] = useState<TaskData>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user) return;
    
    try {
      // Get employee profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          employee_id,
          role,
          employees (
            first_name,
            last_name,
            department,
            position
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData?.employee_id) {
        // Fetch attendance data for this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const { data: attendanceData } = await supabase
          .from('attendance_records')
          .select('total_hours, clock_in_time')
          .eq('employee_id', profileData.employee_id)
          .gte('clock_in_time', startOfMonth.toISOString());

        if (attendanceData) {
          const totalHours = attendanceData.reduce((sum, record) => sum + (record.total_hours || 0), 0);
          const daysPresent = attendanceData.length;
          setAttendance({
            totalHours,
            daysPresent,
            avgHoursPerDay: daysPresent > 0 ? totalHours / daysPresent : 0
          });
        }

        // Fetch tasks assigned to this employee
        const { data: taskData } = await supabase
          .from('tasks')
          .select('status, due_date')
          .eq('assigned_to', profileData.employee_id);

        if (taskData) {
          const now = new Date();
          const completedTasks = taskData.filter(task => task.status === 'completed').length;
          const overdueTasks = taskData.filter(task => 
            task.status !== 'completed' && task.due_date && new Date(task.due_date) < now
          ).length;
          
          setTasks({
            totalTasks: taskData.length,
            completedTasks,
            pendingTasks: taskData.length - completedTasks,
            overdueTasks
          });
        }
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Hours This Month",
      value: loading ? "..." : `${attendance.totalHours.toFixed(1)}h`,
      change: `${attendance.daysPresent} days present`,
      icon: Clock,
      color: "text-blue-500"
    },
    {
      title: "Leave Balance",
      value: `${leave.totalLeave - leave.usedLeave}`,
      change: `${leave.usedLeave} days used`,
      icon: Calendar,
      color: "text-green-500"
    },
    {
      title: "Active Tasks",
      value: `${tasks.pendingTasks}`,
      change: `${tasks.completedTasks} completed`,
      icon: CheckSquare,
      color: "text-orange-500"
    },
    {
      title: "Performance",
      value: tasks.totalTasks > 0 ? `${Math.round((tasks.completedTasks / tasks.totalTasks) * 100)}%` : "0%",
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
    { label: "Clock In/Out", icon: Timer, href: "/app/attendance", color: "bg-blue-500" },
    { label: "Request Leave", icon: CalendarDays, href: "/app/leave", color: "bg-green-500" },
    { label: "Submit Expense", icon: CreditCard, href: "/app/expenses", color: "bg-purple-500" },
    { label: "View Tasks", icon: CheckSquare, href: "/app/tasks", color: "bg-orange-500" },
    { label: "Timesheets", icon: FileText, href: "/app/timesheets", color: "bg-indigo-500" },
    { label: "Generate Payslip", icon: FileText, href: "#payslip", color: "bg-teal-500" },
    { label: "Performance", icon: TrendingUp, href: "/app/performance", color: "bg-pink-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.employee?.first_name || 'Employee'}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.employee?.position} • {profile?.employee?.department}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Here's your personal dashboard overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {profile?.role || 'Employee'}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/attendance">
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
              action.href === "#payslip" ? (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                  onClick={() => {
                    const payslipSection = document.getElementById('payslip-section');
                    payslipSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-1`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              ) : (
                <Button key={index} asChild variant="outline" className="h-20 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300">
                  <Link to={action.href} className="flex flex-col gap-2 items-center justify-center">
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-1`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-center">{action.label}</span>
                  </Link>
                </Button>
              )
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
                {tasks.completedTasks}/{tasks.totalTasks}
              </span>
            </div>
            <Progress 
              value={tasks.totalTasks > 0 ? (tasks.completedTasks / tasks.totalTasks) * 100 : 0} 
              className="h-2"
            />
            
            {tasks.overdueTasks > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">
                  {tasks.overdueTasks} overdue task{tasks.overdueTasks > 1 ? 's' : ''}
                </span>
                <Button asChild variant="destructive" size="sm" className="ml-auto">
                  <Link to="/app/tasks">View Tasks</Link>
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
              <div className="text-2xl font-bold text-green-600">{leave.totalLeave - leave.usedLeave}</div>
              <div className="text-sm text-muted-foreground">Days Remaining</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{leave.usedLeave}</div>
              <div className="text-sm text-muted-foreground">Days Used</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{leave.pendingRequests}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Annual Leave Progress</span>
              <span>{leave.usedLeave}/{leave.totalLeave} days</span>
            </div>
            <Progress value={(leave.usedLeave / leave.totalLeave) * 100} className="h-2" />
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