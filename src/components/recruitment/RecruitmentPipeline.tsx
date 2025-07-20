import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { GitBranch, Users, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  candidates: {
    id: string;
    name: string;
    position: string;
    avatar?: string;
    daysSinceLastAction: number;
  }[];
}

export function RecruitmentPipeline() {
  const [zapierWebhook, setZapierWebhook] = useState("");
  const { toast } = useToast();

  const pipelineStages: PipelineStage[] = [
    {
      id: "applied",
      name: "Applied",
      count: 25,
      candidates: [
        { id: "C001", name: "Alice Johnson", position: "Frontend Dev", daysSinceLastAction: 1 },
        { id: "C002", name: "Bob Smith", position: "Backend Dev", daysSinceLastAction: 2 },
        { id: "C003", name: "Carol White", position: "Designer", daysSinceLastAction: 1 },
        { id: "C004", name: "David Brown", position: "Product Manager", daysSinceLastAction: 3 },
      ],
    },
    {
      id: "screening",
      name: "Screening",
      count: 12,
      candidates: [
        { id: "C005", name: "Sarah Johnson", position: "Frontend Dev", daysSinceLastAction: 2 },
        { id: "C006", name: "Michael Chen", position: "Data Scientist", daysSinceLastAction: 1 },
        { id: "C007", name: "Emma Wilson", position: "Designer", daysSinceLastAction: 4 },
      ],
    },
    {
      id: "interview",
      name: "Interview",
      count: 8,
      candidates: [
        { id: "C008", name: "James Taylor", position: "Backend Dev", daysSinceLastAction: 1 },
        { id: "C009", name: "Lisa Garcia", position: "Product Manager", daysSinceLastAction: 2 },
        { id: "C010", name: "Ryan Miller", position: "DevOps", daysSinceLastAction: 3 },
      ],
    },
    {
      id: "assessment",
      name: "Assessment",
      count: 5,
      candidates: [
        { id: "C011", name: "Grace Kim", position: "Frontend Dev", daysSinceLastAction: 1 },
        { id: "C012", name: "Alex Rodriguez", position: "Data Analyst", daysSinceLastAction: 2 },
      ],
    },
    {
      id: "offer",
      name: "Offer",
      count: 3,
      candidates: [
        { id: "C013", name: "Sophie Turner", position: "Senior Dev", daysSinceLastAction: 1 },
        { id: "C014", name: "Oliver Davis", position: "Design Lead", daysSinceLastAction: 3 },
      ],
    },
    {
      id: "hired",
      name: "Hired",
      count: 7,
      candidates: [
        { id: "C015", name: "Maya Patel", position: "Product Manager", daysSinceLastAction: 0 },
        { id: "C016", name: "Noah Johnson", position: "Frontend Dev", daysSinceLastAction: 1 },
      ],
    },
  ];

  const totalCandidates = pipelineStages.reduce((sum, stage) => sum + stage.count, 0);
  const conversionRate = pipelineStages.find(s => s.id === "hired")?.count || 0;

  const handleMoveCandidate = async (candidateId: string, candidateName: string, fromStage: string, toStage: string) => {
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
            action: "candidate_moved",
            candidate_id: candidateId,
            candidate_name: candidateName,
            from_stage: fromStage,
            to_stage: toStage,
            timestamp: new Date().toISOString(),
          }),
        });

        toast({
          title: "Candidate Moved & Automated",
          description: `${candidateName} moved to ${toStage} and Zapier webhook triggered`,
        });
      } catch (error) {
        toast({
          title: "Candidate Moved",
          description: `${candidateName} moved to ${toStage}`,
        });
      }
    } else {
      toast({
        title: "Candidate Moved",
        description: `${candidateName} moved to ${toStage}`,
      });
    }
  };

  const getStageColor = (stageId: string) => {
    switch (stageId) {
      case "applied":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "screening":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "interview":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "assessment":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "offer":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "hired":
        return "bg-green-600 text-white hover:bg-green-600";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{totalCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{Math.round((conversionRate / totalCandidates) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Hired This Month</p>
                <p className="text-2xl font-bold">{conversionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zapier Integration */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Pipeline Automation</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter Zapier webhook URL for pipeline automation..."
              value={zapierWebhook}
              onChange={(e) => setZapierWebhook(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Automatically trigger workflows when candidates move between pipeline stages
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pipelineStages.map((stage, index) => (
          <Card key={stage.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStageColor(stage.id)}>
                    {stage.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({stage.count})</span>
                </div>
                {index < pipelineStages.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Progress 
                value={(stage.count / totalCandidates) * 100} 
                className="h-2"
              />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {stage.candidates.slice(0, 4).map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback className="text-xs">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {candidate.daysSinceLastAction}d
                      </span>
                      {stage.id !== "hired" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const nextStage = pipelineStages[index + 1];
                            if (nextStage) {
                              handleMoveCandidate(
                                candidate.id,
                                candidate.name,
                                stage.name,
                                nextStage.name
                              );
                            }
                          }}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {stage.count > 4 && (
                  <div className="text-xs text-center text-muted-foreground py-2">
                    +{stage.count - 4} more candidates
                  </div>
                )}
                
                {stage.candidates.length === 0 && (
                  <div className="text-xs text-center text-muted-foreground py-4">
                    No candidates in this stage
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Analytics */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Pipeline Analytics</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Stage Conversion Rates</h4>
              <div className="space-y-2">
                {pipelineStages.slice(0, -1).map((stage, index) => {
                  const nextStage = pipelineStages[index + 1];
                  const conversionRate = nextStage ? Math.round((nextStage.count / stage.count) * 100) : 0;
                  
                  return (
                    <div key={stage.id} className="flex items-center justify-between text-sm">
                      <span>{stage.name} → {nextStage?.name}</span>
                      <span className="font-medium">{conversionRate}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Time in Stage (Average Days)</h4>
              <div className="space-y-2">
                {pipelineStages.slice(0, -1).map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between text-sm">
                    <span>{stage.name}</span>
                    <span className="font-medium">{Math.floor(Math.random() * 5) + 2} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}