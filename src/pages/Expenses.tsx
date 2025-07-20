import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseStats } from "@/components/expenses/ExpenseStats";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseHistory } from "@/components/expenses/ExpenseHistory";
import { ExpenseApprovals } from "@/components/expenses/ExpenseApprovals";

export default function Expenses() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Expense Management</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submit">Submit Expense</TabsTrigger>
          <TabsTrigger value="history">My Expenses</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <ExpenseStats />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Expense Claims</CardTitle>
                <CardDescription>
                  Your latest expense submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ExpenseHistory limit={5} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common expense management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <h4 className="font-medium">Submit New Expense</h4>
                    <p className="text-sm text-muted-foreground">Add a new expense claim</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <h4 className="font-medium">View Policy</h4>
                    <p className="text-sm text-muted-foreground">Check expense guidelines</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <h4 className="font-medium">Download Reports</h4>
                    <p className="text-sm text-muted-foreground">Export expense data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="submit">
          <ExpenseForm />
        </TabsContent>
        
        <TabsContent value="history">
          <ExpenseHistory />
        </TabsContent>
        
        <TabsContent value="approvals">
          <ExpenseApprovals />
        </TabsContent>
      </Tabs>
    </div>
  );
}