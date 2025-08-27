import { supabase } from '@/integrations/supabase/client';
import React from 'react';

export interface SystemLogParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  companyId?: string;
}

export const LogActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  VIEW: 'VIEW',
  DOWNLOAD: 'DOWNLOAD',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  SUBMIT: 'SUBMIT',
  CANCEL: 'CANCEL',
  ARCHIVE: 'ARCHIVE',
  RESTORE: 'RESTORE'
} as const;

export const ResourceTypes = {
  USER: 'USER',
  EMPLOYEE: 'EMPLOYEE',
  ATTENDANCE: 'ATTENDANCE',
  LEAVE: 'LEAVE',
  PAYROLL: 'PAYROLL',
  TIMESHEET: 'TIMESHEET',
  EXPENSE: 'EXPENSE',
  ASSET: 'ASSET',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  TASK: 'TASK',
  TICKET: 'TICKET',
  PERFORMANCE: 'PERFORMANCE',
  SETTING: 'SETTING',
  REPORT: 'REPORT',
  DOCUMENT: 'DOCUMENT'
} as const;

export async function logSystemActivity({
  action,
  resourceType,
  resourceId,
  details = {},
  severity = 'info',
  companyId
}: SystemLogParams) {
  try {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;
    
    if (!userId) {
      console.warn('No user session found while trying to log activity');
      return;
    }

    // Add additional context to details
    const enrichedDetails = {
      ...details,
      url: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from('system_logs').insert({
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: userId,
      company_id: companyId,
      details: enrichedDetails,
      severity,
      user_agent: navigator.userAgent,
      session_id: session.data.session?.id
    });

    if (error) {
      console.error('Failed to log system activity:', error);
    }
  } catch (error) {
    console.error('Error logging system activity:', error);
  }
}

// Utility function to get user-friendly activity descriptions
export function getActivityDescription(
  action: keyof typeof LogActions,
  resourceType: keyof typeof ResourceTypes,
  details?: Record<string, any>
): string {
  const formattedAction = action.toLowerCase().replace(/_/g, ' ');
  const formattedResource = resourceType.toLowerCase().replace(/_/g, ' ');
  
  switch (action) {
    case 'CREATE':
      return `Created new ${formattedResource}`;
    case 'UPDATE':
      return `Updated ${formattedResource}`;
    case 'DELETE':
      return `Deleted ${formattedResource}`;
    case 'LOGIN':
      return 'User logged in';
    case 'LOGOUT':
      return 'User logged out';
    case 'EXPORT':
      return `Exported ${formattedResource} data`;
    case 'IMPORT':
      return `Imported ${formattedResource} data`;
    case 'VIEW':
      return `Viewed ${formattedResource}`;
    case 'DOWNLOAD':
      return `Downloaded ${formattedResource}`;
    case 'APPROVE':
      return `Approved ${formattedResource}`;
    case 'REJECT':
      return `Rejected ${formattedResource}`;
    case 'SUBMIT':
      return `Submitted ${formattedResource}`;
    case 'CANCEL':
      return `Cancelled ${formattedResource}`;
    case 'ARCHIVE':
      return `Archived ${formattedResource}`;
    case 'RESTORE':
      return `Restored ${formattedResource}`;
    default:
      return `${formattedAction} ${formattedResource}`;
  }
}

// Hook to automatically log route changes
export function useRouteLogging() {
  React.useEffect(() => {
    const logPageView = () => {
      logSystemActivity({
        action: LogActions.VIEW,
        resourceType: 'PAGE',
        details: {
          path: window.location.pathname,
          query: window.location.search
        }
      });
    };

    logPageView(); // Log initial page view
    
    // Add listener for route changes if using client-side routing
    window.addEventListener('popstate', logPageView);
    
    return () => {
      window.removeEventListener('popstate', logPageView);
    };
  }, []);
}
