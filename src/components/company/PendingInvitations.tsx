import { useState, useEffect } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  companyName: string;
}

export function PendingInvitations() {
  const { acceptInvitation, getPendingInvitations, refreshCompanies } = useCompany();
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch invitations");
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setLoading(true);
    try {
      const success = await acceptInvitation(invitationId);
      if (success) {
        toast.success("Invitation accepted successfully");
        await fetchInvitations();
        await refreshCompanies();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!invitations.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>Accept invitations to join companies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{invitation.companyName}</h4>
                <p className="text-sm text-muted-foreground">
                  Role: {invitation.role}
                </p>
              </div>
              <Button
                onClick={() => handleAcceptInvitation(invitation.id)}
                disabled={loading}
              >
                {loading ? "Accepting..." : "Accept"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
