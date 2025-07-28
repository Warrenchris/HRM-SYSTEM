import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Users, Crown, Star, Zap, Contact } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompanySubscription {
  id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_ends_at: string | null;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date: string | null;
  plan: {
    id: string;
    name: string;
    display_name: string;
    description: string;
    band: 'basic' | 'professional' | 'enterprise' | 'custom';
    price_monthly: number;
    price_yearly: number;
    max_employees: number | null;
    features: string[];
  };
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  trial: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800"
};

const planIcons = {
  basic: Star,
  professional: Zap,
  enterprise: Crown,
  custom: Contact
};

export function SubscriptionInfo() {
  const { currentCompany } = useCompany();
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchSubscription();
    }
  }, [currentCompany?.id]);

  const fetchSubscription = async () => {
    if (!currentCompany?.id) return;

    try {
      const { data, error } = await supabase
        .from('company_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('company_id', currentCompany.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(data as CompanySubscription || null);
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.expired;
    return (
      <Badge className={`${colorClass} capitalize`}>
        {status}
      </Badge>
    );
  };

  const getPrice = () => {
    if (!subscription?.plan) return 'N/A';
    const price = subscription.billing_cycle === 'yearly' 
      ? subscription.plan.price_yearly 
      : subscription.plan.price_monthly;
    return price === 0 ? 'Contact us' : `$${price}`;
  };

  const getPriceDescription = () => {
    if (!subscription?.plan) return '';
    if (subscription.plan.price_monthly === 0) return 'Custom pricing';
    const period = subscription.billing_cycle === 'yearly' ? 'year' : 'month';
    return `per ${period}`;
  };

  const getEmployeeLimit = () => {
    if (!subscription?.plan?.max_employees) return 'Unlimited';
    return subscription.plan.max_employees.toString();
  };

  const getTrialDaysLeft = () => {
    if (!subscription?.trial_ends_at) return null;
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="h-20 bg-muted/50" />
        <CardContent className="h-32 bg-muted/20" />
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No subscription found for this company.</p>
          <Button className="mt-4">
            Choose a Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const Icon = planIcons[subscription.plan.band];
  const trialDaysLeft = getTrialDaysLeft();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Information
        </CardTitle>
        <CardDescription>
          Manage your company's subscription plan and billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              subscription.plan.band === 'basic' ? 'bg-blue-100 text-blue-600' :
              subscription.plan.band === 'professional' ? 'bg-purple-100 text-purple-600' :
              subscription.plan.band === 'enterprise' ? 'bg-orange-100 text-orange-600' :
              'bg-green-100 text-green-600'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{subscription.plan.display_name}</h3>
              <p className="text-sm text-muted-foreground">{subscription.plan.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(subscription.status)}
                {subscription.status === 'trial' && trialDaysLeft !== null && (
                  <span className="text-sm text-muted-foreground">
                    {trialDaysLeft} days left in trial
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{getPrice()}</div>
            <div className="text-sm text-muted-foreground">{getPriceDescription()}</div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Employee Limit</div>
              <div className="text-sm text-muted-foreground">{getEmployeeLimit()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Billing Cycle</div>
              <div className="text-sm text-muted-foreground capitalize">
                {subscription.billing_cycle}
              </div>
            </div>
          </div>
        </div>

        {/* Next Billing Date */}
        {subscription.next_billing_date && subscription.status === 'active' && (
          <div>
            <div className="text-sm font-medium">Next Billing Date</div>
            <div className="text-sm text-muted-foreground">
              {new Date(subscription.next_billing_date).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <div className="text-sm font-medium mb-2">Included Features</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {subscription.plan.features.slice(0, 6).map((feature, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                • {feature}
              </div>
            ))}
            {subscription.plan.features.length > 6 && (
              <div className="text-sm text-muted-foreground italic">
                +{subscription.plan.features.length - 6} more features
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={fetchSubscription}>
            Refresh Status
          </Button>
          <Button>
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}