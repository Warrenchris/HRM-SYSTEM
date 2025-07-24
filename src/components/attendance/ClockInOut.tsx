import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Coffee } from "lucide-react";
import { useTodayAttendance } from "@/hooks/useAttendanceData";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export function ClockInOut() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { employee } = useCurrentEmployee();
  const { records, loading, clockIn, clockOut, startBreak, endBreak } = useTodayAttendance(employee?.id);
  
  const todayRecord = records[0]; // Most recent record for today
  const clockedIn = todayRecord && !todayRecord.clock_out_time;
  const isOnBreak = todayRecord?.status === 'on_break';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    if (employee?.id) {
      clockIn(employee.id);
    }
  };

  const handleClockOut = () => {
    if (todayRecord) {
      clockOut(todayRecord.id);
    }
  };

  const handleStartBreak = () => {
    if (todayRecord) {
      startBreak(todayRecord.id);
    }
  };

  const handleEndBreak = () => {
    if (todayRecord) {
      endBreak(todayRecord.id);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />
          Time Clock
        </CardTitle>
        <CardDescription>
          <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
          <div className="text-sm">{currentTime.toLocaleDateString()}</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {clockedIn ? (
              <span className="text-green-600 font-medium">Clocked In</span>
            ) : (
              <span className="text-muted-foreground">Not Clocked In</span>
            )}
            {isOnBreak && (
              <Badge variant="secondary" className="ml-2">
                <Coffee className="w-3 h-3 mr-1" />
                On Break
              </Badge>
            )}
            {todayRecord?.clock_in_time && (
              <div className="text-sm text-muted-foreground mt-1">
                Clocked in at {new Date(todayRecord.clock_in_time).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Office - Main Building</span>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <Button disabled className="w-full">Loading...</Button>
          ) : !employee ? (
            <div className="text-center text-muted-foreground">
              No employee profile found
            </div>
          ) : !clockedIn ? (
            <Button onClick={handleClockIn} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Clock In
            </Button>
          ) : (
            <>
              <Button onClick={handleClockOut} variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
              
              {!isOnBreak ? (
                <Button onClick={handleStartBreak} variant="secondary" className="w-full">
                  <Coffee className="w-4 h-4 mr-2" />
                  Start Break
                </Button>
              ) : (
                <Button onClick={handleEndBreak} variant="secondary" className="w-full">
                  <Coffee className="w-4 h-4 mr-2" />
                  End Break
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}