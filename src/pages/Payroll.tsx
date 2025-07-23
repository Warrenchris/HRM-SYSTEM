import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PayrollStats } from "@/components/payroll/PayrollStats";
import { PayrollTable } from "@/components/payroll/PayrollTable";
import { PayrollProcessing } from "@/components/payroll/PayrollProcessing";
import { PayrollHistory } from "@/components/payroll/PayrollHistory";
import { PayslipViewer } from "@/components/payroll/PayslipViewer";
import { PayslipGenerator } from "@/components/payroll/PayslipGenerator";
import { P9FormGenerator } from "@/components/payroll/P9FormGenerator";

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Payroll Management</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start sm:justify-center">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="processing">Process</TabsTrigger>
            <TabsTrigger value="view-payslips">View</TabsTrigger>
            <TabsTrigger value="generate-payslips">Generate</TabsTrigger>
            <TabsTrigger value="p9-forms">P9 Forms</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-4">
          <PayrollStats />
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Current Month Summary</CardTitle>
                <CardDescription>
                  January 2024 payroll breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border rounded-lg gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Gross Salaries</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total before deductions</p>
                    </div>
                    <p className="text-lg sm:text-xl font-bold">KSh 2,850,000</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border rounded-lg gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Total PAYE</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Income tax deductions</p>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-red-600">KSh 456,000</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border rounded-lg gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Total NSSF</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Social security contributions</p>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-red-600">KSh 142,500</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border rounded-lg gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Net Salaries</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Amount to be paid</p>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-green-600">KSh 2,035,750</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Statutory Rates</CardTitle>
                <CardDescription>
                  Current Kenyan statutory deduction rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h4 className="font-medium text-sm sm:text-base">NSSF Rate</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">6% of pensionable pay (max KSh 2,160)</p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h4 className="font-medium text-sm sm:text-base">SHIF Rates</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Graduated scale (KSh 150 - KSh 1,700)</p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h4 className="font-medium text-sm sm:text-base">Housing Levy</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">1.5% of gross salary</p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h4 className="font-medium text-sm sm:text-base">PAYE Bands</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">10%, 25%, 30%, 32.5%, 35%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees">
          <PayrollTable />
        </TabsContent>
        
        <TabsContent value="processing">
          <PayrollProcessing />
        </TabsContent>
        
        <TabsContent value="view-payslips">
          <PayslipViewer />
        </TabsContent>
        
        <TabsContent value="generate-payslips">
          <PayslipGenerator />
        </TabsContent>
        
        <TabsContent value="p9-forms">
          <P9FormGenerator />
        </TabsContent>
        
        <TabsContent value="history">
          <PayrollHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}