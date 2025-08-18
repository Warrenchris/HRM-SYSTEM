import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Position {
  id: string;
  title: string;
  department: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  level: number;
  location?: string;
  is_active: boolean;
  employee_id?: string;
  parent_position_id?: string;
}

const departments = [
  "Executive",
  "Technology", 
  "Finance",
  "Human Resources",
  "Marketing",
  "Sales",
  "Operations",
  "Engineering",
  "IT"
];

export function PositionManagement() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
    responsibilities: "",
    level: 1,
    location: "",
    parent_position_id: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_positions')
        .select('*')
        .order('department', { ascending: true })
        .order('level', { ascending: true });

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const positionData = {
        ...formData,
        level: Number(formData.level),
        parent_position_id: formData.parent_position_id || null
      };

      if (editingPosition) {
        const { error } = await supabase
          .from('organization_positions')
          .update(positionData)
          .eq('id', editingPosition.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Position updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('organization_positions')
          .insert([positionData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Position created successfully",
        });
      }

      setDialogOpen(false);
      setEditingPosition(null);
      resetForm();
      fetchPositions();
    } catch (error) {
      console.error('Error saving position:', error);
      toast({
        title: "Error",
        description: "Failed to save position",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      title: position.title,
      department: position.department,
      description: position.description || "",
      requirements: position.requirements || "",
      responsibilities: position.responsibilities || "",
      level: position.level,
      location: position.location || "",
      parent_position_id: position.parent_position_id || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;

    try {
      const { error } = await supabase
        .from('organization_positions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Position deactivated successfully",
      });
      
      fetchPositions();
    } catch (error) {
      console.error('Error deactivating position:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate position",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      description: "",
      requirements: "",
      responsibilities: "",
      level: 1,
      location: "",
      parent_position_id: ""
    });
  };

  const groupedPositions = positions.reduce((acc, position) => {
    if (!acc[position.department]) {
      acc[position.department] = [];
    }
    acc[position.department].push(position);
    return acc;
  }, {} as Record<string, Position[]>);

  const availableParentPositions = positions.filter(p => 
    p.department === formData.department && p.level < formData.level
  );

  if (loading) {
    return <div className="p-6">Loading positions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Position Management</h2>
          <p className="text-muted-foreground">
            Manage organizational positions and departments
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPosition(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPosition ? "Edit Position" : "Create New Position"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Position Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData({...formData, department: value, parent_position_id: ""})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select 
                    value={formData.level.toString()} 
                    onValueChange={(value) => setFormData({...formData, level: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Head Office"
                  />
                </div>
              </div>

              {formData.department && availableParentPositions.length > 0 && (
                <div>
                  <Label htmlFor="parent_position">Reports To</Label>
                  <Select 
                    value={formData.parent_position_id} 
                    onValueChange={(value) => setFormData({...formData, parent_position_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reporting position (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No direct report</SelectItem>
                      {availableParentPositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the position"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="responsibilities">Key Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                  placeholder="List key responsibilities"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Educational and experience requirements"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPosition ? "Update Position" : "Create Position"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPositions).map(([department, deptPositions]) => (
          <Card key={department}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{department} Department</span>
                <Badge variant="secondary">
                  {deptPositions.filter(p => p.is_active).length} positions
                </Badge>
              </CardTitle>
              <CardDescription>
                Organizational positions in {department}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {deptPositions.filter(p => p.is_active).map((position) => (
                  <div 
                    key={position.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{position.title}</h4>
                        <Badge variant="outline">Level {position.level}</Badge>
                        {position.employee_id && (
                          <Badge variant="default">
                            <Users className="h-3 w-3 mr-1" />
                            Filled
                          </Badge>
                        )}
                      </div>
                      {position.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {position.description}
                        </p>
                      )}
                      {position.location && (
                        <p className="text-xs text-muted-foreground">
                          Location: {position.location}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(position)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(position.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}