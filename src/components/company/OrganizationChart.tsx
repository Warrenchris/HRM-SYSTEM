import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, User, Building, Mail, Phone, Plus, Edit, Trash2, Save, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Position {
  id: string;
  title: string;
  department: string;
  level: number;
  parent_position_id?: string | null;
  employee_id?: string | null;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  is_active: boolean;
  max_reports?: number;
  budget_authority?: number;
  location?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    passport_photo_url?: string;
  };
  directReports: number;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  passport_photo_url?: string;
}

interface UserProfile {
  role: string;
}

export function OrganizationChart() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    level: "1",
    parent_position_id: "",
    description: "",
    responsibilities: "",
    requirements: "",
    max_reports: "",
    budget_authority: "",
    location: "",
  });
  
  const { toast } = useToast();

  const departments = [
    "Executive", "Technology", "Finance", "Human Resources", "Marketing", 
    "Operations", "Sales", "Customer Support", "Legal", "Administration"
  ];

  const locations = ["Head Office", "Mombasa Branch", "Kampala Office", "Remote", "Multiple"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get user profile to check if admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }

      // Fetch positions with employee data
      const { data: positionsData, error: positionsError } = await supabase
        .from('organization_positions')
        .select(`
          *,
          employee:employees(
            id,
            first_name,
            last_name,
            email,
            phone,
            passport_photo_url
          )
        `)
        .eq('is_active', true)
        .order('level', { ascending: true });

      if (positionsError) throw positionsError;

      // Calculate direct reports for each position
      const positionsWithReports = positionsData?.map(pos => {
        const directReports = positionsData.filter(p => p.parent_position_id === pos.id).length;
        return { ...pos, directReports };
      }) || [];

      setPositions(positionsWithReports);

      // Fetch all employees for assignment
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, phone, passport_photo_url')
        .eq('status', 'active')
        .order('first_name');

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionsByLevel = (level: number) => {
    return positions.filter(pos => pos.level === level);
  };

  const getDirectReports = (positionId: string) => {
    return positions.filter(pos => pos.parent_position_id === positionId);
  };

  const handleOpenDialog = (position?: Position) => {
    if (position) {
      setEditingPosition(position);
      setFormData({
        title: position.title,
        department: position.department,
        level: position.level.toString(),
        parent_position_id: position.parent_position_id || "",
        description: position.description || "",
        responsibilities: position.responsibilities || "",
        requirements: position.requirements || "",
        max_reports: position.max_reports?.toString() || "",
        budget_authority: position.budget_authority?.toString() || "",
        location: position.location || "",
      });
    } else {
      setEditingPosition(null);
      setFormData({
        title: "",
        department: "",
        level: "1",
        parent_position_id: "",
        description: "",
        responsibilities: "",
        requirements: "",
        max_reports: "",
        budget_authority: "",
        location: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSavePosition = async () => {
    if (!formData.title || !formData.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and department",
        variant: "destructive",
      });
      return;
    }

    try {
      const positionData = {
        title: formData.title,
        department: formData.department,
        level: parseInt(formData.level),
        parent_position_id: formData.parent_position_id || null,
        description: formData.description || null,
        responsibilities: formData.responsibilities || null,
        requirements: formData.requirements || null,
        max_reports: formData.max_reports ? parseInt(formData.max_reports) : null,
        budget_authority: formData.budget_authority ? parseFloat(formData.budget_authority) : null,
        location: formData.location || null,
      };

      if (editingPosition) {
        const { error } = await supabase
          .from('organization_positions')
          .update(positionData)
          .eq('id', editingPosition.id);
          
        if (error) throw error;
        
        toast({
          title: "Position Updated",
          description: `${formData.title} has been updated successfully`,
        });
      } else {
        const { error } = await supabase
          .from('organization_positions')
          .insert([positionData]);
          
        if (error) throw error;
        
        toast({
          title: "Position Created",
          description: `${formData.title} has been created successfully`,
        });
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving position:', error);
      toast({
        title: "Error",
        description: "Failed to save position",
        variant: "destructive",
      });
    }
  };

  const handleDeletePosition = async (position: Position) => {
    try {
      const { error } = await supabase
        .from('organization_positions')
        .update({ is_active: false })
        .eq('id', position.id);
        
      if (error) throw error;
      
      toast({
        title: "Position Deleted",
        description: `${position.title} has been deleted`,
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast({
        title: "Error",
        description: "Failed to delete position",
        variant: "destructive",
      });
    }
  };

  const handleAssignEmployee = async (employeeId: string) => {
    if (!selectedPosition) return;

    try {
      const { error } = await supabase
        .from('organization_positions')
        .update({ employee_id: employeeId })
        .eq('id', selectedPosition.id);
        
      if (error) throw error;
      
      const employee = employees.find(e => e.id === employeeId);
      toast({
        title: "Employee Assigned",
        description: `${employee?.first_name} ${employee?.last_name} has been assigned to ${selectedPosition.title}`,
      });
      
      setIsAssignDialogOpen(false);
      setSelectedPosition(null);
      fetchData();
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast({
        title: "Error",
        description: "Failed to assign employee",
        variant: "destructive",
      });
    }
  };

  const handleUnassignEmployee = async (position: Position) => {
    try {
      const { error } = await supabase
        .from('organization_positions')
        .update({ employee_id: null })
        .eq('id', position.id);
        
      if (error) throw error;
      
      toast({
        title: "Employee Unassigned",
        description: `Employee has been unassigned from ${position.title}`,
      });
      
      fetchData();
    } catch (error) {
      console.error('Error unassigning employee:', error);
      toast({
        title: "Error",
        description: "Failed to unassign employee",
        variant: "destructive",
      });
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "border-purple-500 bg-purple-50";
      case 2: return "border-blue-500 bg-blue-50";
      case 3: return "border-green-500 bg-green-50";
      default: return "border-gray-500 bg-gray-50";
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      "Executive": "bg-purple-100 text-purple-800",
      "Technology": "bg-blue-100 text-blue-800",
      "Finance": "bg-green-100 text-green-800",
      "Human Resources": "bg-orange-100 text-orange-800",
      "Marketing": "bg-pink-100 text-pink-800",
      "Operations": "bg-cyan-100 text-cyan-800",
      "Sales": "bg-yellow-100 text-yellow-800",
      "Customer Support": "bg-indigo-100 text-indigo-800",
      "Legal": "bg-red-100 text-red-800",
      "Administration": "bg-slate-100 text-slate-800",
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  const isAdmin = userProfile?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading organization structure...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Organization Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Leadership Positions</p>
                <p className="text-2xl font-bold">{positions.filter(p => p.employee).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{positions.reduce((sum, pos) => sum + pos.directReports, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{new Set(positions.map(p => p.department)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Org Levels</p>
                <p className="text-2xl font-bold">{Math.max(...positions.map(p => p.level))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization Structure
            </CardTitle>
            {isAdmin && (
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Position
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Level 1 - Executive */}
            <div className="flex justify-center">
              <div className="space-y-4">
                {getPositionsByLevel(1).map((position) => (
                  <Card key={position.id} className={`w-80 border-4 ${getLevelColor(position.level)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {position.employee ? (
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={position.employee.passport_photo_url} />
                            <AvatarFallback>
                              {position.employee.first_name[0]}{position.employee.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{position.title}</h3>
                            <Badge className={getDepartmentColor(position.department)}>
                              {position.department}
                            </Badge>
                          </div>
                          {position.employee ? (
                            <>
                              <p className="font-medium">
                                {position.employee.first_name} {position.employee.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{position.employee.email}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No employee assigned</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {position.directReports} direct reports
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {isAdmin && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleOpenDialog(position)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {position.employee ? (
                                <Button size="sm" variant="outline" onClick={() => handleUnassignEmployee(position)}>
                                  <User className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setSelectedPosition(position);
                                    setIsAssignDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDeletePosition(position)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {position.employee?.email && (
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {position.employee?.phone && (
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Connection Line */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>

            {/* Level 2 and beyond */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {getPositionsByLevel(2).map((position) => (
                <div key={position.id} className="flex flex-col items-center">
                  <Card className={`w-full border-4 ${getLevelColor(position.level)}`}>
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        {position.employee ? (
                          <Avatar className="h-10 w-10 mx-auto">
                            <AvatarImage src={position.employee.passport_photo_url} />
                            <AvatarFallback className="text-xs">
                              {position.employee.first_name[0]}{position.employee.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <Badge className={getDepartmentColor(position.department)} variant="outline">
                            {position.department}
                          </Badge>
                          <h4 className="font-medium text-sm mt-1">{position.title}</h4>
                          {position.employee ? (
                            <>
                              <p className="font-medium text-sm">
                                {position.employee.first_name} {position.employee.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{position.employee.email}</p>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Vacant</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {position.directReports} reports
                          </p>
                          {isAdmin && (
                            <div className="flex justify-center gap-1 mt-2">
                              <Button size="sm" variant="outline" onClick={() => handleOpenDialog(position)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              {position.employee ? (
                                <Button size="sm" variant="outline" onClick={() => handleUnassignEmployee(position)}>
                                  <User className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setSelectedPosition(position);
                                    setIsAssignDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="h-3 w-3" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDeletePosition(position)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 3 - Direct Reports */}
                  {getDirectReports(position.id).length > 0 && (
                    <>
                      <div className="w-px h-4 bg-gray-300 my-2"></div>
                      <div className="space-y-2 w-full">
                        {getDirectReports(position.id).map((report) => (
                          <Card key={report.id} className={`border-2 ${getLevelColor(report.level)}`}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                {report.employee ? (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={report.employee.passport_photo_url} />
                                    <AvatarFallback className="text-xs">
                                      {report.employee.first_name[0]}{report.employee.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{report.title}</p>
                                  {report.employee ? (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {report.employee.first_name} {report.employee.last_name}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">Vacant</p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {report.directReports} reports
                                  </p>
                                </div>
                                {isAdmin && (
                                  <div className="flex flex-col gap-1">
                                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(report)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    {report.employee ? (
                                      <Button size="sm" variant="outline" onClick={() => handleUnassignEmployee(report)}>
                                        <User className="h-3 w-3" />
                                      </Button>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => {
                                          setSelectedPosition(report);
                                          setIsAssignDialogOpen(true);
                                        }}
                                      >
                                        <UserPlus className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? "Edit Position" : "Add New Position"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Position Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter position title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 (Executive)</SelectItem>
                    <SelectItem value="2">Level 2 (C-Level)</SelectItem>
                    <SelectItem value="3">Level 3 (Management)</SelectItem>
                    <SelectItem value="4">Level 4 (Team Lead)</SelectItem>
                    <SelectItem value="5">Level 5 (Individual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reports To</Label>
                <Select value={formData.parent_position_id} onValueChange={(value) => setFormData(prev => ({ ...prev, parent_position_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Top Level)</SelectItem>
                    {positions
                      .filter(pos => pos.id !== editingPosition?.id)
                      .map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title} ({pos.department})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Position description and overview"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="responsibilities">Key Responsibilities</Label>
              <Textarea
                id="responsibilities"
                placeholder="List key responsibilities and duties"
                value={formData.responsibilities}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements & Qualifications</Label>
              <Textarea
                id="requirements"
                placeholder="Required qualifications, experience, and skills"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_reports">Max Direct Reports</Label>
                <Input
                  id="max_reports"
                  type="number"
                  placeholder="Maximum number of direct reports"
                  value={formData.max_reports}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_reports: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="budget_authority">Budget Authority (KES)</Label>
                <Input
                  id="budget_authority"
                  type="number"
                  placeholder="Budget authority amount"
                  value={formData.budget_authority}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_authority: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePosition} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingPosition ? "Update" : "Create"} Position
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Employee to {selectedPosition?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {employees
                .filter(emp => !positions.some(pos => pos.employee_id === emp.id))
                .map((employee) => (
                  <Card 
                    key={employee.id} 
                    className="p-3 cursor-pointer hover:bg-accent"
                    onClick={() => handleAssignEmployee(employee.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.passport_photo_url} />
                        <AvatarFallback>
                          {employee.first_name[0]}{employee.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
            {employees.filter(emp => !positions.some(pos => pos.employee_id === emp.id)).length === 0 && (
              <p className="text-center text-muted-foreground">
                No unassigned employees available
              </p>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Organization Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-500 bg-purple-50 rounded"></div>
              <span className="text-sm">Executive Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
              <span className="text-sm">C-Level / Directors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
              <span className="text-sm">Team Leads / Managers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}