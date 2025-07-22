import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Building2, Users, ArrowRight } from "lucide-react";

interface CompanyData {
  name: string;
  display_name: string;
  description: string;
  industry: string;
  company_size: string;
  country: string;
  website: string;
  phone: string;
  email: string;
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    display_name: "",
    description: "",
    industry: "",
    company_size: "",
    country: "",
    website: "",
    phone: "",
    email: ""
  });

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
    "Retail", "Construction", "Agriculture", "Transportation", "Other"
  ];

  const countries = [
    "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi", "Ethiopia",
    "South Sudan", "Somalia", "Other"
  ];

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCompany = async () => {
    if (!companyData.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    setLoading(true);
    try {
      // Call the database function to create company and assign owner
      const { data, error: functionError } = await supabase.rpc(
        'create_company_with_owner',
        {
          company_name: companyData.name,
          company_display_name: companyData.display_name || companyData.name
        }
      );

      if (functionError) throw functionError;

      // Update company details
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          description: companyData.description,
          industry: companyData.industry,
          company_size: companyData.company_size,
          country: companyData.country,
          website: companyData.website,
          phone: companyData.phone,
          email: companyData.email
        })
        .eq('id', data);

      if (updateError) throw updateError;

      toast.success("Company created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error(error.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to HR Management</CardTitle>
            <CardDescription>
              Let's set up your company to get started with managing your workforce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Company Setup</h3>
                  <p className="text-sm text-muted-foreground">Configure your organization details</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Team Management</h3>
                  <p className="text-sm text-muted-foreground">Add employees and manage roles</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              size="lg"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Company</CardTitle>
          <CardDescription>
            Tell us about your organization to customize your HR management experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={companyData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={companyData.display_name}
                onChange={(e) => handleInputChange("display_name", e.target.value)}
                placeholder="Company display name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={companyData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your company"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={companyData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select value={companyData.company_size} onValueChange={(value) => handleInputChange("company_size", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={companyData.country} onValueChange={(value) => handleInputChange("country", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={companyData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+254 700 000 000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleCreateCompany}
              disabled={loading || !companyData.name.trim()}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}