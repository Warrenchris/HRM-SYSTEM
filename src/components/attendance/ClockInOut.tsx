import { useState, useEffect } from "react";
import { Clock, MapPin, Coffee, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  status: string; // Allow any string from database
  location?: string;
  clock_out_location?: string;
  notes?: string;
  total_hours?: number;
  break_duration?: number;
  ip_address?: string;
  clock_out_ip_address?: string;
  approved_by?: string;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function ClockInOut() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [currentPosition, setCurrentPosition] = useState<{lat: number; lng: number} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Google Maps API key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) {
          console.error('Edge function error:', error);
          return;
        }
        if (data?.apiKey) {
          setGoogleMapsApiKey(data.apiKey);
        } else {
          console.error('No API key returned from edge function');
        }
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        // Add a toast notification for user feedback
        toast({
          title: "Maps Unavailable",
          description: "Unable to load Google Maps. Location will still be tracked via coordinates.",
          variant: "destructive"
        });
      }
    };
    
    fetchApiKey();
  }, [toast]);

  // Get current user's employee ID
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id, user_id')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.employee_id) {
        setEmployeeId(profile.employee_id);
      } else {
        // If no employee_id, try to create/link one based on email
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('email', user.email)
          .single();
          
        if (employee) {
          // Update profile with employee_id
          await supabase
            .from('profiles')
            .update({ employee_id: employee.id })
            .eq('user_id', user.id);
          setEmployeeId(employee.id);
        }
      }
    };
    
    fetchEmployeeId();
  }, [user]);

  // Fetch current attendance record
  useEffect(() => {
    const fetchCurrentRecord = async () => {
      if (!employeeId) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('clock_in_time', `${today}T00:00:00Z`)
        .lt('clock_in_time', `${today}T23:59:59Z`)
        .order('clock_in_time', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching attendance record:', error);
        return;
      }

      if (data && data.length > 0) {
        setCurrentRecord(data[0] as AttendanceRecord);
      }
    };

    if (employeeId) {
      fetchCurrentRecord();
    }
  }, [employeeId]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(coords);
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.log('Location access denied');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, []);

  const handleClockIn = async () => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Employee profile not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employeeId,
          clock_in_time: new Date().toISOString(),
          status: 'clocked_in',
          location: location,
          ip_address: await fetch('https://api.ipify.org').then(r => r.text()).catch(() => null),
          notes: notes || null
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRecord(data as AttendanceRecord);
      setNotes("");
      
      toast({
        title: "Clocked In",
        description: `Successfully clocked in at ${currentTime.toLocaleTimeString()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clock in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentRecord) return;

    setLoading(true);
    
    try {
      // Get current location and IP for clock out
      let clockOutLocation = "";
      let clockOutIp = null;
      
      // Get GPS location
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });
          clockOutLocation = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (error) {
          console.log('Failed to get location for clock out');
        }
      }
      
      // Get IP address
      try {
        clockOutIp = await fetch('https://api.ipify.org').then(r => r.text());
      } catch (error) {
        console.log('Failed to get IP address');
      }

      const { error } = await supabase
        .from('attendance_records')
        .update({
          clock_out_time: new Date().toISOString(),
          clock_out_location: clockOutLocation || null,
          clock_out_ip_address: clockOutIp || null,
          notes: notes || currentRecord.notes
        })
        .eq('id', currentRecord.id);

      if (error) throw error;

      setCurrentRecord(null);
      setNotes("");
      
      toast({
        title: "Clocked Out",
        description: `Successfully clocked out at ${currentTime.toLocaleTimeString()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clock out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBreakStart = async () => {
    if (!currentRecord) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          break_start_time: new Date().toISOString(),
          status: 'on_break'
        })
        .eq('id', currentRecord.id);

      if (error) throw error;

      setCurrentRecord({
        ...currentRecord,
        break_start_time: new Date().toISOString(),
        status: 'on_break'
      });
      
      toast({
        title: "Break Started",
        description: "Break time started",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start break",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBreakEnd = async () => {
    if (!currentRecord) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          break_end_time: new Date().toISOString(),
          status: 'clocked_in'
        })
        .eq('id', currentRecord.id);

      if (error) throw error;

      setCurrentRecord({
        ...currentRecord,
        break_end_time: new Date().toISOString(),
        status: 'clocked_in'
      });
      
      toast({
        title: "Break Ended",
        description: "Welcome back from break",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end break",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!currentRecord) return "text-muted-foreground";
    
    switch (currentRecord.status) {
      case 'clocked_in':
        return "text-green-600";
      case 'on_break':
        return "text-yellow-600";
      case 'clocked_out':
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusText = () => {
    if (!currentRecord) return "Not clocked in";
    
    switch (currentRecord.status) {
      case 'clocked_in':
        return "Clocked In";
      case 'on_break':
        return "On Break";
      case 'clocked_out':
        return "Clocked Out";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Clock
          </CardTitle>
          <CardDescription>
            Current time: {currentTime.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="text-center p-6 border rounded-lg">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {currentRecord && (
              <div className="text-sm text-muted-foreground mt-2">
                Clocked in at: {new Date(currentRecord.clock_in_time).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Location Info */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-blue-500" />
              Real-time Location
            </div>
            {location ? (
              <div className="space-y-3">
                <div className="text-xs text-green-600 font-medium">✓ Location detected</div>
                <div className="text-xs font-mono text-muted-foreground">{location}</div>
                
                {/* Google Maps */}
                {currentPosition && googleMapsApiKey && (
                  <div className="h-48 w-full rounded-lg overflow-hidden border">
                    <APIProvider apiKey={googleMapsApiKey}>
                      <Map
                        defaultZoom={15}
                        center={currentPosition}
                        mapId="attendance-map"
                        style={{ width: '100%', height: '100%' }}
                      >
                        <Marker 
                          position={currentPosition}
                          title="Your Current Location"
                        />
                      </Map>
                    </APIProvider>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-orange-600">📍 Getting location...</div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your work day..."
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {!currentRecord ? (
              <Button 
                onClick={handleClockIn} 
                disabled={loading}
                className="col-span-2"
                size="lg"
              >
                <Clock className="mr-2 h-4 w-4" />
                Clock In
              </Button>
            ) : currentRecord.status === 'clocked_out' ? (
              <Button 
                onClick={handleClockIn} 
                disabled={loading}
                className="col-span-2"
                size="lg"
              >
                <Clock className="mr-2 h-4 w-4" />
                Clock In Again
              </Button>
            ) : (
              <>
                {currentRecord.status === 'clocked_in' && (
                  <Button 
                    onClick={handleBreakStart} 
                    disabled={loading}
                    variant="outline"
                  >
                    <Coffee className="mr-2 h-4 w-4" />
                    Start Break
                  </Button>
                )}
                
                {currentRecord.status === 'on_break' && (
                  <Button 
                    onClick={handleBreakEnd} 
                    disabled={loading}
                    variant="outline"
                  >
                    <Coffee className="mr-2 h-4 w-4" />
                    End Break
                  </Button>
                )}
                
                <Button 
                  onClick={handleClockOut} 
                  disabled={loading}
                  variant="destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Clock Out
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}