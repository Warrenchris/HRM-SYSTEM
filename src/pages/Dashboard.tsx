import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Cake,
  AlertCircle,
  FileText
} from "lucide-react";
import { useEmployeeStatsQuery } from "@/hooks/queries/useEmployeesQuery";
import {
  useUpcomingBirthdaysQuery,
  useTodayAttendanceQuery,
  useContractsExpiringQuery,
  usePendingActionsQuery,
  useRecentActivitiesQuery,
} from "@/hooks/queries/useDashboardQueries";

export default function Dashboard() {
  // Use optimized queries with caching
  const { data: employeeStats, isLoading: statsLoading } = useEmployeeStatsQuery();
  const { data: upcomingBirthdays = [], isLoading: birthdaysLoading } = useUpcomingBirthdaysQuery();
  const { data: attendanceData, isLoading: attendanceLoading } = useTodayAttendanceQuery();
  const { data: contractsData = [] } = useContractsExpiringQuery(60);
  const { data: pendingData = [] } = usePendingActionsQuery(5);
  const { data: activitiesData = [] } = useRecentActivitiesQuery(8);

  const todayAttendance = attendanceData?.attendance || [];
  const attendanceStats = attendanceData?.stats || {
    clockedIn: 0,
    clockedOut: 0,
    late: 0,
    onBreak: 0
  };

  // Remove mock data arrays and replace with fetched data with safe fallbacks
  const stats: any[] = [];
  const pendingActions = pendingData;
  const contractsExpiring = contractsData;
  const recentActivities = activitiesData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening in your organization.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="hover-scale">
            <Link to="/app/attendance">
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button asChild className="hover-scale">
            <Link to="/app/employees">
              <Users className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
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

      {/* Contract Expiry Alert */}
      <Card className="shadow-soft border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Contracts Expiring Soon
          </CardTitle>
          <CardDescription>
            Contracts expiring within 60 days requiring renewal action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractsExpiring.map((contract, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-orange-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={contract.daysRemaining <= 30 ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {contract.daysRemaining} days left
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{contract.first_name} {contract.last_name}</p>
                  <p className="text-xs text-muted-foreground">{contract.position}</p>
                  <p className="text-xs text-muted-foreground">{contract.department} • Expires: {new Date(contract.contract_end_date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="hover-scale">
                    <Link to="/app/employees">
                      View Contract
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 hover-scale">
                    <Link to="/app/employees">
                      Renew
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <Card className="shadow-soft border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Today's Attendance Overview
          </CardTitle>
          <CardDescription>
            Real-time attendance tracking for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 p-4 bg-white border border-blue-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold text-green-600">{attendanceStats.clockedIn}</p>
                <p className="text-xs text-muted-foreground">Clocked In</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-white border border-blue-200 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold text-red-600">{attendanceStats.clockedOut}</p>
                <p className="text-xs text-muted-foreground">Clocked Out</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-white border border-blue-200 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{attendanceStats.late}</p>
                <p className="text-xs text-muted-foreground">Late Arrivals</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-white border border-blue-200 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{attendanceStats.onBreak}</p>
                <p className="text-xs text-muted-foreground">On Break</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Clock-ins</h4>
            {todayAttendance.slice(0, 5).map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    record.status === 'clocked_in' ? 'bg-green-500' :
                    record.status === 'clocked_out' ? 'bg-red-500' :
                    record.status === 'on_break' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm">{record.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{record.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(record.clock_in_time).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {record.total_hours ? `${record.total_hours.toFixed(1)}h worked` : 'Active'}
                  </p>
                </div>
              </div>
            ))}
            {todayAttendance.length > 5 && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/app/attendance">View All Attendance</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Birthdays */}
        <Card className="shadow-soft border-pink-200 bg-pink-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-600" />
              Upcoming Birthdays
            </CardTitle>
            <CardDescription>
              Celebrate your team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBirthdays.length > 0 ? (
              upcomingBirthdays.map((birthday, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-pink-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <Cake className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{birthday.first_name} {birthday.last_name}</p>
                      <p className="text-xs text-muted-foreground">{birthday.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {birthday.daysUntil === 0 ? 'Today!' : `${birthday.daysUntil} days`}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming birthdays in the next 2 weeks
              </p>
            )}
          </CardContent>
        </Card>

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
            {pendingActions.map((action: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{action.type}</Badge>
                    <Badge variant={action.status === 'pending' ? 'destructive' : 'default'} className="text-xs">
                      {action.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{action.employee || 'Employee'}</p>
                  <p className="text-xs text-muted-foreground">{action.department || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {typeof action.amount === 'number' ? action.amount.toFixed(2) : action.days ? `${action.days} days` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.date ? new Date(action.date).toLocaleDateString() : ''}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest updates across the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.employee ? `${activity.employee}${activity.department ? ' • ' + activity.department : ''}` : ''}</p>
                  <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
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
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Clock In/Out", icon: Clock, href: "/app/attendance" },
              { label: "Request Leave", icon: Calendar, href: "/app/leave" },
              { label: "Submit Expense", icon: DollarSign, href: "/app/expenses" },
              { label: "View Payroll", icon: DollarSign, href: "/app/payroll" },
              { label: "Time Sheets", icon: FileText, href: "/app/timesheets" },
              { label: "Performance", icon: TrendingUp, href: "/app/performance" }
            ].map((action, index) => (
              <Button
                key={index}
                asChild
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 hover-scale animate-fade-in transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link to={action.href}>
                  <action.icon className="w-6 h-6" />
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