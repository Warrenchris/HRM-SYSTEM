import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketStats } from "@/components/tickets/TicketStats";
import { TicketList } from "@/components/tickets/TicketList";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { TicketManagement } from "@/components/tickets/TicketManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Tickets() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('employee');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserRole(data.role);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const isManager = userRole === 'admin' || userRole === 'hr' || userRole === 'manager';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ticketing System</h1>
        <p className="text-muted-foreground">
          Report issues and track their resolution
        </p>
      </div>

      <TicketStats />

      <Tabs defaultValue="my-tickets" className="space-y-6">
        <TabsList className={`grid w-full ${isManager ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
          {isManager && <TabsTrigger value="manage">Manage Tickets</TabsTrigger>}
          <TabsTrigger value="all">All Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-6">
          <TicketList showMyTickets={true} />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <CreateTicketForm />
        </TabsContent>

        {isManager && (
          <TabsContent value="manage" className="space-y-6">
            <TicketManagement />
          </TabsContent>
        )}

        <TabsContent value="all" className="space-y-6">
          <TicketList showMyTickets={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}