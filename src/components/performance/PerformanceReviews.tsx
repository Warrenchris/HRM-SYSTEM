import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Calendar, FileText, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppraisalsQuery } from "@/hooks/queries/usePerformanceQueries";

interface PerformanceReview {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  reviewPeriod: string;
  status: "scheduled" | "in-progress" | "completed" | "overdue";
  dueDate: string;
  rating?: number;
  reviewer: string;
  lastUpdated: string;
}

export function PerformanceReviews() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const { toast } = useToast();
  const { data: appraisals = [], isLoading } = useAppraisalsQuery();
  const reviews: PerformanceReview[] = useMemo(() => {
    return (appraisals || []).map(a => {
      const employeeName = [a.employee?.first_name, a.employee?.last_name].filter(Boolean).join(' ') || 'Unknown';
      const department = a.employee?.department || '';
      const position = a.employee?.position || '';
      const reviewer = [a.appraiser?.first_name, a.appraiser?.last_name].filter(Boolean).join(' ') || '';
      // Map status to include 'scheduled' when pending
      const mappedStatus = a.status === 'pending' ? 'scheduled' : (a.status as PerformanceReview['status']);
      return {
        id: a.id,
        employeeName,
        employeeId: a.employee_id,
        department,
        position,
        reviewPeriod: a.appraisal_period,
        status: mappedStatus,
        dueDate: a.due_date,
        rating: a.overall_rating ?? undefined,
        reviewer,
        lastUpdated: a.updated_at,
      } as PerformanceReview;
    });
  }, [appraisals]);

  const getStatusBadge = (status: PerformanceReview["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleStartReview = (reviewId: string, employeeName: string) => {
    toast({
      title: "Review Started",
      description: `Performance review for ${employeeName} has been started`,
    });
  };

  const handleCompleteReview = () => {
    if (selectedRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before completing the review",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Review Completed",
      description: "Performance review has been completed successfully",
    });
    setNewReviewComment("");
    setSelectedRating(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Performance Reviews
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Schedule Review
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{review.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {review.position} • {review.department}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{review.reviewPeriod}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(review.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>
                      {review.rating ? (
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="ml-1 text-sm font-medium">{review.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not rated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{review.reviewer}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>
                                Performance Review - {review.employeeName}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Employee Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Name:</strong> {review.employeeName}</p>
                                    <p><strong>ID:</strong> {review.employeeId}</p>
                                    <p><strong>Position:</strong> {review.position}</p>
                                    <p><strong>Department:</strong> {review.department}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Review Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Period:</strong> {review.reviewPeriod}</p>
                                    <p><strong>Due Date:</strong> {review.dueDate}</p>
                                    <p><strong>Reviewer:</strong> {review.reviewer}</p>
                                    <p><strong>Status:</strong> {review.status}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Performance Rating</h4>
                                <div className="flex items-center gap-2">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-6 w-6 cursor-pointer ${
                                        i < selectedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      }`}
                                      onClick={() => setSelectedRating(i + 1)}
                                    />
                                  ))}
                                  <span className="ml-2 text-sm">
                                    {selectedRating > 0 ? `${selectedRating}/5` : "Select rating"}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="review-comments">Review Comments</Label>
                                <Textarea
                                  id="review-comments"
                                  placeholder="Add your review comments here..."
                                  value={newReviewComment}
                                  onChange={(e) => setNewReviewComment(e.target.value)}
                                  rows={4}
                                  className="mt-2"
                                />
                              </div>

                              <div className="flex gap-2 justify-end">
                                {review.status === "scheduled" && (
                                  <Button
                                    onClick={() => handleStartReview(review.id, review.employeeName)}
                                  >
                                    Start Review
                                  </Button>
                                )}
                                {(review.status === "in-progress" || review.status === "overdue") && (
                                  <Button onClick={handleCompleteReview}>
                                    Complete Review
                                  </Button>
                                )}
                                <Button variant="outline">
                                  Save Draft
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {review.status === "scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartReview(review.id, review.employeeName)}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {reviews.length} reviews
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed: {reviews.filter(r => r.status === "completed").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>In Progress: {reviews.filter(r => r.status === "in-progress").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Overdue: {reviews.filter(r => r.status === "overdue").length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}