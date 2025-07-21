import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings, UserCheck, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  department: string | null;
  created_at: string;
  assigned_to: string | null;
  created_by: string;
}

interface User {
  id: string;
  email: string;
  profiles: {
    role: string;
  } | null;
  employees: {
    first_name: string;
    last_name: string;
  } | null;
}

export function TicketManagement() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          role,
          employees(first_name, last_name)
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Transform the data to match our User interface
      const transformedUsers = data?.map(profile => ({
        id: profile.user_id,
        email: '',
        profiles: { role: profile.role },
        employees: profile.employees
      })) || [];

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    setUpdating(true);
    try {
      const updates: any = {};
      
      if (newStatus) {
        updates.status = newStatus;
        if (newStatus === 'resolved' || newStatus === 'closed') {
          updates.resolved_at = new Date().toISOString();
        }
      }
      
      if (newAssignee) {
        updates.assigned_to = newAssignee === 'unassigned' ? null : newAssignee;
      }

      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', selectedTicket.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update ticket",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Ticket Updated",
        description: "Ticket has been updated successfully",
      });

      setNewStatus("");
      setNewAssignee("");
      setSelectedTicket(null);
      setIsDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEscalateTicket = async (ticket: Ticket) => {
    setEscalating(true);
    try {
      // Find the next level manager/admin to escalate to
      const higherLevelUsers = users.filter(user => 
        user.profiles?.role === 'admin' || 
        (user.profiles?.role === 'hr' && ticket.assigned_to !== user.id)
      );

      if (higherLevelUsers.length === 0) {
        toast({
          title: "No Higher Level Available",
          description: "No higher management level available for escalation",
          variant: "destructive",
        });
        return;
      }

      // Assign to the first available admin/higher level user
      const escalateToUser = higherLevelUsers[0];

      const { error } = await supabase
        .from('tickets')
        .update({
          assigned_to: escalateToUser.id,
          status: 'in_progress',
          priority: ticket.priority === 'urgent' ? 'urgent' : 
                   ticket.priority === 'high' ? 'urgent' : 'high'
        })
        .eq('id', ticket.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to escalate ticket",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Ticket Escalated",
        description: `Ticket escalated to ${escalateToUser.employees?.first_name} ${escalateToUser.employees?.last_name}`,
      });

      fetchTickets();
    } catch (error) {
      console.error('Error escalating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to escalate ticket",
        variant: "destructive",
      });
    } finally {
      setEscalating(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[priority as keyof typeof colors] || colors.medium}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return <Badge className={colors[status as keyof typeof colors] || colors.open}>{status.replace('_', ' ')}</Badge>;
  };

  const getAssigneeDisplay = (assignedTo: string | null) => {
    if (!assignedTo) return "Unassigned";
    
    const user = users.find(u => u.id === assignedTo);
    if (!user?.employees) return "Unknown User";
    
    return `${user.employees.first_name} ${user.employees.last_name}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading tickets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Ticket Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {ticket.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {getAssigneeDisplay(ticket.assigned_to)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog open={isDialogOpen && selectedTicket?.id === ticket.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setNewStatus(ticket.status);
                                setNewAssignee(ticket.assigned_to || "");
                              }}
                            >
                              Manage
                            </Button>
                          </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Ticket: {ticket.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Status</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Assign To</Label>
                              <Select value={newAssignee} onValueChange={setNewAssignee}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {users
                                    .filter(user => user.profiles?.role && ['admin', 'hr', 'manager'].includes(user.profiles.role))
                                    .map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.employees ? `${user.employees.first_name} ${user.employees.last_name}` : 'Unknown User'} ({user.profiles?.role})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateTicket} disabled={updating}>
                                {updating ? "Updating..." : "Update Ticket"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleEscalateTicket(ticket)}
                          disabled={escalating}
                          className="ml-1"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Escalate
                        </Button>
                      )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}