import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceStats } from "@/components/performance/PerformanceStats";
import { PerformanceReviews } from "@/components/performance/PerformanceReviews";
import { PerformanceAppraisals } from "@/components/performance/PerformanceAppraisals";
import { GoalTracking } from "@/components/performance/GoalTracking";
import { FeedbackSystem } from "@/components/performance/FeedbackSystem";
import { DevelopmentPlans } from "@/components/performance/DevelopmentPlans";

export default function Performance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
        <p className="text-muted-foreground">
          Manage employee performance, reviews, goals, and development plans
        </p>
      </div>

      <PerformanceStats />

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          <PerformanceReviews />
        </TabsContent>

        <TabsContent value="appraisals" className="space-y-6">
          <PerformanceAppraisals />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalTracking />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <FeedbackSystem />
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <DevelopmentPlans />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Performance Analytics Coming Soon</p>
            </div>
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Team Performance Metrics</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}