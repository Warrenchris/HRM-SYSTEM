import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react";

const stats = [
  {
    title: "Total Employees",
    value: "48",
    description: "Active payroll employees",
    icon: Users,
    trend: "+2 this month",
    color: "text-blue-600"
  },
  {
    title: "Gross Payroll",
    value: "KSh 2.85M",
    description: "January 2024 total",
    icon: DollarSign,
    trend: "+8.5% from last month",
    color: "text-green-600"
  },
  {
    title: "Net Payroll",
    value: "KSh 2.04M",
    description: "After deductions",
    icon: TrendingUp,
    trend: "71.4% of gross",
    color: "text-green-600"
  },
  {
    title: "Total Deductions",
    value: "KSh 814K",
    description: "Statutory + other",
    icon: AlertTriangle,
    trend: "28.6% of gross",
    color: "text-orange-600"
  }
];

const deductionBreakdown = [
  { name: "PAYE", amount: "KSh 456,000", percentage: "16.0%" },
  { name: "NSSF", amount: "KSh 142,500", percentage: "5.0%" },
  { name: "NHIF", amount: "KSh 76,800", percentage: "2.7%" },
  { name: "Housing Levy", amount: "KSh 42,750", percentage: "1.5%" },
  { name: "Other Deductions", amount: "KSh 96,250", percentage: "3.4%" }
];

export function PayrollStats() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Deduction Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {deductionBreakdown.map((deduction, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <p className="font-medium text-sm">{deduction.name}</p>
                <p className="text-lg font-bold">{deduction.amount}</p>
                <p className="text-xs text-muted-foreground">{deduction.percentage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}