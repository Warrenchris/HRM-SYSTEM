import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend: string;
  color: string;
}

export function PayrollStats() {
  const [loading, setLoading] = useState(false);
  const [activeEmployees, setActiveEmployees] = useState<number>(0);
  const [grossTotal, setGrossTotal] = useState<number>(0);
  const [netTotal, setNetTotal] = useState<number>(0);
  const [totalDeductions, setTotalDeductions] = useState<number>(0);
  const [paye, setPaye] = useState<number>(0);
  const [nssf, setNssf] = useState<number>(0);
  const [shif, setShif] = useState<number>(0);
  const [housingLevy, setHousingLevy] = useState<number>(0);

  const monthYearLabel = useMemo(() => format(new Date(), "MMMM yyyy"), []);
  const payPeriodPrefix = useMemo(() => format(new Date(), "yyyy-MM"), []);

  const formatCurrency = (n: number) => `KSh ${n.toLocaleString()}`;
  const percentage = (part: number, whole: number) => {
    if (!whole) return "0%";
    return `${((part / whole) * 100).toFixed(1)}%`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Active employees
        const { count: empCount } = await supabase
          .from('employees')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active');
        setActiveEmployees(empCount || 0);

        // Current month payroll aggregates
        const { data: pr } = await supabase
          .from('payroll_records')
          .select(`gross_salary, net_salary, total_deductions, paye_tax, nssf_deduction, shif_deduction, housing_levy, pay_period`)
          .like('pay_period', `${payPeriodPrefix}%`);

        const rows = pr || [];
        const g = rows.reduce((s, r: any) => s + (r.gross_salary || 0), 0);
        const n = rows.reduce((s, r: any) => s + (r.net_salary || 0), 0);
        const d = rows.reduce((s, r: any) => s + (r.total_deductions || 0), 0);
        const p = rows.reduce((s, r: any) => s + (r.paye_tax || 0), 0);
        const ns = rows.reduce((s, r: any) => s + (r.nssf_deduction || 0), 0);
        const sh = rows.reduce((s, r: any) => s + (r.shif_deduction || 0), 0);
        const hl = rows.reduce((s, r: any) => s + (r.housing_levy || 0), 0);
        setGrossTotal(g);
        setNetTotal(n);
        setTotalDeductions(d);
        setPaye(p);
        setNssf(ns);
        setShif(sh);
        setHousingLevy(hl);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [payPeriodPrefix]);

  const stats: StatCard[] = [
    {
      title: "Total Employees",
      value: String(activeEmployees),
      description: "Active payroll employees",
      icon: Users,
      trend: loading ? "loading…" : "",
      color: "text-blue-600"
    },
    {
      title: "Gross Payroll",
      value: formatCurrency(grossTotal),
      description: `${monthYearLabel} total`,
      icon: DollarSign,
      trend: loading ? "loading…" : "",
      color: "text-green-600"
    },
    {
      title: "Net Payroll",
      value: formatCurrency(netTotal),
      description: "After deductions",
      icon: TrendingUp,
      trend: loading ? "loading…" : `${percentage(netTotal, grossTotal)} of gross`,
      color: "text-green-600"
    },
    {
      title: "Total Deductions",
      value: formatCurrency(totalDeductions),
      description: "Statutory + other",
      icon: AlertTriangle,
      trend: loading ? "loading…" : `${percentage(totalDeductions, grossTotal)} of gross`,
      color: "text-orange-600"
    }
  ];

  const other = Math.max(0, totalDeductions - (paye + nssf + shif + housingLevy));
  const deductionBreakdown = [
    { name: "PAYE", amount: formatCurrency(paye), percentage: percentage(paye, totalDeductions) },
    { name: "NSSF", amount: formatCurrency(nssf), percentage: percentage(nssf, totalDeductions) },
    { name: "SHIF", amount: formatCurrency(shif), percentage: percentage(shif, totalDeductions) },
    { name: "Housing Levy", amount: formatCurrency(housingLevy), percentage: percentage(housingLevy, totalDeductions) },
    { name: "Other Deductions", amount: formatCurrency(other), percentage: percentage(other, totalDeductions) }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const IconComp = stat.icon;
          return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <IconComp className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.trend && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )})}
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