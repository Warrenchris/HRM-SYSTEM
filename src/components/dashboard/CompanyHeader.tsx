import { type FC } from "react";
import { useCompany } from "@/contexts/CompanyContext";

interface CompanyType {
  id: string;
  name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const CompanyHeader: FC = () => {
  const { currentCompany } = useCompany() as { currentCompany: CompanyType | null };

  if (!currentCompany) {
    return null;
  }

  return (
    <div className="w-full py-2">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{currentCompany.name}</h2>
            {currentCompany.legal_name && currentCompany.legal_name !== currentCompany.name && (
              <p className="text-sm text-muted-foreground">Legal Name: {currentCompany.legal_name}</p>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
            {currentCompany.email && (
              <div>
                <span className="font-medium">Email:</span> {currentCompany.email}
              </div>
            )}
            {currentCompany.phone && (
              <div>
                <span className="font-medium">Phone:</span> {currentCompany.phone}
              </div>
            )}
            {currentCompany.address && (
              <div>
                <span className="font-medium">Address:</span> {currentCompany.address}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
