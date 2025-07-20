import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { FileText, Calendar, DollarSign, AlertTriangle, Eye, Edit, Download } from "lucide-react";

interface Contract {
  id: string;
  contractNumber: string;
  vendor: string;
  title: string;
  type: "service" | "supply" | "maintenance" | "lease";
  value: number;
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired" | "renewed";
  renewalOption: boolean;
  autoRenewal: boolean;
  daysUntilExpiry: number;
}

export function ContractManagement() {
  const contracts: Contract[] = [
    {
      id: "1",
      contractNumber: "CON-2024-001",
      vendor: "TechCorp Solutions",
      title: "IT Equipment Supply Agreement",
      type: "supply",
      value: 500000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "active",
      renewalOption: true,
      autoRenewal: false,
      daysUntilExpiry: 164
    },
    {
      id: "2",
      contractNumber: "CON-2024-002",
      vendor: "CleanPro Services",
      title: "Office Cleaning Services",
      type: "service",
      value: 120000,
      startDate: "2024-06-01",
      endDate: "2025-05-31",
      status: "active",
      renewalOption: true,
      autoRenewal: true,
      daysUntilExpiry: 315
    },
    {
      id: "3",
      contractNumber: "CON-2023-015",
      vendor: "Industrial Equipment Ltd",
      title: "Equipment Maintenance Agreement",
      type: "maintenance",
      value: 75000,
      startDate: "2023-08-01",
      endDate: "2024-07-31",
      status: "expiring",
      renewalOption: true,
      autoRenewal: false,
      daysUntilExpiry: 11
    },
    {
      id: "4",
      contractNumber: "CON-2024-003",
      vendor: "Office Space LLC",
      title: "Warehouse Lease Agreement",
      type: "lease",
      value: 240000,
      startDate: "2024-01-01",
      endDate: "2026-12-31",
      status: "active",
      renewalOption: true,
      autoRenewal: false,
      daysUntilExpiry: 894
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Active", className: "bg-green-100 text-green-800" },
      expiring: { variant: "default" as const, label: "Expiring", className: "bg-orange-100 text-orange-800" },
      expired: { variant: "destructive" as const, label: "Expired", className: "" },
      renewed: { variant: "default" as const, label: "Renewed", className: "bg-blue-100 text-blue-800" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge 
        variant={config.variant} 
        className={config.className || ""}
      >
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      service: { variant: "secondary" as const, label: "Service" },
      supply: { variant: "outline" as const, label: "Supply" },
      maintenance: { variant: "secondary" as const, label: "Maintenance" },
      lease: { variant: "outline" as const, label: "Lease" }
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getExpiryProgress = (daysUntilExpiry: number) => {
    // Assuming contracts are typically 1 year (365 days)
    const totalDays = 365;
    const progress = ((totalDays - daysUntilExpiry) / totalDays) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getExpiryColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 30) return "text-red-600";
    if (daysUntilExpiry <= 90) return "text-orange-600";
    return "text-green-600";
  };

  // Summary statistics
  const totalValue = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const expiringContracts = contracts.filter(c => c.status === "expiring").length;
  const activeContracts = contracts.filter(c => c.status === "active").length;
  const autoRenewals = contracts.filter(c => c.autoRenewal).length;

  return (
    <div className="space-y-6">
      {/* Contract Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active contracts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringContracts}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{autoRenewals}</div>
            <p className="text-xs text-muted-foreground">Automatic renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Management</CardTitle>
          <CardDescription>
            Manage vendor contracts and track renewal dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days to Expiry</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Auto Renew</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.contractNumber}</div>
                      <div className="text-sm text-muted-foreground">{contract.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>{contract.vendor}</TableCell>
                  <TableCell>{getTypeBadge(contract.type)}</TableCell>
                  <TableCell>${contract.value.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={getExpiryColor(contract.daysUntilExpiry)}>
                      {contract.daysUntilExpiry} days
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-16">
                      <Progress 
                        value={getExpiryProgress(contract.daysUntilExpiry)} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={contract.autoRenewal ? "default" : "secondary"}>
                      {contract.autoRenewal ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contract Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Alerts</CardTitle>
          <CardDescription>
            Important contract notifications and upcoming actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Equipment Maintenance Contract Expiring</p>
                  <p className="text-sm text-red-600">CON-2023-015 with Industrial Equipment Ltd expires in 11 days</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Renew Now
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Contract Review Required</p>
                  <p className="text-sm text-orange-600">IT Equipment Supply Agreement due for annual review</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Schedule Review
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Auto-Renewal Scheduled</p>
                  <p className="text-sm text-blue-600">Office Cleaning Services will auto-renew in 315 days</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Modify Terms
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}