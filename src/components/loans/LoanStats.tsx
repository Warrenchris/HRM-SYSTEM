import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Loans",
    value: "24",
    description: "Active employee loans",
    icon: DollarSign,
    trend: "+3 this month",
    color: "text-blue-600"
  },
  {
    title: "Outstanding Amount",
    value: "KSh 1.8M",
    description: "Total loan balance",
    icon: TrendingUp,
    trend: "82% collection rate",
    color: "text-green-600"
  },
  {
    title: "Monthly Collections",
    value: "KSh 245K",
    description: "January repayments",
    icon: Clock,
    trend: "+5% from last month",
    color: "text-green-600"
  },
  {
    title: "Loan Applications",
    value: "6",
    description: "Pending approval",
    icon: Users,
    trend: "3 approved this week",
    color: "text-orange-600"
  }
];

const loanTypes = [
  { name: "Personal Loans", count: 15, amount: "KSh 1,200,000", rate: "12%" },
  { name: "Emergency Loans", count: 6, amount: "KSh 300,000", rate: "8%" },
  { name: "Salary Advance", count: 3, amount: "KSh 150,000", rate: "0%" },
  { name: "Equipment Loans", count: 2, amount: "KSh 180,000", rate: "10%" }
];

export function LoanStats() {
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
          <CardTitle>Loan Portfolio Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loanTypes.map((type, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <p className="font-medium text-sm">{type.name}</p>
                <p className="text-lg font-bold">{type.amount}</p>
                <div className="flex justify-center space-x-2 mt-1">
                  <p className="text-xs text-muted-foreground">{type.count} loans</p>
                  <p className="text-xs text-muted-foreground">@ {type.rate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}