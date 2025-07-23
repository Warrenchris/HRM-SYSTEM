import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WelfareSavings } from "@/components/welfare/WelfareSavings";
import { WelfareLoans } from "@/components/welfare/WelfareLoans";
import { WelfareStats } from "@/components/welfare/WelfareStats";
import { PiggyBank, CreditCard, TrendingUp } from "lucide-react";

export default function Welfare() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welfare Management</h1>
          <p className="text-muted-foreground">
            Manage employee savings and welfare loans with competitive rates
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <WelfareStats />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Benefits</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">5% APR</div>
                <p className="text-xs text-muted-foreground">
                  Preferential loan rate for welfare members
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Savings Bonus:</span>
                    <span className="text-primary">3% APY</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee:</span>
                    <span className="text-primary">Waived</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Non-Member Rates</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6% APR</div>
                <p className="text-xs text-muted-foreground">
                  Standard loan rate for non-welfare members
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee:</span>
                    <span>2% of loan</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Tenure:</span>
                    <span>24 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings">
          <WelfareSavings />
        </TabsContent>

        <TabsContent value="loans">
          <WelfareLoans />
        </TabsContent>
      </Tabs>
    </div>
  );
}