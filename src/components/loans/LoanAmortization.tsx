import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, Download, DollarSign } from "lucide-react";

export function LoanAmortization() {
  const [loanAmount, setLoanAmount] = useState("150000");
  const [interestRate, setInterestRate] = useState("12");
  const [loanTenure, setLoanTenure] = useState("24");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  const existingLoans = [
    { id: "LOAN-001", amount: 150000, rate: 12, tenure: 24, type: "Personal Loan" },
    { id: "LOAN-002", amount: 35000, rate: 8, tenure: 12, type: "Emergency Loan" },
    { id: "LOAN-005", amount: 80000, rate: 10, tenure: 18, type: "Equipment Loan" }
  ];

  const calculateAmortization = () => {
    const principal = parseFloat(loanAmount);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const tenure = parseInt(loanTenure);
    
    if (monthlyRate === 0) {
      // For 0% interest loans
      const monthlyPayment = principal / tenure;
      const schedule = [];
      let balance = principal;
      
      for (let i = 1; i <= tenure; i++) {
        const principalPayment = monthlyPayment;
        const interestPayment = 0;
        balance -= principalPayment;
        
        schedule.push({
          payment: i,
          emi: monthlyPayment,
          principalPayment: principalPayment,
          interestPayment: interestPayment,
          balance: Math.max(0, balance)
        });
      }
      
      setAmortizationSchedule(schedule);
      return;
    }

    // EMI calculation
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    const schedule = [];
    let balance = principal;
    
    for (let i = 1; i <= tenure; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        payment: i,
        emi: emi,
        principalPayment: principalPayment,
        interestPayment: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    setAmortizationSchedule(schedule);
  };

  const handleLoanSelect = (loanId: string) => {
    const loan = existingLoans.find(l => l.id === loanId);
    if (loan) {
      setLoanAmount(loan.amount.toString());
      setInterestRate(loan.rate.toString());
      setLoanTenure(loan.tenure.toString());
      setSelectedLoan(loanId);
    }
  };

  const totalInterest = amortizationSchedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
  const totalAmount = parseFloat(loanAmount) + totalInterest;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Parameters</CardTitle>
            <CardDescription>
              Enter loan details to generate amortization schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Existing Loan (Optional)</Label>
              <Select value={selectedLoan} onValueChange={handleLoanSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose from existing loans" />
                </SelectTrigger>
                <SelectContent>
                  {existingLoans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.id} - {loan.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (KSh)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="150000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate">Interest Rate (% p.a.)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tenure">Loan Tenure (Months)</Label>
              <Input
                id="tenure"
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(e.target.value)}
                placeholder="24"
              />
            </div>
            
            <Button onClick={calculateAmortization} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Generate Amortization Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
            <CardDescription>
              Overview of loan terms and totals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {amortizationSchedule.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Principal Amount</span>
                    </div>
                    <span className="text-lg font-bold">
                      KSh {parseFloat(loanAmount).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Monthly EMI</span>
                    <span className="text-lg font-bold text-green-600">
                      KSh {Math.round(amortizationSchedule[0]?.emi || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Total Interest</span>
                    <span className="text-lg font-bold text-red-600">
                      KSh {Math.round(totalInterest).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg border-primary">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-xl font-bold">
                      KSh {Math.round(totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Schedule
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter loan details and click "Generate" to see the summary</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {amortizationSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amortization Schedule</CardTitle>
            <CardDescription>
              Monthly payment breakdown showing principal and interest components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment #</TableHead>
                    <TableHead className="text-right">EMI Amount</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amortizationSchedule.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{payment.payment}</TableCell>
                      <TableCell className="text-right">
                        KSh {Math.round(payment.emi).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        KSh {Math.round(payment.principalPayment).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        KSh {Math.round(payment.interestPayment).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        KSh {Math.round(payment.balance).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-lg font-bold">{amortizationSchedule.length}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Principal</p>
                <p className="text-lg font-bold text-green-600">
                  KSh {parseFloat(loanAmount).toLocaleString()}
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-lg font-bold text-red-600">
                  KSh {Math.round(totalInterest).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}