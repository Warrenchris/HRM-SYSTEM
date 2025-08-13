import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppraisalLite {
  id: string;
  employee_id: string;
  appraiser_id: string;
  appraisal_period: string;
  status: string;
  due_date: string;
  overall_rating: number | null;
  updated_at: string;
}

export interface EmployeeBasic {
  id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  position: string | null;
}

export interface EnrichedAppraisal extends AppraisalLite {
  employee?: EmployeeBasic;
  appraiser?: EmployeeBasic;
}

export function useAppraisalsQuery() {
  return useQuery({
    queryKey: ['performance', 'appraisals'],
    queryFn: async (): Promise<EnrichedAppraisal[]> => {
      const { data: appraisals, error } = await supabase
        .from('appraisals')
        .select('id, employee_id, appraiser_id, appraisal_period, status, due_date, overall_rating, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueEmployeeIds = Array.from(new Set((appraisals || []).flatMap(a => [a.employee_id, a.appraiser_id].filter(Boolean)))) as string[];

      let employeesById: Record<string, EmployeeBasic> = {};
      if (uniqueEmployeeIds.length > 0) {
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('id, first_name, last_name, department, position')
          .in('id', uniqueEmployeeIds);
        if (empError) throw empError;
        employeesById = (employees || []).reduce<Record<string, EmployeeBasic>>((acc, e) => {
          acc[e.id] = e as EmployeeBasic;
          return acc;
        }, {});
      }

      return (appraisals || []).map(a => ({
        ...a,
        employee: a.employee_id ? employeesById[a.employee_id] : undefined,
        appraiser: a.appraiser_id ? employeesById[a.appraiser_id] : undefined,
      }));
    },
  });
}

export interface ObjectiveLite {
  id: string;
  appraisal_id: string;
  objective_title: string;
  objective_description: string | null;
  employee_rating: number | null;
  manager_rating: number | null;
  target_value: string | null;
  actual_value: string | null;
  updated_at: string;
}

export function useObjectivesQuery() {
  return useQuery({
    queryKey: ['performance', 'objectives'],
    queryFn: async (): Promise<ObjectiveLite[]> => {
      const { data, error } = await supabase
        .from('appraisal_objectives')
        .select('id, appraisal_id, objective_title, objective_description, employee_rating, manager_rating, target_value, actual_value, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export interface PerformanceStatsData {
  averagePerformance: { value: number; changeText: string };
  goalsAchieved: { percent: number; completed: number; total: number };
  reviewsCompleted: { percent: number; completed: number; total: number };
  topPerformers: { count: number };
}

export function usePerformanceStatsQuery() {
  return useQuery({
    queryKey: ['performance', 'stats'],
    queryFn: async (): Promise<PerformanceStatsData> => {
      // Appraisals for performance and review completion
      const { data: appraisals, error: appErr } = await supabase
        .from('appraisals')
        .select('employee_id, status, overall_rating, created_at');
      if (appErr) throw appErr;

      const ratings = (appraisals || []).map(a => a.overall_rating).filter((r): r is number => r !== null);
      const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;

      const completed = (appraisals || []).filter(a => a.status === 'completed').length;
      const totalReviews = appraisals?.length || 0;
      const reviewsPercent = totalReviews > 0 ? Math.round((completed / totalReviews) * 100) : 0;

      // Top performers: employees with avg rating >= 4.5
      const employeeToRatings = new Map<string, number[]>();
      (appraisals || []).forEach(a => {
        if (!a.employee_id || a.overall_rating == null) return;
        const list = employeeToRatings.get(a.employee_id) || [];
        list.push(a.overall_rating);
        employeeToRatings.set(a.employee_id, list);
      });
      let topCount = 0;
      employeeToRatings.forEach(list => {
        const eAvg = list.reduce((s, r) => s + r, 0) / list.length;
        if (eAvg >= 4.5) topCount += 1;
      });

      // Objectives as goals
      const { data: objectives, error: objErr } = await supabase
        .from('appraisal_objectives')
        .select('id, manager_rating, employee_rating');
      if (objErr) throw objErr;
      const totalObjectives = objectives?.length || 0;
      const achievedObjectives = (objectives || []).filter(o => {
        // consider achieved if manager or employee rating >= 4 OR manager_rating not null and >= 3
        const m = o.manager_rating ?? 0;
        const e = o.employee_rating ?? 0;
        return m >= 4 || e >= 4;
      }).length;
      const goalsPercent = totalObjectives > 0 ? Math.round((achievedObjectives / totalObjectives) * 100) : 0;

      return {
        averagePerformance: { value: Number(avg.toFixed(1)), changeText: '' },
        goalsAchieved: { percent: goalsPercent, completed: achievedObjectives, total: totalObjectives },
        reviewsCompleted: { percent: reviewsPercent, completed, total: totalReviews },
        topPerformers: { count: topCount },
      };
    },
  });
}

// Feedback queries
export interface FeedbackRequestRow {
  id: string;
  type: '360' | 'peer' | 'upward' | 'self';
  subject: string;
  requested_by: string;
  due_date: string;
  created_at: string;
}

export function useFeedbackRequestsQuery() {
  return useQuery({
    queryKey: ['performance', 'feedback', 'requests'],
    queryFn: async (): Promise<FeedbackRequestRow[]> => {
      const { data, error } = await supabase
        .from('feedback_requests')
        .select('id, type, subject, requested_by, due_date, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export interface FeedbackItemRow {
  id: string;
  request_id: string | null;
  from_employee_id: string;
  to_employee_id: string;
  type: 'positive' | 'constructive' | 'neutral';
  category: string;
  message: string;
  rating: number | null;
  anonymous: boolean;
  created_at: string;
}

export function useFeedbackItemsQuery() {
  return useQuery({
    queryKey: ['performance', 'feedback', 'items'],
    queryFn: async (): Promise<FeedbackItemRow[]> => {
      const { data, error } = await supabase
        .from('feedback_items')
        .select('id, request_id, from_employee_id, to_employee_id, type, category, message, rating, anonymous, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

// Development plan queries
export interface DevelopmentPlanRow {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  category: 'technical' | 'leadership' | 'soft-skills' | 'certification';
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  start_date: string;
  target_date: string;
  mentor: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentPlanMilestoneRow {
  id: string;
  plan_id: string;
  title: string;
  completed: boolean;
  due_date: string;
}

export function useDevelopmentPlansQuery() {
  return useQuery({
    queryKey: ['performance', 'devplans'],
    queryFn: async (): Promise<DevelopmentPlanRow[]> => {
      const { data, error } = await supabase
        .from('development_plans')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDevelopmentPlanMilestonesQuery(planIds: string[] | null) {
  return useQuery({
    queryKey: ['performance', 'devplans', 'milestones', planIds?.join(',') ?? 'none'],
    enabled: !!planIds && planIds.length > 0,
    queryFn: async (): Promise<DevelopmentPlanMilestoneRow[]> => {
      const { data, error } = await supabase
        .from('development_plan_milestones')
        .select('id, plan_id, title, completed, due_date')
        .in('plan_id', planIds as string[]);
      if (error) throw error;
      return data || [];
    },
  });
}


