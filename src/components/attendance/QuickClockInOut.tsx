import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Coffee, Navigation, CheckCircle } from "lucide-react";
import { useTodayAttendance } from "@/hooks/useAttendanceData";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useToast } from "@/hooks/use-toast";

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export function QuickClockInOut() {
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
    if (!employee?.id) {
      toast({
        title: "Error",
        description: "Employee profile not found. Please contact HR.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const location = await getCurrentLocation();
      const result = await clockIn(employee.id, `${location.latitude}, ${location.longitude}`, 'GPS location captured', location);
      if (result) {
        toast({
          title: "Clocked In Successfully",
          description: `Welcome to work! Clocked in at ${new Date().toLocaleTimeString()}`,
        });
      }
    } catch (error) {
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Failed to get GPS location",
        variant: "destructive",
      });
      // Still allow clock in without GPS
      const result = await clockIn(employee.id, "Location unavailable", "GPS location failed");
      if (result) {
        toast({
          title: "Clocked In",
          description: "Clocked in successfully (without GPS location)",
        });
      }
    }
  };

  const handleClockOut = async () => {
    if (!todayRecord) return;
    
    try {
      const location = await getCurrentLocation();
      await clockOut(todayRecord.id, `${location.latitude}, ${location.longitude}`, 'GPS location captured', location);
      toast({
        title: "Clocked Out Successfully",
        description: `Have a great day! Clocked out at ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      toast({
        title: "Location Error", 
        description: error instanceof Error ? error.message : "Failed to get GPS location",
        variant: "destructive",
      });
      // Still allow clock out without GPS
      await clockOut(todayRecord.id, "Location unavailable", "GPS location failed");
      toast({
        title: "Clocked Out",
        description: "Clocked out successfully (without GPS location)",
      });
    }
  };

  const handleStartBreak = () => {
    if (todayRecord) {
      startBreak(todayRecord.id);
      toast({
        title: "Break Started",
        description: "Enjoy your break!",
      });
    }
  };

  const handleEndBreak = () => {
    if (todayRecord) {
      endBreak(todayRecord.id);
      toast({
        title: "Break Ended",
        description: "Welcome back to work!",
      });
    }
  };

  if (loading || !employee) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading clock system...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Clock
          </div>
          <div className="text-lg font-mono text-muted-foreground">
            {currentTime.toLocaleTimeString()}
          </div>
        </CardTitle>
        <CardDescription>
          Quick clock in/out for {employee.first_name} {employee.last_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            {clockedIn ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Currently Clocked In</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Not Clocked In</span>
              </>
            )}
            {isOnBreak && (
              <Badge variant="secondary" className="ml-2">
                <Coffee className="w-3 h-3 mr-1" />
                On Break
              </Badge>
            )}
          </div>
          
          {todayRecord?.clock_in_time && (
            <div className="text-sm text-muted-foreground">
              Since {new Date(todayRecord.clock_in_time).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!clockedIn ? (
            <Button 
              onClick={handleClockIn} 
              className="flex-1" 
              disabled={isGettingLocation}
              size="lg"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isGettingLocation ? "Getting Location..." : "Clock In"}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleClockOut} 
                variant="outline" 
                className="flex-1" 
                disabled={isGettingLocation}
                size="lg"
              >
                <Clock className="w-4 h-4 mr-2" />
                {isGettingLocation ? "Getting Location..." : "Clock Out"}
              </Button>
              
              {!isOnBreak ? (
                <Button onClick={handleStartBreak} variant="secondary" size="lg">
                  <Coffee className="w-4 h-4 mr-2" />
                  Break
                </Button>
              ) : (
                <Button onClick={handleEndBreak} variant="secondary" size="lg">
                  <Coffee className="w-4 h-4 mr-2" />
                  End Break
                </Button>
              )}
            </>
          )}
        </div>

        {/* GPS Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {gpsLocation ? (
            <span>GPS: {gpsLocation.latitude.toFixed(4)}, {gpsLocation.longitude.toFixed(4)}</span>
          ) : isGettingLocation ? (
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 animate-spin" />
              Getting location...
            </span>
          ) : (
            <span>GPS location will be captured automatically</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}