import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'leave_request' | 'expense_request' | 'task_assignment' | 'general';
  read: boolean;
  created_at: string;
  employee_name?: string;
  request_id?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Create notification for new requests
  const createNotification = async (
    title: string,
    message: string,
    type: Notification['type'],
    employeeName?: string,
    requestId?: string
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
      employee_name: employeeName,
      request_id: requestId,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast({
      title,
      description: message,
    });
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
  };
}