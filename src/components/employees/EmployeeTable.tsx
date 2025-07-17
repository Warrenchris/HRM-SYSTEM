import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface EmployeeTableProps {
  searchTerm: string;
  selectedDepartment: string;
}

// Mock data - In real implementation, this would come from Supabase
const mockEmployees = [
  {
    id: "EMP001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    position: "Senior Software Engineer",
    status: "Active",
    joinDate: "2022-01-15",
    avatar: ""
  },
  {
    id: "EMP002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@company.com",
    phone: "+1 (555) 234-5678",
    department: "Marketing",
    position: "Marketing Manager",
    status: "Active",
    joinDate: "2021-08-20",
    avatar: ""
  },
  {
    id: "EMP003",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@company.com",
    phone: "+1 (555) 345-6789",
    department: "Sales",
    position: "Sales Representative",
    status: "On Leave",
    joinDate: "2023-03-10",
    avatar: ""
  },
  {
    id: "EMP004",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@company.com",
    phone: "+1 (555) 456-7890",
    department: "HR",
    position: "HR Specialist",
    status: "Active",
    joinDate: "2020-11-05",
    avatar: ""
  },
  {
    id: "EMP005",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@company.com",
    phone: "+1 (555) 567-8901",
    department: "Finance",
    position: "Financial Analyst",
    status: "Active",
    joinDate: "2022-06-12",
    avatar: ""
  }
];

export function EmployeeTable({ searchTerm, selectedDepartment }: EmployeeTableProps) {
  const { toast } = useToast();

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === "all" || 
      employee.department.toLowerCase() === selectedDepartment.toLowerCase();

    return matchesSearch && matchesDepartment;
  });

  const handleAction = (action: string, employee: any) => {
    toast({
      title: `${action} Employee`,
      description: `${action} action for ${employee.firstName} ${employee.lastName}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
      case "on leave":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">On Leave</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {employee.id}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{employee.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-foreground">{employee.department}</span>
              </TableCell>
              <TableCell>
                <span className="text-foreground">{employee.position}</span>
              </TableCell>
              <TableCell>
                {getStatusBadge(employee.status)}
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {new Date(employee.joinDate).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-md">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleAction("View", employee)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("Edit", employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Employee
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleAction("Delete", employee)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Employee
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {filteredEmployees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No employees found matching your criteria.
        </div>
      )}
    </div>
  );
}