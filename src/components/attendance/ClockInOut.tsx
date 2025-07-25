import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Coffee, Navigation } from "lucide-react";
import { useTodayAttendance } from "@/hooks/useAttendanceData";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useToast } from "@/hooks/use-toast";

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export function ClockInOut() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { employee } = useCurrentEmployee();
  const { records, loading, clockIn, clockOut, startBreak, endBreak } = useTodayAttendance(employee?.id);
  const { toast } = useToast();
  
  const todayRecord = records[0]; // Most recent record for today
  const clockedIn = todayRecord && !todayRecord.clock_out_time;
  const isOnBreak = todayRecord?.status === 'on_break';

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
    
    try {
      console.log('Getting location...');
      const location = await getCurrentLocation();
      console.log('Location obtained:', location);
      const result = await clockIn(employee.id, `${location.latitude}, ${location.longitude}`, 'GPS location captured', location);
      console.log('Clock in result:', result);
      if (result) {
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
    if (!todayRecord) return;
    
    try {
      const location = await getCurrentLocation();
      await clockOut(todayRecord.id, `${location.latitude}, ${location.longitude}`, 'GPS location captured', location);
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
      await clockOut(todayRecord.id, "Location unavailable", "GPS location failed");
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
          ) : !employee ? (
            <div className="text-center text-muted-foreground">
              No employee profile found
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