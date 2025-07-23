import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, TrendingUp, Calendar } from "lucide-react";

const savingsData = [
  {
    id: "1",
    employeeName: "John Doe",
    employeeId: "EMP001",
    totalSavings: 5200,
    monthlyContribution: 250,
    joinDate: "2023-01-15",
    status: "active",
    interestEarned: 156
  },
  {
    id: "2",
    employeeName: "Jane Smith",
    employeeId: "EMP002",
    totalSavings: 8750,
    monthlyContribution: 300,
    joinDate: "2022-08-10",
    status: "active",
    interestEarned: 262.5
  },
  {
    id: "3",
    employeeName: "Bob Johnson",
    employeeId: "EMP003",
    totalSavings: 3420,
    monthlyContribution: 180,
    joinDate: "2023-03-22",
    status: "active",
    interestEarned: 102.6
  }
];

export function WelfareSavings() {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionType, setContributionType] = useState("");

  const handleAddContribution = () => {
    if (!selectedEmployee || !contributionAmount || !contributionType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Contribution Added",
      description: `${contributionType} contribution of $${contributionAmount} added successfully`,
    });

    setSelectedEmployee("");
    setContributionAmount("");
    setContributionType("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welfare Savings</h2>
          <p className="text-muted-foreground">Manage employee savings contributions and accounts</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Savings Contribution</DialogTitle>
              <DialogDescription>
                Add a new savings contribution for an employee
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMP001">John Doe (EMP001)</SelectItem>
                    <SelectItem value="EMP002">Jane Smith (EMP002)</SelectItem>
                    <SelectItem value="EMP003">Bob Johnson (EMP003)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Contribution Type</Label>
                <Select value={contributionType} onValueChange={setContributionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Contribution</SelectItem>
                    <SelectItem value="voluntary">Voluntary Contribution</SelectItem>
                    <SelectItem value="bonus">Bonus Contribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setSelectedEmployee("");
                setContributionAmount("");
                setContributionType("");
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddContribution}>Add Contribution</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Savings Summary</CardTitle>
          <CardDescription>Overview of welfare savings program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$17,370</div>
              <p className="text-sm text-muted-foreground">Total Savings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$730</div>
              <p className="text-sm text-muted-foreground">Monthly Contributions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$521.1</div>
              <p className="text-sm text-muted-foreground">Interest Earned</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3.0%</div>
              <p className="text-sm text-muted-foreground">APY Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Savings Accounts</CardTitle>
          <CardDescription>Individual savings account details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Total Savings</TableHead>
                <TableHead>Monthly Contribution</TableHead>
                <TableHead>Interest Earned</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savingsData.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.employeeName}</TableCell>
                  <TableCell>{account.employeeId}</TableCell>
                  <TableCell>${account.totalSavings.toLocaleString()}</TableCell>
                  <TableCell>${account.monthlyContribution}</TableCell>
                  <TableCell className="text-green-600">${account.interestEarned}</TableCell>
                  <TableCell>{account.joinDate}</TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({
                          title: "Account Details",
                          description: `Viewing savings details for ${account.employeeName}`,
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({
                          title: "Statement Generated",
                          description: `Savings statement for ${account.employeeName} is ready`,
                        })}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}