import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Star, Zap, Crown, Contact } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  band: 'basic' | 'professional' | 'enterprise' | 'custom';
  price_monthly: number;
  price_yearly: number;
  max_employees: number | null;
  features: string[];
  sort_order: number;
}

interface PlanSelectorProps {
  selectedPlanId?: string;
  onPlanSelect: (planId: string) => void;
  billingCycle?: 'monthly' | 'yearly';
  onBillingCycleChange?: (cycle: 'monthly' | 'yearly') => void;
  showBillingToggle?: boolean;
}

const planIcons = {
  basic: Star,
  professional: Zap,
  enterprise: Crown,
  custom: Contact
};

const planColors = {
  basic: "border-blue-200 hover:border-blue-300",
  professional: "border-purple-200 hover:border-purple-300",
  enterprise: "border-orange-200 hover:border-orange-300",
  custom: "border-green-200 hover:border-green-300"
};

export function PlanSelector({ 
  selectedPlanId, 
  onPlanSelect, 
  billingCycle = 'monthly',
  onBillingCycleChange,
  showBillingToggle = true
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('PlanSelector: Component rendering, loading:', loading, 'plans count:', plans.length);

  useEffect(() => {
    console.log('PlanSelector: useEffect triggered');
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    console.log('PlanSelector: Starting to fetch plans...');
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      console.log('PlanSelector: Supabase response:', { data, error });
      
      if (error) throw error;
      setPlans((data as SubscriptionPlan[]) || []);
      console.log('PlanSelector: Plans set:', data);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
      console.log('PlanSelector: Loading set to false');
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    return price === 0 ? 'Contact us' : `$${price}`;
  };

  const getPriceDescription = (plan: SubscriptionPlan) => {
    if (plan.price_monthly === 0) return 'Custom pricing';
    const period = billingCycle === 'yearly' ? 'year' : 'month';
    const savings = billingCycle === 'yearly' && plan.price_yearly < (plan.price_monthly * 12);
    return (
      <div className="flex flex-col items-center">
        <span>per {period}</span>
        {savings && (
          <Badge variant="secondary" className="mt-1 text-xs">
            Save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%
          </Badge>
        )}
      </div>
    );
  };

  const getEmployeeLimit = (plan: SubscriptionPlan) => {
    if (!plan.max_employees) return 'Unlimited employees';
    return `Up to ${plan.max_employees} employees`;
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-32 bg-muted/50" />
            <CardContent className="h-64 bg-muted/20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showBillingToggle && onBillingCycleChange && (
        <div className="flex justify-center">
          <div className="flex rounded-lg border bg-background p-1">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onBillingCycleChange('monthly')}
              className="text-sm"
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onBillingCycleChange('yearly')}
              className="text-sm"
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 17%
              </Badge>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const Icon = planIcons[plan.band];
          const isSelected = selectedPlanId === plan.id;
          const colorClass = planColors[plan.band];
          
          return (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-200 ${colorClass} ${
                isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md'
              }`}
              onClick={() => onPlanSelect(plan.id)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 z-10">
                  <CheckCircle2 className="h-6 w-6 text-primary bg-background rounded-full" />
                </div>
              )}
              
              {plan.band === 'professional' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  <div className={`p-3 rounded-full ${
                    plan.band === 'basic' ? 'bg-blue-100 text-blue-600' :
                    plan.band === 'professional' ? 'bg-purple-100 text-purple-600' :
                    plan.band === 'enterprise' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{getPrice(plan)}</div>
                  <div className="text-sm text-muted-foreground">
                    {getPriceDescription(plan)}
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground border-t pt-3">
                  {getEmployeeLimit(plan)}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Features included:</div>
                  <ul className="space-y-1 text-sm">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-xs text-muted-foreground italic">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  className="w-full"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlanSelect(plan.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}