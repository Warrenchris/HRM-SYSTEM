import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Star, Plus, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Appraisal {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  appraisalPeriod: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  dueDate: string;
  overallRating?: number;
  appraiser: string;
  selfAppraisalCompleted: boolean;
  managerAppraisalCompleted: boolean;
  lastUpdated: string;
}

export function PerformanceAppraisals() {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [appraisalComment, setAppraisalComment] = useState("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appraisals from database
  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      // Fetch appraisals with basic data first
      const { data, error } = await supabase
        .from('appraisals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For now, use mock data since we don't have employees data yet
      const mockAppraisals: Appraisal[] = [
        {
          id: "1",
          employeeName: "John Doe",
          employeeId: "EMP001",
          department: "Engineering",
          position: "Senior Developer",
          appraisalPeriod: "Q4 2024",
          status: "pending",
          dueDate: "2024-12-31",
          appraiser: "Jane Smith",
          selfAppraisalCompleted: false,
          managerAppraisalCompleted: false,
          lastUpdated: "2024-12-01"
        },
        {
          id: "2",
          employeeName: "Sarah Wilson",
          employeeId: "EMP002",
          department: "Marketing",
          position: "Marketing Manager",
          appraisalPeriod: "Q4 2024",
          status: "in-progress",
          dueDate: "2024-12-31",
          appraiser: "Mike Johnson",
          selfAppraisalCompleted: true,
          managerAppraisalCompleted: false,
          lastUpdated: "2024-12-15"
        },
        {
          id: "3",
          employeeName: "Mike Chen",
          employeeId: "EMP003",
          department: "Sales",
          position: "Sales Representative",
          appraisalPeriod: "Q3 2024",
          status: "completed",
          dueDate: "2024-09-30",
          overallRating: 4,
          appraiser: "Lisa Brown",
          selfAppraisalCompleted: true,
          managerAppraisalCompleted: true,
          lastUpdated: "2024-09-28"
        }
      ];

      setAppraisals(mockAppraisals);
    } catch (error) {
      console.error('Error fetching appraisals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appraisals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAppraisal = async (appraisalId: string, employeeName: string) => {
    try {
      const { error } = await supabase
        .from('appraisals')
        .update({ 
          status: 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', appraisalId);

      if (error) throw error;

      toast({
        title: "Appraisal Started",
        description: `Performance appraisal for ${employeeName} has been initiated.`,
      });

      // Refresh the data
      fetchAppraisals();
    } catch (error) {
      console.error('Error starting appraisal:', error);
      toast({
        title: "Error",
        description: "Failed to start appraisal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteAppraisal = async () => {
    if (!selectedAppraisal) return;
    
    if (selectedRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating before completing the appraisal.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('appraisals')
        .update({ 
          status: 'completed',
          overall_rating: selectedRating,
          manager_appraisal_comments: appraisalComment,
          manager_appraisal_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppraisal.id);

      if (error) throw error;

      toast({
        title: "Appraisal Completed",
        description: `Performance appraisal has been completed with a rating of ${selectedRating} stars.`,
      });
      
      setSelectedRating(0);
      setAppraisalComment("");
      setSelectedAppraisal(null);
      
      // Refresh the data
      fetchAppraisals();
    } catch (error) {
      console.error('Error completing appraisal:', error);
      toast({
        title: "Error",
        description: "Failed to complete appraisal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedAppraisal) return;

    try {
      const { error } = await supabase
        .from('appraisals')
        .update({ 
          manager_appraisal_comments: appraisalComment,
          overall_rating: selectedRating > 0 ? selectedRating : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppraisal.id);

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Your progress has been saved as draft.",
      });
      
      // Refresh the data
      fetchAppraisals();
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: Appraisal["status"]) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      "in-progress": { variant: "default" as const, label: "In Progress" },
      completed: { variant: "default" as const, label: "Completed" },
      overdue: { variant: "destructive" as const, label: "Overdue" }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const filteredAppraisals = selectedFilter === "all" 
    ? appraisals 
    : appraisals.filter(appraisal => appraisal.status === selectedFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Performance Appraisals</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appraisals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appraisal
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppraisals.map((appraisal) => (
              <TableRow key={appraisal.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{appraisal.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{appraisal.position}</div>
                  </div>
                </TableCell>
                <TableCell>{appraisal.department}</TableCell>
                <TableCell>{appraisal.appraisalPeriod}</TableCell>
                <TableCell>{getStatusBadge(appraisal.status)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${appraisal.selfAppraisalCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Self Assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${appraisal.managerAppraisalCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Manager Review</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{appraisal.dueDate}</TableCell>
                <TableCell>
                  {appraisal.overallRating ? (
                    <div className="flex">{renderStars(appraisal.overallRating)}</div>
                  ) : (
                    <span className="text-muted-foreground">Not rated</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAppraisal(appraisal)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Performance Appraisal Details</DialogTitle>
                        </DialogHeader>
                        {selectedAppraisal && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold">Employee Information</h4>
                                <p><strong>Name:</strong> {selectedAppraisal.employeeName}</p>
                                <p><strong>Position:</strong> {selectedAppraisal.position}</p>
                                <p><strong>Department:</strong> {selectedAppraisal.department}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Appraisal Details</h4>
                                <p><strong>Period:</strong> {selectedAppraisal.appraisalPeriod}</p>
                                <p><strong>Appraiser:</strong> {selectedAppraisal.appraiser}</p>
                                <p><strong>Due Date:</strong> {selectedAppraisal.dueDate}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Overall Rating</h4>
                              <div className="flex gap-2">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-6 w-6 cursor-pointer transition-colors ${
                                      i < selectedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                                    }`}
                                    onClick={() => setSelectedRating(i + 1)}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Comments & Feedback</h4>
                              <Textarea
                                placeholder="Add your appraisal comments here..."
                                value={appraisalComment}
                                onChange={(e) => setAppraisalComment(e.target.value)}
                              />
                            </div>

                            <div className="flex justify-between">
                              {selectedAppraisal.status === "pending" && (
                                <Button 
                                  onClick={() => handleStartAppraisal(selectedAppraisal.id, selectedAppraisal.employeeName)}
                                >
                                  Start Appraisal
                                </Button>
                              )}
                              {selectedAppraisal.status === "in-progress" && (
                                <Button onClick={handleCompleteAppraisal}>
                                  Complete Appraisal
                                </Button>
                              )}
                              <Button variant="outline" onClick={handleSaveDraft}>
                                Save Draft
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartAppraisal(appraisal.id, appraisal.employeeName)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAppraisals.length} of {appraisals.length} appraisals
        </div>
      </CardContent>
    </Card>
  );
}