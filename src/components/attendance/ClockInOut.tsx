import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, Wifi, WifiOff, CheckCircle, Satellite } from "lucide-react";

interface ClockInOutProps {
  isCheckedIn: boolean;
  setIsCheckedIn: (checked: boolean) => void;
  checkInTime: Date | null;
  setCheckInTime: (time: Date | null) => void;
}

export function ClockInOut({ isCheckedIn, setIsCheckedIn, checkInTime, setCheckInTime }: ClockInOutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gpsActivated, setGpsActivated] = useState(false);
  const { toast } = useToast();

  // Activate GPS on component mount
  useEffect(() => {
    const activateGPS = async () => {
      try {
        const userLocation = await getCurrentLocation();
        setLocation(userLocation);
        setGpsActivated(true);
        toast({
          title: "GPS Activated",
          description: "Location services are now active for attendance tracking.",
        });
      } catch (error) {
        setLocationError("GPS activation failed. Please enable location access.");
        setGpsActivated(false);
      }
    };

    activateGPS();
  }, []);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleClockAction = async () => {
    setIsLoading(true);
    setLocationError(null);

    try {
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const now = new Date();
      
      if (!isCheckedIn) {
        setIsCheckedIn(true);
        setCheckInTime(now);
        toast({
          title: "Clocked In Successfully",
          description: `Checked in at ${now.toLocaleTimeString()}`,
        });
      } else {
        setIsCheckedIn(false);
        const duration = checkInTime ? now.getTime() - checkInTime.getTime() : 0;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        
        toast({
          title: "Clocked Out Successfully",
          description: `Total time: ${hours}h ${minutes}m`,
        });
      }
    } catch (error) {
      setLocationError("Unable to get your location. Please enable GPS and try again.");
      toast({
        title: "Location Error",
        description: "Please enable location access to clock in/out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Clock In/Out Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isCheckedIn ? "Clock Out" : "Clock In"}
          </CardTitle>
          <CardDescription>
            {isCheckedIn 
              ? "End your work day and clock out" 
              : "Start your work day with GPS verification"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCheckedIn && checkInTime && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">Checked in at {checkInTime.toLocaleTimeString()}</span>
              </div>
              <div className="text-2xl font-mono font-bold text-primary">
                {formatDuration(checkInTime)}
              </div>
              <p className="text-xs text-muted-foreground">Current session duration</p>
            </div>
          )}

          <Button
            onClick={handleClockAction}
            disabled={isLoading}
            size="lg"
            className="w-full"
            variant={isCheckedIn ? "destructive" : "default"}
          >
            {isLoading ? (
              "Getting Location..."
            ) : isCheckedIn ? (
              "Clock Out"
            ) : (
              "Clock In"
            )}
          </Button>

          {locationError && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Location & Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Status
          </CardTitle>
          <CardDescription>
            Your current location and work status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={isCheckedIn ? "default" : "secondary"}>
                {isCheckedIn ? "Working" : "Not Working"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">GPS Status</span>
              <div className="flex items-center gap-2">
                {gpsActivated ? (
                  <>
                    <Satellite className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">Active</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">Inactive</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location</span>
              <div className="flex items-center gap-2">
                {location ? (
                  <>
                    <Wifi className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">Acquired</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </>
                )}
              </div>
            </div>

            {location && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Office</span>
                  <Badge variant="outline" className="text-success border-success">
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Main Office Building<br />
                  123 Business District, City
                </p>
              </div>
            )}
          </div>

          {isCheckedIn && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You are currently clocked in. Don't forget to clock out when leaving.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}