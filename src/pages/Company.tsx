import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyInfo } from "@/components/company/CompanyInfo";
import { BranchManagement } from "@/components/company/BranchManagement";
import { DepartmentSetup } from "@/components/company/DepartmentSetup";
import { CompanyPolicies } from "@/components/company/CompanyPolicies";
import { OrganizationChart } from "@/components/company/OrganizationChart";

export default function Company() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Setup</h1>
        <p className="text-muted-foreground">
          Configure your company information, structure, and organizational settings
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">Company Info</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <CompanyInfo />
        </TabsContent>

        <TabsContent value="branches" className="space-y-6">
          <BranchManagement />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <DepartmentSetup />
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <CompanyPolicies />
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <OrganizationChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}