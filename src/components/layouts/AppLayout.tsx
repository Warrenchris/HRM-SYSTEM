import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { AppHeader } from "@/components/navigation/AppHeader";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}