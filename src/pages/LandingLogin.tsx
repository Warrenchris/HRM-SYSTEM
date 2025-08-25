import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Building2, Users, Clock, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlanSelector } from "@/components/subscription/PlanSelector";

export default function LandingLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Signup onboarding states
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [companyName, setCompanyName] = useState("");
  const [companyDisplayName, setCompanyDisplayName] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If there is pending onboarding saved from a previous signup, try creating the company now
        const pending = localStorage.getItem("pendingCompanyOnboarding");
        if (pending) {
          try {
            const payload = JSON.parse(pending) as {
              email: string;
              company: { name: string; display_name: string; selectedPlanId?: string; billingCycle?: "monthly" | "yearly"; company_email?: string };
            };
            if (payload?.company?.name) {
              await tryCreateCompany(payload.company);
            }
          } catch (e) {
            // ignore JSON parse errors
          } finally {
            localStorage.removeItem("pendingCompanyOnboarding");
          }
        }
        navigate("/app");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link before signing in.");
        } else {
          setError(error.message);
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to HRM Pro.",
      });
      
      navigate("/app");
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (signupStep === 1) {
      // Move to company onboarding step
      setSignupStep(2);
      setIsLoading(false);
      return;
    }

    if (!companyName.trim()) {
      setError("Company name is required.");
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/app`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(error.message);
        }
        return;
      }

      // Try to create company immediately if session is available (dev) else store for after email confirmation
      const { data: sessionData } = await supabase.auth.getSession();
      const companyPayload = {
        name: companyName,
        display_name: companyDisplayName || companyName,
        selectedPlanId,
        billingCycle,
        company_email: email,
      };

      if (sessionData.session) {
        await tryCreateCompany(companyPayload);
        toast({ title: "Account and company created!", description: "Redirecting to your dashboard." });
        navigate("/app");
      } else {
        localStorage.setItem("pendingCompanyOnboarding", JSON.stringify({ email, company: companyPayload }));
        toast({
          title: "Account created!",
          description: "Check your email to confirm your account. We'll finish company setup after you sign in.",
        });
        // Clear account fields but keep UI on sign-in
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
      
      // Clear company fields
      setCompanyName("");
      setCompanyDisplayName("");
      setSelectedPlanId("");
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  async function tryCreateCompany(company: { name: string; display_name: string; selectedPlanId?: string; billingCycle?: "monthly" | "yearly"; company_email?: string }) {
    // Attempt different RPC signatures based on what's available
    // Signature v2 with selected_plan_id and company_email
    const { data, error: v2Error } = await supabase.rpc('create_company_with_owner', {
      company_name: company.name,
      company_display_name: company.display_name,
      selected_plan_id: company.selectedPlanId || null,
      company_email: company.company_email || email,
    });
    if (!v2Error && data) return data as string;

    // Fallback v1 with user_email
    const { data: dataV1, error: v1Error } = await supabase.rpc('create_company_with_owner', {
      company_name: company.name,
      company_display_name: company.display_name,
      user_email: company.company_email || email,
    });
    if (!v1Error && dataV1) return dataV1 as string;

    // Minimal fallback
    const { data: dataMinimal, error: minimalError } = await supabase.rpc('create_company_with_owner', {
      company_name: company.name,
      company_display_name: company.display_name,
    });
    if (minimalError) throw minimalError;
    return dataMinimal as string;
  }

  const features: Array<{icon: any; title: string; description: string}> = [];

  const benefits: string[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left side - Brand and Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-xl p-3">
                  <Building2 className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">HRM Pro</h1>
                  <p className="text-lg text-muted-foreground">Professional Human Resource Management</p>
                </div>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Transform Your HR Operations with
                <span className="text-primary"> Smart Solutions</span>
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Comprehensive HR management platform designed for modern businesses. 
                Streamline employee management, attendance tracking, payroll processing, and more.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Why Choose HRM Pro?</h3>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card className="shadow-2xl border-border/50">
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl">Welcome to HRM Pro</CardTitle>
                  <CardDescription>
                    Sign in to your account or create a new one to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin" className="space-y-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email Address</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              disabled={isLoading}
                              className="h-11 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign In to HRM Pro"}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        {/* Step 1: Account details */}
                        {signupStep === 1 && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="signup-email">Email Address</Label>
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="signup-password">Password</Label>
                              <div className="relative">
                                <Input
                                  id="signup-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  disabled={isLoading}
                                  className="h-11 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm Password</Label>
                              <Input
                                id="confirm-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-11"
                              />
                            </div>
                          </>
                        )}

                        {/* Step 2: Company onboarding */}
                        {signupStep === 2 && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="company-name">Company Name *</Label>
                              <Input
                                id="company-name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter company name"
                                disabled={isLoading}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="company-display">Display Name</Label>
                              <Input
                                id="company-display"
                                value={companyDisplayName}
                                onChange={(e) => setCompanyDisplayName(e.target.value)}
                                placeholder="Company display name"
                                disabled={isLoading}
                                className="h-11"
                              />
                            </div>
                            <PlanSelector
                              selectedPlanId={selectedPlanId}
                              onPlanSelect={(planId) => setSelectedPlanId(planId)}
                              billingCycle={billingCycle}
                              onBillingCycleChange={(cycle) => setBillingCycle(cycle)}
                            />
                          </>
                        )}

                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                          {isLoading
                            ? signupStep === 1 ? "Next..." : "Creating account..."
                            : signupStep === 1 ? "Continue to Company Setup" : "Create Account & Company"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}