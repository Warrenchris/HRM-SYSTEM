import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Eye, Mail, Phone, Star, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  location: string;
  status: "new" | "reviewing" | "shortlisted" | "interviewed" | "offered" | "hired" | "rejected";
  rating?: number;
  appliedDate: string;
  resumeUrl?: string;
  skills: string[];
  salary: string;
  notes?: string;
  source: "website" | "linkedin" | "referral" | "agency";
}

export function CandidateManagement() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [zapierWebhook, setZapierWebhook] = useState("");
  const { toast } = useToast();

  const candidates: Candidate[] = [
    {
      id: "C001",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+254-712-345-678",
      position: "Senior Frontend Developer",
      experience: "6 years",
      location: "Nairobi, Kenya",
      status: "shortlisted",
      rating: 4.5,
      appliedDate: "2024-07-20",
      skills: ["React", "TypeScript", "Node.js", "AWS"],
      salary: "KES 1,000,000",
      source: "linkedin",
      notes: "Strong technical background, excellent communication skills",
    },
    {
      id: "C002", 
      name: "Michael Ochieng",
      email: "m.ochieng@email.com",
      phone: "+254-722-456-789",
      position: "Product Manager",
      experience: "4 years",
      location: "Remote",
      status: "interviewed",
      rating: 4.0,
      appliedDate: "2024-07-18",
      skills: ["Product Strategy", "Agile", "Data Analysis", "Leadership"],
      salary: "KES 800,000",
      source: "website",
      notes: "Great product sense, needs to improve on stakeholder management",
    },
    {
      id: "C003",
      name: "Grace Wanjiku",
      email: "grace.w@email.com",
      phone: "+254-733-567-890",
      position: "UI/UX Designer",
      experience: "3 years",
      location: "Nairobi, Kenya",
      status: "new",
      appliedDate: "2024-07-22",
      skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
      salary: "KES 600,000",
      source: "referral",
    },
    {
      id: "C004",
      name: "David Kipchoge",
      email: "d.kipchoge@email.com", 
      phone: "+254-744-678-901",
      position: "Senior Frontend Developer",
      experience: "5 years",
      location: "Mombasa, Kenya",
      status: "offered",
      rating: 4.8,
      appliedDate: "2024-07-15",
      skills: ["React", "Vue.js", "GraphQL", "Docker"],
      salary: "KES 1,100,000",
      source: "agency",
      notes: "Exceptional candidate, already made offer",
    },
  ];

  const positions = [...new Set(candidates.map(c => c.position))];

  const getStatusBadge = (status: Candidate["status"]) => {
    switch (status) {
      case "new":
        return <Badge variant="outline">New</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reviewing</Badge>;
      case "shortlisted":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Shortlisted</Badge>;
      case "interviewed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Interviewed</Badge>;
      case "offered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Offered</Badge>;
      case "hired":
        return <Badge className="bg-green-600 text-white hover:bg-green-600">Hired</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
    }
  };

  const getSourceBadge = (source: Candidate["source"]) => {
    switch (source) {
      case "website":
        return <Badge variant="outline">Website</Badge>;
      case "linkedin":
        return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">LinkedIn</Badge>;
      case "referral":
        return <Badge className="bg-green-50 text-green-700 hover:bg-green-50">Referral</Badge>;
      case "agency":
        return <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-50">Agency</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleStatusChange = async (candidateId: string, newStatus: Candidate["status"], candidateName: string) => {
    // If Zapier webhook is provided, trigger it
    if (zapierWebhook) {
      try {
        await fetch(zapierWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            action: "candidate_status_changed",
            candidate_id: candidateId,
            candidate_name: candidateName,
            new_status: newStatus,
            timestamp: new Date().toISOString(),
          }),
        });

        toast({
          title: "Status Updated & Automated",
          description: `${candidateName}'s status updated to ${newStatus} and Zapier webhook triggered`,
        });
      } catch (error) {
        toast({
          title: "Status Updated",
          description: `${candidateName}'s status updated to ${newStatus}`,
        });
      }
    } else {
      toast({
        title: "Status Updated",
        description: `${candidateName}'s status updated to ${newStatus}`,
      });
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const statusMatch = selectedFilter === "all" || candidate.status === selectedFilter;
    const positionMatch = selectedPosition === "all" || candidate.position === selectedPosition;
    const searchMatch = searchTerm === "" || 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && positionMatch && searchMatch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidate Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Input
            placeholder="Enter Zapier webhook URL for automation..."
            value={zapierWebhook}
            onChange={(e) => setZapierWebhook(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional: Automatically trigger workflows when candidate status changes
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                        <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.position}</div>
                      <div className="text-sm text-muted-foreground">
                        Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.experience}</div>
                      <div className="text-sm text-muted-foreground">{candidate.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                  <TableCell>
                    {candidate.rating ? (
                      <div className="flex items-center gap-1">
                        {renderStars(candidate.rating)}
                        <span className="ml-1 text-sm">{candidate.rating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not rated</span>
                    )}
                  </TableCell>
                  <TableCell>{getSourceBadge(candidate.source)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Candidate Profile - {candidate.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Contact Information</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Email:</strong> {candidate.email}</p>
                                  <p><strong>Phone:</strong> {candidate.phone}</p>
                                  <p><strong>Location:</strong> {candidate.location}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Application Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Position:</strong> {candidate.position}</p>
                                  <p><strong>Experience:</strong> {candidate.experience}</p>
                                  <p><strong>Expected Salary:</strong> {candidate.salary}</p>
                                  <p><strong>Source:</strong> {candidate.source}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Skills</h4>
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.map((skill) => (
                                  <Badge key={skill} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {candidate.notes && (
                              <div>
                                <h4 className="font-medium mb-2">Notes</h4>
                                <p className="text-sm bg-muted/50 p-3 rounded">
                                  {candidate.notes}
                                </p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Update Status</h4>
                              <div className="flex gap-2">
                                {["reviewing", "shortlisted", "interviewed", "offered", "hired", "rejected"].map((status) => (
                                  <Button
                                    key={status}
                                    size="sm"
                                    variant={candidate.status === status ? "default" : "outline"}
                                    onClick={() => handleStatusChange(candidate.id, status as Candidate["status"], candidate.name)}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Shortlisted: {candidates.filter(c => c.status === "shortlisted").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Interviewed: {candidates.filter(c => c.status === "interviewed").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Offered: {candidates.filter(c => c.status === "offered").length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}