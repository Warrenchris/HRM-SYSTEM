import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Company {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  country: string | null;
  timezone: string;
  currency: string;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyMember {
  id: string;
  user_id: string;
  company_id: string;
  role: 'owner' | 'admin' | 'hr' | 'manager' | 'member';
  status: 'active' | 'inactive' | 'pending';
  joined_at: string | null;
}

interface CompanyContextType {
  currentCompany: Company | null;
  userCompanies: Company[];
  currentMembership: CompanyMember | null;
  loading: boolean;
  switchCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  needsOnboarding: boolean;
  inviteUser: (email: string, role: 'admin' | 'hr' | 'manager' | 'member') => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<boolean>;
  getPendingInvitations: () => Promise<{ id: string; email: string; role: string; companyName: string }[]>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

interface CompanyProviderProps {
  children: ReactNode;
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [currentMembership, setCurrentMembership] = useState<CompanyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchUserCompanies = async () => {
    if (!user) return;

    try {
      // Get companies user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('company_members')
        .select(`
          *,
          companies (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (membershipError) throw membershipError;

      const companies = memberships?.map(m => m.companies).filter(Boolean) as Company[] || [];
      setUserCompanies(companies);

      // Get user's current company from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Set current company
      if (profile?.company_id && companies.length > 0) {
        const currentComp = companies.find(c => c.id === profile.company_id);
        if (currentComp) {
          setCurrentCompany(currentComp);
          const membership = memberships?.find(m => m.company_id === profile.company_id);
          setCurrentMembership(membership as CompanyMember || null);
        }
      } else if (companies.length > 0) {
        // If no current company set but user has companies, set the first one
        setCurrentCompany(companies[0]);
        const membership = memberships?.find(m => m.company_id === companies[0].id);
        setCurrentMembership(membership as CompanyMember || null);
        
        // Update profile with first company
        await supabase
          .from('profiles')
          .update({ company_id: companies[0].id })
          .eq('user_id', user.id);
      }

      // Check if user needs onboarding (no companies)
      setNeedsOnboarding(companies.length === 0);
    } catch (error) {
      console.error('Error fetching user companies:', error);
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  const switchCompany = async (companyId: string) => {
    if (!user) return;

    try {
      const company = userCompanies.find(c => c.id === companyId);
      if (!company) throw new Error('Company not found');

      // Update user's profile
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: companyId })
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentCompany(company);
      
      // Update current membership
      const { data: membership } = await supabase
        .from('company_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .single();

      setCurrentMembership(membership as CompanyMember || null);
    } catch (error) {
      console.error('Error switching company:', error);
      throw error;
    }
  };

  const refreshCompanies = async () => {
    await fetchUserCompanies();
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserCompanies();
    } else if (!authLoading && !user) {
      setCurrentCompany(null);
      setUserCompanies([]);
      setCurrentMembership(null);
      setNeedsOnboarding(false);
      setLoading(false);
    }
  }, [user, authLoading]);

  const inviteUser = async (email: string, role: 'admin' | 'hr' | 'manager' | 'member') => {
    if (!currentCompany) throw new Error('No company selected');
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc(
      'invite_user_to_company',
      { email, role, company_id: currentCompany.id }
    );

    if (error) throw error;
    return data;
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc(
      'accept_company_invitation',
      { invitation_id: invitationId }
    );

    if (error) throw error;

    if (data) {
      await refreshCompanies();
    }

    return data;
  };

  const getPendingInvitations = async () => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('company_invitations')
      .select(`
        id,
        email,
        role,
        companies (
          name
        )
      `)
      .eq('email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;

    return data?.map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      companyName: invitation.companies.name
    })) || [];
  };

  const value: CompanyContextType = {
    currentCompany,
    userCompanies,
    currentMembership,
    loading,
    switchCompany,
    refreshCompanies,
    needsOnboarding,
    inviteUser,
    acceptInvitation,
    getPendingInvitations
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}