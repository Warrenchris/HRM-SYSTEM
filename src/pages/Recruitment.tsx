import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecruitmentStats } from "@/components/recruitment/RecruitmentStats";
import { JobPostings } from "@/components/recruitment/JobPostings";
import { CandidateManagement } from "@/components/recruitment/CandidateManagement";
import { InterviewScheduling } from "@/components/recruitment/InterviewScheduling";
import { RecruitmentPipeline } from "@/components/recruitment/RecruitmentPipeline";

export default function Recruitment() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recruitment</h1>
        <p className="text-muted-foreground">
          Manage job postings, candidates, interviews, and recruitment pipeline
        </p>
      </div>

      <RecruitmentStats />

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <RecruitmentPipeline />
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <JobPostings />
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <CandidateManagement />
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <InterviewScheduling />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Recruitment Analytics Coming Soon</p>
            </div>
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Hiring Metrics Dashboard</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}