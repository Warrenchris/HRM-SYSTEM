import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export const systemLogger = {
  async log(entry: LogEntry) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('system_logs').insert({
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        user_id: user?.id,
        details: entry.details || {},
        severity: entry.severity || 'info',
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('System logging failed:', error);
    }
  },

  async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  },

  // Convenience methods
  info(action: string, resource_type: string, details?: Record<string, any>, resource_id?: string) {
    return this.log({ action, resource_type, resource_id, details, severity: 'info' });
  },

  warning(action: string, resource_type: string, details?: Record<string, any>, resource_id?: string) {
    return this.log({ action, resource_type, resource_id, details, severity: 'warning' });
  },

  error(action: string, resource_type: string, details?: Record<string, any>, resource_id?: string) {
    return this.log({ action, resource_type, resource_id, details, severity: 'error' });
  },

  critical(action: string, resource_type: string, details?: Record<string, any>, resource_id?: string) {
    return this.log({ action, resource_type, resource_id, details, severity: 'critical' });
  }
};