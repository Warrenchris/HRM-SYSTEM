import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanStats } from "@/components/loans/LoanStats";
import { LoanApplication } from "@/components/loans/LoanApplication";
import { LoanTable } from "@/components/loans/LoanTable";
import { LoanAmortization } from "@/components/loans/LoanAmortization";
import { LoanApprovals } from "@/components/loans/LoanApprovals";

export default function Loans() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Loan Management</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
          <TabsTrigger value="my-loans">My Loans</TabsTrigger>
          <TabsTrigger value="amortization">Amortization</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <LoanStats />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Active Loans</CardTitle>
                <CardDescription>
                  Current loan portfolio and repayment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoanTable limit={5} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Loan Policies</CardTitle>
                <CardDescription>
                  Current lending guidelines and rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Personal Loan</h4>
                    <p className="text-sm text-muted-foreground">Interest: 12% p.a.</p>
                    <p className="text-sm text-muted-foreground">Max: 3x basic salary</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Emergency Loan</h4>
                    <p className="text-sm text-muted-foreground">Interest: 8% p.a.</p>
                    <p className="text-sm text-muted-foreground">Max: KSh 50,000</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Salary Advance</h4>
                    <p className="text-sm text-muted-foreground">Interest: 0%</p>
                    <p className="text-sm text-muted-foreground">Max: 50% of salary</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="apply">
          <LoanApplication />
        </TabsContent>
        
        <TabsContent value="my-loans">
          <LoanTable />
        </TabsContent>
        
        <TabsContent value="amortization">
          <LoanAmortization />
        </TabsContent>
        
        <TabsContent value="approvals">
          <LoanApprovals />
        </TabsContent>
      </Tabs>
    </div>
  );
}