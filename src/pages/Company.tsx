import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyInfo } from "@/components/company/CompanyInfo";
import { BranchManagement } from "@/components/company/BranchManagement";
import { DepartmentSetup } from "@/components/company/DepartmentSetup";
import { CompanyPolicies } from "@/components/company/CompanyPolicies";
import { OrganizationChart } from "@/components/company/OrganizationChart";
import { PositionManagement } from "@/components/company/PositionManagement";

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
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start sm:justify-center min-w-fit">
            <TabsTrigger value="info">
              <span className="hidden sm:inline">Company Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="departments">
              <span className="hidden sm:inline">Departments</span>
              <span className="sm:hidden">Depts</span>
            </TabsTrigger>
            <TabsTrigger value="positions">
              <span className="hidden sm:inline">Positions</span>
              <span className="sm:hidden">Pos</span>
            </TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="organization">
              <span className="hidden sm:inline">Organization</span>
              <span className="sm:hidden">Org</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="space-y-6">
          <CompanyInfo />
        </TabsContent>

        <TabsContent value="branches" className="space-y-6">
          <BranchManagement />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <DepartmentSetup />
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <PositionManagement />
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