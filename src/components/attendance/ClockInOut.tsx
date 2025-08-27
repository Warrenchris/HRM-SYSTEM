import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Coffee, Navigation } from "lucide-react";
import { useTodayAttendance } from "@/hooks/useAttendanceData";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export function ClockInOut() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [justClockedOut, setJustClockedOut] = useState(false);
  const { user } = useAuth();
  const { employee } = useCurrentEmployee();
  const { records, loading, clockIn, clockOut, startBreak, endBreak, error: attendanceError } = useTodayAttendance(employee?.id);
  const { toast } = useToast();
  
  // Helpers to work with "today"
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  const now = new Date();
  const todaysRecords = records.filter(r => isSameDay(new Date(r.clock_in_time), now));

  // Determine open record for today (no clock_out_time and not explicitly clocked_out)
  const openRecord = todaysRecords
    .filter(r => !r.clock_out_time && r.status !== 'clocked_out')
    .sort((a, b) => new Date(b.clock_in_time).getTime() - new Date(a.clock_in_time).getTime())[0];

  // Determine the most recent record today for display
  const todayRecord = [...todaysRecords].sort((a, b) => new Date(b.clock_in_time).getTime() - new Date(a.clock_in_time).getTime())[0];

  // Consider user clocked in only if there is a current-day record in a working state
  const clockedIn = !justClockedOut && Boolean(openRecord && (openRecord.status === 'clocked_in' || openRecord.status === 'on_break'));
  const isOnBreak = todayRecord?.status === 'on_break';

  // Debug logging removed to reduce console noise during renders

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentLocation = (): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date()
          };
          setGpsLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const handleClockIn = async () => {
    console.log('handleClockIn called - employee:', employee);
    if (!employee?.id) {
      console.log('No employee ID found');
      toast({
        title: "Error",
        description: "Employee profile not found. Please contact HR.",
        variant: "destructive",
      });
      return;
    }

    // Test database connection and table structure
    try {
      const { data: testData, error: testError } = await supabase
        .from('attendance_records')
        .select('id, employee_id, clock_in_time, status')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        toast({
          title: "Database Error",
          description: "Cannot connect to database. Please try again.",
          variant: "destructive",
        });
        return;
      }
      console.log('Database connection test successful, table structure:', testData);
      
      // Test if user can insert into attendance_records
      const { data: insertTest, error: insertError } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('employee_id', employee.id)
        .limit(1);
      
      if (insertError) {
        console.error('Permission test failed:', insertError);
        toast({
          title: "Permission Error",
          description: "You don't have permission to access attendance records.",
          variant: "destructive",
        });
        return;
      }
      console.log('Permission test successful');
    } catch (error) {
      console.error('Database connection test error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to database.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Getting location...');
      const location = await getCurrentLocation();
      console.log('Location obtained:', location);
      const result = await clockIn(employee.id, `${location.latitude}, ${location.longitude}`, 'GPS location captured', location);
      console.log('Clock in result:', result);
      if (result) {
        setJustClockedOut(false);
        toast({
          title: "Clocked In",
          description: "Successfully clocked in with GPS location.",
        });
      }
    } catch (error) {
      console.log('Location error:', error);
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Failed to get GPS location",
        variant: "destructive",
      });
      // Still allow clock in without GPS
      console.log('Attempting clock in without GPS...');
      const result = await clockIn(employee.id, "Location unavailable", "GPS location failed");
      console.log('Clock in without GPS result:', result);
    }
  };

  const handleClockOut = async () => {
    if (!openRecord) return;
    
    try {
      const location = await getCurrentLocation();
      const ok = await clockOut(openRecord.id, `${location.latitude}, ${location.longitude}`, 'GPS location captured', location);
      if (ok) setJustClockedOut(true);
      toast({
        title: "Clocked Out",
        description: "Successfully clocked out with GPS location.",
      });
    } catch (error) {
      toast({
        title: "Location Error", 
        description: error instanceof Error ? error.message : "Failed to get GPS location",
        variant: "destructive",
      });
      // Still allow clock out without GPS
      const ok = await clockOut(openRecord.id, "Location unavailable", "GPS location failed");
      if (ok) setJustClockedOut(true);
    }
  };

  const handleStartBreak = () => {
    if (openRecord) {
      startBreak(openRecord.id);
    }
  };

  const handleEndBreak = () => {
    if (openRecord) {
      endBreak(openRecord.id);
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
          <span className="block text-lg font-mono">{currentTime.toLocaleTimeString()}</span>
          <span className="block text-sm">{currentTime.toLocaleDateString()}</span>
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
          </div>
          
          {todayRecord?.clock_in_time && (
            <div className="text-sm text-muted-foreground mt-1">
              Clocked in at {new Date(todayRecord.clock_in_time).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {gpsLocation ? (
            <span>GPS: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}</span>
          ) : isGettingLocation ? (
            <span className="flex items-center gap-2">
              <Navigation className="w-4 h-4 animate-spin" />
              Getting location...
            </span>
          ) : (
            <span>GPS location will be captured on clock in/out</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <Button disabled className="w-full">Loading...</Button>
          ) : !user ? (
            <div className="text-center text-muted-foreground">
              Please log in to use the time clock
            </div>
          ) : attendanceError ? (
            <div className="text-center text-red-600 text-sm">
              Error: {attendanceError}
            </div>
          ) : !employee ? (
            <div className="text-center text-muted-foreground">
              <div className="mb-2">No employee profile found</div>
              <div className="text-xs text-muted-foreground mb-3">
                Please contact HR to set up your employee profile
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          ) : !clockedIn ? (
            <Button onClick={handleClockIn} className="w-full" disabled={isGettingLocation}>
              <Clock className="w-4 h-4 mr-2" />
              {isGettingLocation ? "Getting Location..." : "Clock In"}
            </Button>
          ) : (
            <>
              <Button onClick={handleClockOut} variant="outline" className="w-full" disabled={isGettingLocation}>
                <Clock className="w-4 h-4 mr-2" />
                {isGettingLocation ? "Getting Location..." : "Clock Out"}
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