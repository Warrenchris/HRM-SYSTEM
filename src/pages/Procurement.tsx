import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcurementStats } from "@/components/procurement/ProcurementStats";
import { PurchaseOrders } from "@/components/procurement/PurchaseOrders";
import { VendorManagement } from "@/components/procurement/VendorManagement";
import { ProcurementRequests } from "@/components/procurement/ProcurementRequests";
import { ContractManagement } from "@/components/procurement/ContractManagement";
import { BudgetTracking } from "@/components/procurement/BudgetTracking";
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  CreditCard, 
  DollarSign, 
  TrendingUp 
} from "lucide-react";

export default function Procurement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Management</h1>
          <p className="text-muted-foreground">
            Manage purchases, vendors, contracts, and procurement workflows
          </p>
        </div>
      </div>

      {/* Stats */}
      <ProcurementStats />

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <PurchaseOrders />
        </TabsContent>

        <TabsContent value="requests">
          <ProcurementRequests />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorManagement />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractManagement />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetTracking />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Procurement Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights for procurement activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}