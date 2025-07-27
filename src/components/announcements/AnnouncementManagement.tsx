import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementForm } from "./AnnouncementForm";
import { AnnouncementList } from "./AnnouncementList";
import { Megaphone } from "lucide-react";

export function AnnouncementManagement() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnnouncementCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground">
              Manage company announcements and communications
            </p>
          </div>
        </div>
        <AnnouncementForm onAnnouncementCreated={handleAnnouncementCreated} />
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Published Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementList refreshTrigger={refreshTrigger} isHR={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}