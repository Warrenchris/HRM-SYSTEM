import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Eye, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const pendingExpenses = [
  {
    id: "EXP-006",
    employeeName: "John Smith",
    employeeAvatar: "",
    date: "2024-01-16",
    category: "Travel",
    description: "Flight tickets for conference in San Francisco",
    amount: 650.00,
    merchant: "American Airlines",
    submittedAt: "2024-01-16 09:30",
    receipts: ["receipt1.pdf", "boarding_pass.pdf"]
  },
  {
    id: "EXP-007",
    employeeName: "Emily Davis",
    employeeAvatar: "",
    date: "2024-01-15",
    category: "Meals",
    description: "Team lunch for project kick-off meeting",
    amount: 145.80,
    merchant: "Olive Garden",
    submittedAt: "2024-01-15 14:20",
    receipts: ["receipt2.pdf"]
  },
  {
    id: "EXP-008",
    employeeName: "David Wilson",
    employeeAvatar: "",
    date: "2024-01-14",
    category: "Technology",
    description: "External monitor for remote work setup",
    amount: 299.99,
    merchant: "Best Buy",
    submittedAt: "2024-01-14 16:45",
    receipts: ["monitor_receipt.pdf", "warranty.pdf"]
  }
];

export function ExpenseApprovals() {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleApprove = (expenseId: string) => {
    toast({
      title: "Expense Approved",
      description: `Expense ${expenseId} has been approved successfully.`,
    });
  };

  const handleReject = (expenseId: string) => {
    toast({
      title: "Expense Rejected",
      description: `Expense ${expenseId} has been rejected.`,
      variant: "destructive"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>
          Review and approve expense claims submitted by team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Expense ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={expense.employeeAvatar} />
                        <AvatarFallback>
                          {expense.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{expense.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{expense.id}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {expense.submittedAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedExpense(expense)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Expense Details - {expense?.id}</DialogTitle>
                            <DialogDescription>
                              Review the expense claim details and attachments
                            </DialogDescription>
                          </DialogHeader>
                          {selectedExpense && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Employee</Label>
                                  <p className="text-sm">{selectedExpense.employeeName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Amount</Label>
                                  <p className="text-sm font-semibold">${selectedExpense.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Category</Label>
                                  <p className="text-sm">{selectedExpense.category}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Merchant</Label>
                                  <p className="text-sm">{selectedExpense.merchant}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Date</Label>
                                  <p className="text-sm">{selectedExpense.date}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Submitted</Label>
                                  <p className="text-sm">{selectedExpense.submittedAt}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm mt-1">{selectedExpense.description}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Receipts</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {selectedExpense.receipts.map((receipt, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm">{receipt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="comment">Comments (Optional)</Label>
                                <Textarea
                                  id="comment"
                                  placeholder="Add any comments for the employee..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => handleReject(selectedExpense?.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button onClick={() => handleApprove(selectedExpense?.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApprove(expense.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReject(expense.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {pendingExpenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending expense approvals at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}