import { useState } from "react";
import { Check, ChevronsUpDown, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";

export function CompanySwitcher() {
  const { currentCompany, userCompanies, switchCompany, currentMembership } = useCompany();
  const [open, setOpen] = useState(false);

  const handleSwitchCompany = async (companyId: string) => {
    if (companyId === currentCompany?.id) {
      setOpen(false);
      return;
    }

    try {
      await switchCompany(companyId);
      toast.success("Company switched successfully");
    } catch (error) {
      toast.error("Failed to switch company");
    } finally {
      setOpen(false);
    }
  };

  if (!currentCompany) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a company"
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{currentCompany.display_name || currentCompany.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            <CommandGroup heading="Companies">
              {Array.isArray(userCompanies) && userCompanies.length > 0 ? (
                userCompanies.map((company) => (
                  <CommandItem
                    key={company.id}
                    onSelect={() => handleSwitchCompany(company.id)}
                    className="text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Building2 className="h-4 w-4" />
                      <div className="flex-1 truncate">
                        <div className="truncate">{company.display_name || company.name}</div>
                        {company.industry && (
                          <div className="text-xs text-muted-foreground truncate">
                            {company.industry}
                          </div>
                        )}
                      </div>
                      {currentMembership && (
                        <Badge variant="secondary" className="text-xs">
                          {currentMembership.role}
                        </Badge>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentCompany.id === company.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>No companies available</CommandItem>
              )}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // Navigate to create company page
                  window.location.href = "/onboarding";
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Company
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}