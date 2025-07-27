import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pin, Calendar, Users, Trash2, Archive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_audience: string;
  is_pinned: boolean;
  published_at: string;
  expires_at: string | null;
  created_at: string;
  status: string;
  author_id: string;
}

interface AnnouncementListProps {
  refreshTrigger: number;
  isHR?: boolean;
}

export function AnnouncementList({ refreshTrigger, isHR = false }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      let query = supabase
        .from("announcements")
        .select("*")
        .eq("status", "active")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [refreshTrigger]);

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement archived successfully",
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error("Error archiving announcement:", error);
      toast({
        title: "Error",
        description: "Failed to archive announcement",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "normal":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getAudienceIcon = (audience: string) => {
    return <Users className="h-4 w-4" />;
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">No announcements</h3>
            <p className="text-sm text-muted-foreground">
              {isHR ? "Create your first announcement to get started." : "Check back later for updates."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className={`${announcement.is_pinned ? "border-primary" : ""}`}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1">
                {announcement.is_pinned && (
                  <Pin className="h-4 w-4 text-primary" />
                )}
                <CardTitle className="text-lg">{announcement.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(announcement.priority)}>
                  {announcement.priority}
                </Badge>
                {isHR && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchive(announcement.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(announcement.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
              {announcement.content}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {getAudienceIcon(announcement.target_audience)}
                  <span className="capitalize">{announcement.target_audience.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(announcement.published_at), { addSuffix: true })}</span>
                </div>
              </div>
              
              {announcement.expires_at && (
                <div className="text-xs text-muted-foreground">
                  Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}