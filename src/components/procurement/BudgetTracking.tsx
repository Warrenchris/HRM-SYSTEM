import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { DollarSign, TrendingUp, AlertTriangle, Target } from "lucide-react";

export function BudgetTracking() {
  const budgetData = [
    { department: "IT", allocated: 100000, spent: 75000, remaining: 25000 },
    { department: "Operations", allocated: 150000, spent: 120000, remaining: 30000 },
    { department: "Marketing", allocated: 80000, spent: 45000, remaining: 35000 },
    { department: "HR", allocated: 50000, spent: 30000, remaining: 20000 },
    { department: "Finance", allocated: 60000, spent: 25000, remaining: 35000 }
  ];

  const monthlySpendData = [
    { month: "Jan", budget: 50000, actual: 45000 },
    { month: "Feb", budget: 55000, actual: 52000 },
    { month: "Mar", budget: 60000, actual: 58000 },
    { month: "Apr", budget: 65000, actual: 68000 },
    { month: "May", budget: 70000, actual: 65000 },
    { month: "Jun", budget: 75000, actual: 72000 },
    { month: "Jul", budget: 80000, actual: 75000 }
  ];

  const categorySpendData = [
    { name: "Technology", value: 45, color: "#0088FE" },
    { name: "Office Supplies", value: 15, color: "#00C49F" },
    { name: "Equipment", value: 25, color: "#FFBB28" },
    { name: "Services", value: 15, color: "#FF8042" }
  ];

  const totalAllocated = budgetData.reduce((sum, dept) => sum + dept.allocated, 0);
  const totalSpent = budgetData.reduce((sum, dept) => sum + dept.spent, 0);
  const totalRemaining = budgetData.reduce((sum, dept) => sum + dept.remaining, 0);

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Allocated this year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalAllocated) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalSpent / totalAllocated) * 100).toFixed(1)}%
            </div>
            <Progress 
              value={(totalSpent / totalAllocated) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Budget Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Department Budget Status</CardTitle>
            <CardDescription>
              Budget allocation and spending by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetData.map((dept) => {
                const spentPercentage = (dept.spent / dept.allocated) * 100;
                const isOverBudget = spentPercentage > 90;
                
                return (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dept.department}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isOverBudget ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {spentPercentage.toFixed(1)}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${dept.spent.toLocaleString()} / ${dept.allocated.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={spentPercentage} 
                      className={isOverBudget ? "progress-destructive" : ""}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Spending */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Distribution of procurement spending across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categorySpendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categorySpendData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Budget vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget vs Actual Spending</CardTitle>
          <CardDescription>
            Track budget performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                />
                <Bar dataKey="budget" fill="#e2e8f0" name="Budget" />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Alerts</CardTitle>
          <CardDescription>
            Important budget notifications and warnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Operations Department Over Budget</p>
                  <p className="text-sm text-red-600">80% of annual budget spent with 5 months remaining</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Review
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">IT Department Budget Warning</p>
                  <p className="text-sm text-yellow-600">Approaching 75% budget utilization threshold</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Monitor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}