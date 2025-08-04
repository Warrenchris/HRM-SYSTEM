import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function CreateTicketForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ];

  const categories = [
    { value: "technical", label: "Technical Issue" },
    { value: "hr", label: "HR Related" },
    { value: "equipment", label: "Equipment" },
    { value: "facility", label: "Facility" },
    { value: "policy", label: "Policy Question" },
    { value: "other", label: "Other" }
  ];

  const departments = [
    "IT", "Engineering", "Human Resources", "Finance", "Design", "Marketing", "Sales"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !priority || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a ticket",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // Get user profile to fetch employee data
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          employee_id,
          employees!profiles_employee_id_fkey(first_name, last_name)
        `)
        .eq('user_id', user.id)
        .single();

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          title,
          description,
          priority,
          category,
          department: department || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create ticket. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Ticket Created",
        description: "Your ticket has been submitted successfully",
      });

      // Create notification
      const employee = profile?.employees as any;
      const employeeName = employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 'Unknown User';
      
      // Dispatch custom event for notification
      window.dispatchEvent(new CustomEvent('newNotification', {
        detail: {
          title: 'New Support Ticket',
          message: `${employeeName} created a ${priority} priority ticket: "${title}"`,
          type: 'general',
          employeeName,
          requestId: ticket.id,
        }
      }));

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("");
      setCategory("");
      setDepartment("");

    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Create New Ticket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Department (Optional)</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={creating} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {creating ? "Creating..." : "Create Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}