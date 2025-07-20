import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AssetStats } from "@/components/assets/AssetStats";
import { AssetTable } from "@/components/assets/AssetTable";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { AssetHistory } from "@/components/assets/AssetHistory";
import { AssetCalendar } from "@/components/assets/AssetCalendar";
import { 
  Package, 
  Plus, 
  BarChart3, 
  History, 
  Calendar, 
  Wrench 
} from "lucide-react";

export default function Assets() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
          <p className="text-muted-foreground">
            Track, manage, and maintain all company assets and equipment
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Asset Stats */}
      <AssetStats />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AssetTable />
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="grid gap-6">
            <AssetTable filterType="maintenance" />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <AssetHistory />
        </TabsContent>

        <TabsContent value="calendar">
          <AssetCalendar />
        </TabsContent>
      </Tabs>

      {/* Add Asset Dialog */}
      <AddAssetDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}