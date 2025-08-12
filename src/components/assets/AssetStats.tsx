import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wrench,
  TrendingUp,
  DollarSign,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoryItem { name: string; count: number; color: string }
interface StatsSummary {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  needsAttention: number;
  totalValue: number;
  upcomingCount: number;
}

export function AssetStats() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Basic counts
        const [allRes, activeRes, maintRes, attentionRes, sumRes] = await Promise.all([
          supabase.from('assets').select('*', { count: 'exact', head: true }),
          supabase
            .from('assets')
            .select('*', { count: 'exact', head: true })
            .not('status', 'in', '(maintenance,repair,return_to_store,write_off)'),
          supabase
            .from('assets')
            .select('*', { count: 'exact', head: true })
            .in('status', ['maintenance', 'repair']),
          supabase
            .from('assets')
            .select('*', { count: 'exact', head: true })
            .in('status', ['repair', 'write_off']),
          supabase
            .from('assets')
            .select('purchase_value')
        ]);

        if (allRes.error) throw allRes.error;
        if (activeRes.error) throw activeRes.error;
        if (maintRes.error) throw maintRes.error;
        if (attentionRes.error) throw attentionRes.error;
        if (sumRes.error) throw sumRes.error;

        const totalValue = (sumRes.data || []).reduce((sum: number, row: any) => sum + Number(row.purchase_value || 0), 0);

        // Category breakdown
        const { data: categoryRows, error: categoryError } = await supabase
          .from('assets')
          .select('category');
        if (categoryError) throw categoryError;

        const counts: Record<string, number> = {};
        (categoryRows || []).forEach((r) => {
          counts[r.category] = (counts[r.category] || 0) + 1;
        });

        const palette = ['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-pink-500','bg-teal-500','bg-amber-600','bg-indigo-500'];
        const categoryItems: CategoryItem[] = Object.entries(counts)
          .sort((a,b) => b[1]-a[1])
          .map(([name, count], idx) => ({ name, count, color: palette[idx % palette.length] }));

        // Upcoming: treat as warranties expiring in next 60 days
        const today = new Date();
        const upcomingEnd = new Date();
        upcomingEnd.setDate(today.getDate() + 60);
        const { data: upcomingRows, error: upcomingError } = await supabase
          .from('assets')
          .select('id')
          .not('warranty_date', 'is', null)
          .gte('warranty_date', today.toISOString().split('T')[0])
          .lte('warranty_date', upcomingEnd.toISOString().split('T')[0]);
        if (upcomingError) throw upcomingError;

        setStats({
          totalAssets: allRes.count || 0,
          activeAssets: activeRes.count || 0,
          maintenanceAssets: maintRes.count || 0,
          needsAttention: attentionRes.count || 0,
          totalValue,
          upcomingCount: (upcomingRows || []).length,
        });
        setCategories(categoryItems);
      } catch (error) {
        console.error('Error loading asset stats:', error);
        toast({ title: 'Error', description: 'Failed to load asset statistics', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const categoryWithPercent = useMemo(() => {
    const total = categories.reduce((sum, c) => sum + c.count, 0) || 1;
    return categories.map((c) => ({ ...c, percentage: Math.round((c.count / total) * 100) }));
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Main Asset Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{loading ? '...' : stats?.totalAssets ?? 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">in inventory</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{loading ? '...' : stats?.activeAssets ?? 0}</span>
              </div>
              <Progress value={stats ? Math.min(100, Math.round(((stats.activeAssets || 0) / Math.max(1, stats.totalAssets || 1)) * 100)) : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">in operation</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{loading ? '...' : stats?.maintenanceAssets ?? 0}</span>
              </div>
              <Progress value={stats ? Math.min(100, Math.round(((stats.maintenanceAssets || 0) / Math.max(1, stats.totalAssets || 1)) * 100)) : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">scheduled/ongoing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{loading ? '...' : stats?.needsAttention ?? 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">requires action</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryWithPercent.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${category.color}`} />
                      <span>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.count}</span>
                      <span className="text-muted-foreground">({category.percentage}%)</span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance & Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Total Value</div>
                    <div className="text-xs text-muted-foreground">asset portfolio</div>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  {loading ? '...' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats?.totalValue || 0)}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wrench className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">This Month</div>
                    <div className="text-xs text-muted-foreground">upcoming warranties</div>
                  </div>
                </div>
                <div className="text-xl font-bold">{loading ? '...' : stats?.upcomingCount ?? 0}</div>
              </div>
              
              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <button className="w-full p-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors text-left">
                  📊 View Depreciation Report
                </button>
                <button className="w-full p-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors text-left">
                  🔧 Schedule Maintenance
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}