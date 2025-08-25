import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton, ReportsSkeleton } from "@/components/ui/skeleton";
import { useOverviewMetricsQuery, useDepartmentDistributionQuery, useMonthlyTrendsQuery, useEmployeeAnalyticsQuery, useAttendanceAnalyticsQuery } from "@/hooks/queries/useReportsQuery";
import { usePerformanceStatsQuery, useAppraisalsQuery, useObjectivesQuery } from "@/hooks/queries/usePerformanceQueries";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("last-30-days");
  
  // Load critical data first with progressive loading
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useOverviewMetricsQuery(timeRange);
  
  // Load secondary data only after critical data is ready
  const { data: departmentData, isLoading: deptLoading, error: deptError } = useDepartmentDistributionQuery();
  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useMonthlyTrendsQuery(6);
  
  // Load tertiary data after secondary data
  const { data: employeeAnalytics, isLoading: employeeLoading, error: employeeError } = useEmployeeAnalyticsQuery();
  const { data: attendanceAnalytics, isLoading: attendanceLoading, error: attendanceError } = useAttendanceAnalyticsQuery();
  
  // Performance data - load last
  const { data: perfStats, isLoading: perfLoading, error: perfError } = usePerformanceStatsQuery();
  const { data: appraisals, isLoading: appLoading, error: appError } = useAppraisalsQuery();
  const { data: objectives, isLoading: objLoading, error: objError } = useObjectivesQuery();

  // Show skeleton while loading critical data
  if (overviewLoading) {
    return <ReportsSkeleton />;
  }

  // Show error state for critical data
  if (overviewError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load reports</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Loading skeleton component for individual sections
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

  // Chart configs
  const deptChartConfig: ChartConfig = {
    count: { label: "Employees", color: "hsl(var(--primary))" },
  };
  const trendChartConfig: ChartConfig = {
    employees: { label: "Employees", color: "hsl(var(--primary))" },
    attendance: { label: "Attendance %", color: "hsl(var(--chart-2, 180 80% 40%))" },
    performance: { label: "Performance", color: "hsl(var(--chart-3, 30 85% 50%))" },
  };

  // Error component
  const ErrorDisplay = ({ error }: { error: string }) => (
    <Card>
      <CardContent className="flex items-center justify-center h-32">
        <div className="text-center text-muted-foreground">
          <p>Failed to load data</p>
          <p className="text-sm">{error}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your organization's performance
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 Days</SelectItem>
            <SelectItem value="last-30-days">Last 30 Days</SelectItem>
            <SelectItem value="last-quarter">Last Quarter</SelectItem>
            <SelectItem value="last-year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Metrics - Critical data loaded first */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {overviewData?.employeeGrowth || 'No growth data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.avgPerformance || 0}/5</div>
            <p className="text-xs text-muted-foreground">
              {overviewData?.performanceChange || 'No change data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.attendanceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {overviewData?.attendanceChange || 'No change data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.openPositions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {overviewData?.positionsFilled || 'No fill data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics - Secondary data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {deptLoading ? (
              <ChartSkeleton />
            ) : deptError ? (
              <ErrorDisplay error={deptError.message} />
            ) : (
              <ChartContainer config={deptChartConfig}>
                <BarChart data={departmentData || []}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="department" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4,4,0,0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <ChartSkeleton />
            ) : trendsError ? (
              <ErrorDisplay error={trendsError.message} />
            ) : (
              <ChartContainer config={trendChartConfig}>
                <LineChart data={trendsData || []}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="employees" stroke="var(--color-employees)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="performance" stroke="var(--color-performance)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Analytics - Tertiary data */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {employeeLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <MetricSkeleton key={i} />
              ))}
            </div>
          ) : employeeError ? (
            <ErrorDisplay error={employeeError.message} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{employeeAnalytics?.totalEmployees || 0}</div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${employeeAnalytics?.avgSalary || 0}</div>
                <p className="text-sm text-muted-foreground">Average Salary</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{employeeAnalytics?.departments?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Departments</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{employeeAnalytics?.positions?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Positions</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <MetricSkeleton key={i} />
              ))}
            </div>
          ) : attendanceError ? (
            <ErrorDisplay error={attendanceError.message} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{attendanceAnalytics?.totalRecords || 0}</div>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{attendanceAnalytics?.totalHours || 0}h</div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{attendanceAnalytics?.avgHoursPerDay || 0}h</div>
                <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{attendanceAnalytics?.lateArrivals || 0}</div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Data - Loaded last */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Performance Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {perfLoading ? (
              <ChartSkeleton />
            ) : perfError ? (
              <ErrorDisplay error={perfError.message} />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold">Performance Data</div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appraisals</CardTitle>
          </CardHeader>
          <CardContent>
            {appLoading ? (
              <ChartSkeleton />
            ) : appError ? (
              <ErrorDisplay error={appError.message} />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold">Appraisal Data</div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            {objLoading ? (
              <ChartSkeleton />
            ) : objError ? (
              <ErrorDisplay error={objError.message} />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold">Objectives Data</div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}