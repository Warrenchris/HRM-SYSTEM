import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TransferAssetDialog } from "./TransferAssetDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  ArrowRightLeft,
  Trash2,
  Eye
} from "lucide-react";
import { format } from "date-fns";

interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  category: string;
  status: string;
  condition: string;
  location: string;
  current_employee_id?: string;
  purchase_date: string;
  purchase_value: number;
  current_value?: number;
  vendor?: string;
  serial_number?: string;
  warranty_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface AssetTableProps {
  filterType?: "all" | "maintenance" | "available" | "assigned";
}

export function AssetTable({ filterType = "all" }: AssetTableProps) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('assets')
        .select(`
          *,
          employee:employees!assets_current_employee_id_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assets:', error);
        toast({
          title: "Error",
          description: "Failed to load assets",
          variant: "destructive",
        });
        return;
      }

      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (asset.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    const matchesLocation = locationFilter === "all" || asset.location === locationFilter;
    
    // Apply filter type
    let matchesFilterType = true;
    if (filterType === "maintenance") {
      matchesFilterType = asset.status === "maintenance" || asset.status === "under_repair";
    } else if (filterType === "available") {
      matchesFilterType = asset.status === "available";
    } else if (filterType === "assigned") {
      matchesFilterType = asset.status === "assigned" && !!asset.current_employee_id;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation && matchesFilterType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: "bg-green-500", label: "Available" },
      assigned: { color: "bg-blue-500", label: "Assigned" },
      maintenance: { color: "bg-yellow-500", label: "Maintenance" },
      under_repair: { color: "bg-orange-500", label: "Under Repair" },
      disposed: { color: "bg-red-500", label: "Disposed" },
      lost: { color: "bg-purple-500", label: "Lost" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", label: status };
    
    return (
      <Badge variant="outline" className={`${config.color} text-white border-transparent`}>
        {config.label}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    const conditionConfig = {
      excellent: { color: "text-green-600", label: "Excellent" },
      good: { color: "text-blue-600", label: "Good" },
      fair: { color: "text-yellow-600", label: "Fair" },
      poor: { color: "text-red-600", label: "Poor" }
    };
    
    const config = conditionConfig[condition as keyof typeof conditionConfig] || { color: "text-gray-600", label: condition };
    
    return (
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleTransferAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsTransferDialogOpen(true);
  };

  const handleTransferComplete = () => {
    fetchAssets(); // Refresh the asset list
    setIsTransferDialogOpen(false);
    setSelectedAsset(null);
  };

  const getFilterTitle = () => {
    switch (filterType) {
      case "maintenance": return "Assets Under Maintenance";
      case "available": return "Available Assets";
      case "assigned": return "Assigned Assets";
      default: return "Asset Inventory";
    }
  };

  const getFilterDescription = () => {
    switch (filterType) {
      case "maintenance": return "Assets currently under maintenance or repair";
      case "available": return "Assets available for assignment";
      case "assigned": return "Assets currently assigned to employees";
      default: return "Complete list of all company assets";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getFilterTitle()}</CardTitle>
          <CardDescription>{getFilterDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading assets...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {getFilterTitle()}
          </CardTitle>
          <CardDescription>
            {getFilterDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets by name, tag, category, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="under_repair">Under Repair</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                  <SelectItem value="Office Furniture">Office Furniture</SelectItem>
                  <SelectItem value="Vehicles">Vehicles</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Office Floor 1">Office Floor 1</SelectItem>
                  <SelectItem value="Office Floor 2">Office Floor 2</SelectItem>
                  <SelectItem value="Office Floor 3">Office Floor 3</SelectItem>
                  <SelectItem value="IT Storage">IT Storage</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Parking Lot A">Parking Lot A</SelectItem>
                  <SelectItem value="Parking Lot B">Parking Lot B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-lg font-bold">{filteredAssets.length}</div>
                <div className="text-xs text-muted-foreground">Total Assets</div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-lg font-bold">
                  {filteredAssets.filter(a => a.status === "available").length}
                </div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-lg font-bold">
                  {filteredAssets.filter(a => a.status === "assigned").length}
                </div>
                <div className="text-xs text-muted-foreground">Assigned</div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-lg font-bold">
                  {formatCurrency(filteredAssets.reduce((sum, a) => sum + a.purchase_value, 0))}
                </div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredAssets.length} of {assets.length} assets
          </div>

          {/* Assets Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Purchase Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">{asset.asset_tag}</div>
                          <div className="text-xs text-muted-foreground">{asset.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(asset.status)}
                      </TableCell>
                      <TableCell>
                        {getConditionBadge(asset.condition)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{asset.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {asset.employee ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {asset.employee.first_name} {asset.employee.last_name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {asset.employee.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="font-medium">{formatCurrency(asset.purchase_value)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(asset.purchase_date), "MMM dd, yyyy")}</span>
                          </div>
                          {asset.vendor && (
                            <div className="text-xs text-muted-foreground">
                              {asset.vendor}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Asset
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTransferAsset(asset)}>
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Transfer Asset
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Asset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="space-y-2">
                        <div className="text-muted-foreground">No assets found</div>
                        <div className="text-sm text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Asset Dialog */}
      <TransferAssetDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        asset={selectedAsset}
        onTransferComplete={handleTransferComplete}
      />
    </>
  );
}