import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Download, Loader2, Star, CheckCircle } from "lucide-react";
import { 
  useOverviewMetricsQuery, 
  useDepartmentDistributionQuery, 
  useMonthlyTrendsQuery,
  useEmployeeAnalyticsQuery,
  useAttendanceAnalyticsQuery
} from "@/hooks/queries/useReportsQuery";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePerformanceStatsQuery,
  useAppraisalsQuery,
  useObjectivesQuery,
} from "@/hooks/queries/usePerformanceQueries";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("last-30-days");
  
  // Fetch real data from backend
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useOverviewMetricsQuery(timeRange);
  const { data: departmentData, isLoading: deptLoading, error: deptError } = useDepartmentDistributionQuery();
  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useMonthlyTrendsQuery(6);
  const { data: employeeAnalytics, isLoading: employeeLoading, error: employeeError } = useEmployeeAnalyticsQuery();
  const { data: attendanceAnalytics, isLoading: attendanceLoading, error: attendanceError } = useAttendanceAnalyticsQuery();
  // Performance
  const { data: perfStats, isLoading: perfLoading, error: perfError } = usePerformanceStatsQuery();
  const { data: appraisals, isLoading: appLoading, error: appError } = useAppraisalsQuery();
  const { data: objectives, isLoading: objLoading, error: objError } = useObjectivesQuery();

  // Loading skeleton component
  const MetricSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  // Chart skeleton component
  const ChartSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 mx-auto mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );

  // Error component
  const ErrorDisplay = ({ error }: { error: string }) => (
    <div className="text-center py-8">
      <div className="text-red-500 mb-2">⚠️ Error loading data</div>
      <div className="text-sm text-muted-foreground">{error}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and analytics across all HR modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewLoading ? (
              // Show loading skeletons
              Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : overviewError ? (
              // Show error state
              <div className="col-span-4">
                <ErrorDisplay error={overviewError.message} />
              </div>
            ) : (
              // Show real data
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.totalEmployees || 0}</div>
                    <p className="text-xs text-muted-foreground">{overviewData?.employeeGrowth || 'No data'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.avgPerformance || 0}/5.0</div>
                    <p className="text-xs text-muted-foreground">{overviewData?.performanceChange || 'No data'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.attendanceRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">{overviewData?.attendanceChange || 'No data'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.openPositions || 0}</div>
                    <p className="text-xs text-muted-foreground">{overviewData?.positionsFilled || 'No data'}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {deptLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : deptError ? (
                  <ErrorDisplay error={deptError.message} />
                ) : departmentData && departmentData.length > 0 ? (
                  <div className="space-y-3">
                    {departmentData.slice(0, 6).map((dept) => (
                      <div key={dept.department} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept.department}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${dept.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {dept.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>No department data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {trendsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : trendsError ? (
                  <ErrorDisplay error={trendsError.message} />
                ) : trendsData && trendsData.length > 0 ? (
                  <div className="space-y-3">
                    {trendsData.map((trend) => (
                      <div key={trend.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{trend.month}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">Emp: {trend.employees}</span>
                          <span className="text-muted-foreground">Att: {trend.attendance}%</span>
                          <span className="text-muted-foreground">Perf: {trend.performance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {employeeLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : employeeError ? (
                  <ErrorDisplay error={employeeError.message} />
                ) : employeeAnalytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{employeeAnalytics.totalEmployees}</div>
                        <div className="text-sm text-muted-foreground">Total Employees</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">${employeeAnalytics.avgSalary.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Avg Salary</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Departments ({employeeAnalytics.departments.length})</div>
                      <div className="space-y-1">
                        {employeeAnalytics.departments.slice(0, 5).map((dept) => (
                          <div key={dept} className="text-sm text-muted-foreground">{dept}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">No employee data available</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Employee Insights</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {employeeLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : employeeError ? (
                  <ErrorDisplay error={employeeError.message} />
                ) : employeeAnalytics ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Positions ({employeeAnalytics.positions.length})</div>
                      <div className="space-y-1">
                        {employeeAnalytics.positions.slice(0, 6).map((position) => (
                          <div key={position} className="text-sm text-muted-foreground">{position}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">No position data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {attendanceLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : attendanceError ? (
                  <ErrorDisplay error={attendanceError.message} />
                ) : attendanceAnalytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{attendanceAnalytics.totalRecords}</div>
                        <div className="text-sm text-muted-foreground">Total Records</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{attendanceAnalytics.totalHours}</div>
                        <div className="text-sm text-muted-foreground">Total Hours</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{attendanceAnalytics.avgHoursPerDay}</div>
                        <div className="text-sm text-muted-foreground">Avg Hours/Day</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{attendanceAnalytics.lateArrivals}</div>
                        <div className="text-sm text-muted-foreground">Late Arrivals</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{attendanceAnalytics.attendanceRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Attendance Rate</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">No attendance data available</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Attendance Insights</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Detailed attendance insights coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {perfLoading ? (
              Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : perfError ? (
              <div className="col-span-4"><ErrorDisplay error={perfError.message} /></div>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{perfStats?.averagePerformance.value ?? 0}/5.0</div>
                    <p className="text-xs text-muted-foreground">Period average rating</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reviews Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{perfStats?.reviewsCompleted.percent ?? 0}%</div>
                    <p className="text-xs text-muted-foreground">{perfStats?.reviewsCompleted.completed ?? 0}/{perfStats?.reviewsCompleted.total ?? 0} completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Goals Achieved</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{perfStats?.goalsAchieved.percent ?? 0}%</div>
                    <p className="text-xs text-muted-foreground">{perfStats?.goalsAchieved.completed ?? 0}/{perfStats?.goalsAchieved.total ?? 0} objectives met</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{perfStats?.topPerformers.count ?? 0}</div>
                    <p className="text-xs text-muted-foreground">Employees with ≥4.5 average</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appraisals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : appError ? (
                  <ErrorDisplay error={appError.message} />
                ) : appraisals && appraisals.length > 0 ? (
                  appraisals.slice(0, 6).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : 'Employee'}</div>
                        <div className="text-xs text-muted-foreground">{a.appraisal_period}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium capitalize">{a.status}</div>
                        <div className="text-xs text-muted-foreground">{a.overall_rating != null ? `${a.overall_rating.toFixed(1)}/5` : 'No rating'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No appraisals found</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objectives Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {objLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : objError ? (
                  <ErrorDisplay error={objError.message} />
                ) : objectives && objectives.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">{objectives.length}</div>
                      <div className="text-sm text-muted-foreground">Total Objectives</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">{objectives.filter(o => (o.manager_rating ?? 0) >= 4 || (o.employee_rating ?? 0) >= 4).length}</div>
                      <div className="text-sm text-muted-foreground">Marked Achieved</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">No objectives available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {["recruitment", "payroll"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab} Analytics</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">{tab.charAt(0).toUpperCase() + tab.slice(1)} reports coming soon</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab} Insights</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Detailed {tab} insights</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}