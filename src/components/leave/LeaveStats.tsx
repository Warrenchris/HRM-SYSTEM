import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useLeaveBalances } from "@/hooks/useLeaveData";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export function LeaveStats() {
  const { employee, loading: employeeLoading } = useCurrentEmployee();
  const { balances, loading, error } = useLeaveBalances(employee?.id);

  if (loading || employeeLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-8 bg-muted animate-pulse rounded"></div>
                <div className="h-2 bg-muted animate-pulse rounded"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Failed to load leave balances: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const getLeaveIcon = (leaveName: string) => {
    switch (leaveName.toLowerCase()) {
      case 'annual leave':
        return Calendar;
      case 'sick leave':
        return AlertCircle;
      case 'personal leave':
        return Clock;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {balances.map((balance) => {
        const available = balance.allocated_days - balance.used_days - balance.pending_days + balance.carried_over_days;
        const totalAllocated = balance.allocated_days + balance.carried_over_days;
        const usagePercentage = totalAllocated > 0 ? ((balance.used_days + balance.pending_days) / totalAllocated) * 100 : 0;
        const Icon = getLeaveIcon(balance.leave_type?.name || '');

        return (
          <Card key={balance.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{balance.leave_type?.name}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{Math.max(0, available)}</span>
                  <Badge variant="outline" className="text-xs">
                    {totalAllocated} total
                  </Badge>
                </div>
                
                <Progress value={Math.min(100, usagePercentage)} className="h-2" />
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-green-600">{Math.max(0, available)}</div>
                    <div className="text-muted-foreground">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">{balance.used_days}</div>
                    <div className="text-muted-foreground">Used</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{balance.pending_days}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                </div>
                
                {balance.carried_over_days > 0 && (
                  <div className="text-xs text-center">
                    <Badge variant="secondary" className="text-xs">
                      +{balance.carried_over_days} carried over
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}