import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Calendar, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loanTypes = [
  { value: "personal", label: "Personal Loan", rate: 12, maxAmount: 300000, maxTenure: 36 },
  { value: "emergency", label: "Emergency Loan", rate: 8, maxAmount: 50000, maxTenure: 12 },
  { value: "advance", label: "Salary Advance", rate: 0, maxAmount: 25000, maxTenure: 3 },
  { value: "equipment", label: "Equipment Loan", rate: 10, maxAmount: 150000, maxTenure: 24 }
];

export function LoanApplication() {
  const [selectedLoanType, setSelectedLoanType] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTenure, setLoanTenure] = useState("");
  const [monthlyEmi, setMonthlyEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const { toast } = useToast();

  const calculateEMI = () => {
    const selectedType = loanTypes.find(type => type.value === selectedLoanType);
    if (!selectedType || !loanAmount || !loanTenure) return;

    const principal = parseFloat(loanAmount);
    const annualRate = selectedType.rate / 100;
    const monthlyRate = annualRate / 12;
    const tenure = parseInt(loanTenure);

    if (monthlyRate === 0) {
      // For 0% interest loans (salary advance)
      const emi = principal / tenure;
      setMonthlyEmi(emi);
      setTotalInterest(0);
    } else {
      // EMI calculation formula
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      const totalAmount = emi * tenure;
      const interest = totalAmount - principal;
      
      setMonthlyEmi(emi);
      setTotalInterest(interest);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Loan Application Submitted",
      description: "Your loan application has been submitted for review. You will be notified once it's processed.",
    });
  };

  const selectedType = loanTypes.find(type => type.value === selectedLoanType);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Loan Application</CardTitle>
          <CardDescription>
            Fill out the form below to apply for a loan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="loanType">Loan Type</Label>
              <Select value={selectedLoanType} onValueChange={setSelectedLoanType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.rate}% p.a.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <div className="text-sm text-muted-foreground">
                  Max Amount: KSh {selectedType.maxAmount.toLocaleString()} | 
                  Max Tenure: {selectedType.maxTenure} months
                </div>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (KSh)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  max={selectedType?.maxAmount}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenure">Tenure (Months)</Label>
                <Input
                  id="tenure"
                  type="number"
                  placeholder="12"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(e.target.value)}
                  max={selectedType?.maxTenure}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Loan</Label>
              <Textarea
                id="purpose"
                placeholder="Please describe the purpose of this loan..."
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="guarantor">Guarantor Information</Label>
              <Input
                id="guarantor"
                placeholder="Guarantor name and employee ID"
                required
              />
            </div>
            
            <div className="flex justify-between space-x-4">
              <Button type="button" variant="outline" onClick={calculateEMI}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate EMI
              </Button>
              <Button type="submit">
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan Calculator</CardTitle>
          <CardDescription>
            Preview your loan details and monthly payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedType ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Loan Amount</span>
                  </div>
                  <span className="text-lg font-bold">
                    KSh {loanAmount ? parseFloat(loanAmount).toLocaleString() : "0"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Interest Rate</span>
                  </div>
                  <span className="text-lg font-bold">{selectedType.rate}% p.a.</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Tenure</span>
                  </div>
                  <span className="text-lg font-bold">
                    {loanTenure || "0"} months
                  </span>
                </div>
              </div>
              
              {monthlyEmi > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">EMI Calculation</h4>
                  
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span>Monthly EMI:</span>
                      <span className="font-bold text-green-600">
                        KSh {Math.round(monthlyEmi).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-bold text-red-600">
                        KSh {Math.round(totalInterest).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-bold">
                        KSh {Math.round(monthlyEmi * parseInt(loanTenure || "0")).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Your monthly salary deduction will be KSh {Math.round(monthlyEmi).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a loan type to see calculation details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}