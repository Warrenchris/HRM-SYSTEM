import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Edit, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Policy {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  status: "active" | "draft" | "archived";
  approvedBy: string;
}

export function CompanyPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: "POL001",
      title: "Employee Code of Conduct",
      category: "HR",
      description: "Guidelines for professional behavior and workplace ethics",
      content: "All employees are expected to maintain high standards of professional conduct...",
      version: "2.1",
      effectiveDate: "2024-01-01",
      lastUpdated: "2024-07-15",
      status: "active",
      approvedBy: "CEO",
    },
    {
      id: "POL002",
      title: "Remote Work Policy",
      category: "HR",
      description: "Guidelines and requirements for remote work arrangements",
      content: "Remote work arrangements must be approved by direct supervisor...",
      version: "1.3",
      effectiveDate: "2024-03-01",
      lastUpdated: "2024-06-20",
      status: "active",
      approvedBy: "HR Director",
    },
    {
      id: "POL003",
      title: "Information Security Policy",
      category: "IT",
      description: "Data protection and cybersecurity guidelines",
      content: "All employees must follow security protocols to protect company data...",
      version: "3.0",
      effectiveDate: "2024-01-15",
      lastUpdated: "2024-07-01",
      status: "active",
      approvedBy: "CTO",
    },
    {
      id: "POL004",
      title: "Expense Reimbursement Policy",
      category: "Finance",
      description: "Guidelines for submitting and approving expense claims",
      content: "Business expenses must be pre-approved and properly documented...",
      version: "1.5",
      effectiveDate: "2024-02-01",
      lastUpdated: "2024-05-30",
      status: "active",
      approvedBy: "CFO",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const categories = ["HR", "IT", "Finance", "Legal", "Operations"];

  const getStatusBadge = (status: Policy["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Draft</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "HR": "bg-blue-100 text-blue-800 hover:bg-blue-100",
      "IT": "bg-purple-100 text-purple-800 hover:bg-purple-100",
      "Finance": "bg-green-100 text-green-800 hover:bg-green-100",
      "Legal": "bg-red-100 text-red-800 hover:bg-red-100",
      "Operations": "bg-orange-100 text-orange-800 hover:bg-orange-100",
    };
    
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{category}</Badge>;
  };

  const filteredPolicies = policies.filter(policy => 
    selectedCategory === "all" || policy.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
                <p className="text-2xl font-bold">{policies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{policies.filter(p => p.status === "active").length}</p>
                </div>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">{policies.filter(p => p.status === "draft").length}</p>
                </div>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{new Set(policies.map(p => p.category)).size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Company Policies
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Policy</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Policy Title</Label>
                        <Input placeholder="Enter policy title" />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea placeholder="Brief description of the policy" rows={2} />
                    </div>
                    <div>
                      <Label>Policy Content</Label>
                      <Textarea placeholder="Detailed policy content..." rows={10} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline">Save as Draft</Button>
                      <Button>Publish Policy</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPolicies.map((policy) => (
              <Card key={policy.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{policy.title}</h3>
                        {getCategoryBadge(policy.category)}
                        {getStatusBadge(policy.status)}
                        <Badge variant="outline" className="text-xs">v{policy.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {policy.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
                        <span>Updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                        <span>Approved by: {policy.approvedBy}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}