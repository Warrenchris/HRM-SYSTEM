import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload, Save, MapPin, Phone, Mail, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CompanyInfo() {
  const [companyData, setCompanyData] = useState({
    name: "TechCorp Solutions Ltd",
    legalName: "TechCorp Solutions Limited",
    registrationNumber: "RC-12345678",
    taxId: "KRA-PIN-987654321",
    industry: "Technology",
    foundedYear: "2018",
    description: "Leading technology solutions provider in East Africa",
    website: "https://techcorp.co.ke",
    email: "info@techcorp.co.ke",
    phone: "+254-700-123-456",
    address: "TechHub Building, Westlands",
    city: "Nairobi",
    state: "Nairobi County",
    country: "Kenya",
    postalCode: "00100",
    employeeCount: "245",
    currency: "KES",
    timezone: "Africa/Nairobi",
    fiscalYearStart: "January",
  });

  const { toast } = useToast();

  const industries = [
    "Technology", "Finance", "Healthcare", "Education", "Manufacturing",
    "Retail", "Construction", "Agriculture", "Transportation", "Other"
  ];

  const currencies = [
    { code: "KES", name: "Kenyan Shilling" },
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Company Information Updated",
      description: "Your company information has been saved successfully",
    });
  };

  const handleLogoUpload = () => {
    toast({
      title: "Logo Upload",
      description: "Logo upload feature will be available with backend integration",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <Label>Company Logo</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload your company logo (recommended: 200x200px)
              </p>
              <Button variant="outline" onClick={handleLogoUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={companyData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="legal-name">Legal Name</Label>
              <Input
                id="legal-name"
                value={companyData.legalName}
                onChange={(e) => handleInputChange("legalName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="registration-number">Registration Number</Label>
              <Input
                id="registration-number"
                value={companyData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tax-id">Tax ID / KRA PIN</Label>
              <Input
                id="tax-id"
                value={companyData.taxId}
                onChange={(e) => handleInputChange("taxId", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Industry</Label>
              <Select value={companyData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                <SelectTrigger>
                  <SelectValue />
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
            <div>
              <Label htmlFor="founded-year">Founded Year</Label>
              <Input
                id="founded-year"
                type="number"
                value={companyData.foundedYear}
                onChange={(e) => handleInputChange("foundedYear", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="employee-count">Employee Count</Label>
              <Input
                id="employee-count"
                type="number"
                value={companyData.employeeCount}
                onChange={(e) => handleInputChange("employeeCount", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your company"
              value={companyData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="website">
                <Globe className="h-4 w-4 inline mr-2" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={companyData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={companyData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Street address"
              value={companyData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={companyData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State/County</Label>
              <Input
                id="state"
                value={companyData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={companyData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postal-code">Postal Code</Label>
              <Input
                id="postal-code"
                value={companyData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Currency</Label>
              <Select value={companyData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timezone</Label>
              <Select value={companyData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fiscal Year Start</Label>
              <Select value={companyData.fiscalYearStart} onValueChange={(value) => handleInputChange("fiscalYearStart", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Company Information
        </Button>
      </div>
    </div>
  );
}