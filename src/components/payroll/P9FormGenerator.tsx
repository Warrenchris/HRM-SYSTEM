import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyP9Row {
  month: string;
  A: number; // Basic Salary
  B: number; // Benefits NonCash
  C: number; // Value of Quarters
  D: number; // Total Gross Pay
  E1: number; // 30% of A
  E2: number; // Actual (e.g., NSSF)
  E3: number; // Fixed (Lower of E1/E2/30,000 p.m)
  F: number; // AHL
  G: number; // SHIF
  H: number; // PRMF
  I: number; // Owner Occupied Interest
  J: number; // Total Deductions (Lower of E + F + G + H + I) -> we use E3 + others
  K: number; // Chargeable Pay (D - J)
  L: number; // Tax Charged (monthly)
  M: number; // Personal Relief (2,400 p.m)
  N: number; // Insurance Relief (<= 5,000 p.m, or 15% premiums)
  O: number; // PAYE Tax (L - M - N)
}

interface P9Data {
  employeeId: string;
  employeeName: string;
  pinNumber: string;
  department: string;
  // Column A
  basicSalary: number;
  // Column B
  benefitsNonCash: number;
  // Column C
  valueOfQuarters: number;
  // Column D - Total Gross Pay
  totalGrossPay: number;
  // Column E - Defined Contribution Retirement Scheme
  e1ThirtyPercentOfA: number; // E1 30% of A
  e3Actual: number; // E3 Actual
  e3Fixed: number; // E3 Fixed
  // Column F
  affordableHousingLevy: number; // AHL
  // Column G
  socialHealthInsuranceFund: number; // SHIF
  // Column H
  postRetirementMedicalFund: number; // PRMF
  // Column I
  ownerOccupiedInterest: number;
  // Column J - Total Deductions (Lower of E+F+G+H+I)
  totalDeductions: number;
  // Column K - Chargeable Pay (D-J)
  chargeablePay: number;
  // Column L
  taxCharged: number;
  // Column M
  personalRelief: number;
  // Column N
  insuranceRelief: number;
  // Column O - PAYE Tax (L-M-N)
  payeTax: number;
  // Monthly rows for KRA template
  monthly: MonthlyP9Row[];
  // Legacy fields for compatibility
  allowances: number;
  nssfDeduction: number;
  shifDeduction: number;
  housingLevy: number;
  netSalary: number;
  cumulativePayeTax: number;
  cumulativeGrossSalary: number;
}

interface P9FormData {
  year: string;
  employerName: string;
  employerPin: string;
  employees: P9Data[];
}

export function P9FormGenerator() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [p9Data, setP9Data] = useState<P9FormData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, department, kra_pin')
        .eq('status', 'active');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees data.",
        variant: "destructive"
      });
    }
  };

  const generateP9Forms = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one employee to generate P9 forms.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch payroll records for selected employees for the year
      const { data: payrollData, error } = await supabase
        .from('payroll_records')
        .select(`
          employee_id,
          basic_salary,
          allowances,
          gross_salary,
          paye_tax,
          nssf_deduction,
          shif_deduction,
          housing_levy,
          total_deductions,
          net_salary,
          pay_period
        `)
        .in('employee_id', selectedEmployees)
        .like('pay_period', `%${selectedYear}%`)
        .order('pay_period');

      if (error) throw error;

      // Calculate cumulative values for each employee
      const employeeP9Data: P9Data[] = [];
      
      for (const empId of selectedEmployees) {
        const employee = employees.find(emp => emp.id === empId);
        const empPayrollRecords = payrollData?.filter(record => record.employee_id === empId) || [];
        
        // Build monthly grid initialized to zeroes
        const monthNames = [
          'January','February','March','April','May','June','July','August','September','October','November','December'
        ];
        const monthly: MonthlyP9Row[] = monthNames.map((m) => ({
          month: m,
          A: 0, B: 0, C: 0, D: 0,
          E1: 0, E2: 0, E3: 0,
          F: 0, G: 0, H: 0, I: 0,
          J: 0, K: 0, L: 0, M: 2400, N: 0, O: 0,
        }));

        const parseMonthIndex = (payPeriod: string): number | null => {
          // Handles formats like '2025-01', '2025-01-31', 'Jan 2025', 'January 2025'
          if (!payPeriod) return null;
          // YYYY-MM
          const m1 = payPeriod.match(/^(\d{4})-(\d{2})/);
          if (m1) return Math.max(0, Math.min(11, parseInt(m1[2], 10) - 1));
          // Try Date parsing
          const d = new Date(payPeriod);
          if (!isNaN(d.getTime())) return d.getMonth();
          // Try textual month
          const idx = monthNames.findIndex((n) => payPeriod.toLowerCase().includes(n.toLowerCase().slice(0,3)) || payPeriod.toLowerCase().includes(n.toLowerCase()));
          return idx >= 0 ? idx : null;
        };

        for (const record of empPayrollRecords) {
          const mi = parseMonthIndex(record.pay_period);
          if (mi === null) continue;
          const A = record.basic_salary || 0;
          const allowances = record.allowances || 0;
          const B = allowances * 0.3; // estimated non-cash benefits
          const C = 0; // value of quarters
          const D = A + B + C;
          const E1 = A * 0.3; // 30% of A
          const E2 = record.nssf_deduction || 0; // actual
          const E3Cap = 30000; // p.m cap per KRA note
          const E3 = Math.min(E1, E2, E3Cap);
          const F = record.housing_levy || 0;
          const G = record.shif_deduction || 0;
          const H = 0;
          const I = 0;
          const J = E3 + F + G + H + I;
          const K = Math.max(0, D - J);
          const L = calculateMonthlyTax(K);
          const M = 2400; // per month
          const N = 0; // unknown premiums
          const O = Math.max(0, L - M - N);

          monthly[mi] = { month: monthNames[mi], A, B, C, D, E1, E2, E3, F, G, H, I, J, K, L, M, N, O };
        }
        
        // Calculate totals for the year from monthly grid to align with the KRA columns
        const totalBasicSalary = monthly.reduce((s, r) => s + r.A, 0);
        const totalAllowances = (empPayrollRecords || []).reduce((sum, record) => sum + (record.allowances || 0), 0);
        const totalGrossSalary = monthly.reduce((s, r) => s + r.D, 0);
        const totalPayeTax = monthly.reduce((s, r) => s + r.O, 0);
        const totalNssfDeduction = monthly.reduce((s, r) => s + r.E2, 0);
        const totalShifDeduction = monthly.reduce((s, r) => s + r.G, 0);
        const totalHousingLevy = monthly.reduce((s, r) => s + r.F, 0);
        const totalDeductions = monthly.reduce((s, r) => s + r.J, 0);
        const totalNetSalary = (empPayrollRecords || []).reduce((sum, record) => sum + (record.net_salary || 0), 0);

        if (employee) {
          // Calculate new P9 structure fields (annualized from monthly grid)
          const benefitsNonCash = monthly.reduce((s, r) => s + r.B, 0);
          const valueOfQuarters = monthly.reduce((s, r) => s + r.C, 0);
          const totalGrossPay = totalGrossSalary;

          // Defined Contribution Retirement Scheme calculations (annual)
          const e1ThirtyPercentOfA = monthly.reduce((s, r) => s + r.E1, 0);
          const e3Actual = totalNssfDeduction; // Actual NSSF contribution
          const e3Fixed = monthly.reduce((s, r) => s + r.E3, 0);

          // Other deductions (annual)
          const affordableHousingLevy = totalHousingLevy;
          const socialHealthInsuranceFund = totalShifDeduction;
          const postRetirementMedicalFund = 0; // Unknown
          const ownerOccupiedInterest = 0; // Unknown

          // Total deductions calculation (annual)
          const finalTotalDeductions = totalDeductions || (e3Fixed + affordableHousingLevy + socialHealthInsuranceFund + postRetirementMedicalFund + ownerOccupiedInterest);

          // Chargeable Pay (D-J) annual
          const chargeablePay = totalGrossPay - finalTotalDeductions;

          // Tax calculations (annual)
          const taxCharged = calculateTaxCharged(chargeablePay);
          const personalRelief = 2400 * 12;
          const insuranceRelief = 0; // Unknown premiums
          const finalPayeTax = Math.max(0, taxCharged - personalRelief - insuranceRelief);

          employeeP9Data.push({
            employeeId: employee.employee_id || employee.id,
            employeeName: `${employee.first_name} ${employee.last_name}`,
            pinNumber: employee.kra_pin || 'N/A',
            department: employee.department,
            // New P9 structure
            basicSalary: totalBasicSalary,
            benefitsNonCash,
            valueOfQuarters,
            totalGrossPay,
            e1ThirtyPercentOfA,
            e3Actual,
            e3Fixed,
            affordableHousingLevy,
            socialHealthInsuranceFund,
            postRetirementMedicalFund,
            ownerOccupiedInterest,
            totalDeductions: finalTotalDeductions,
            chargeablePay,
            taxCharged,
            personalRelief,
            insuranceRelief,
            payeTax: finalPayeTax,
            monthly,
            // Legacy fields for compatibility
            allowances: totalAllowances,
            nssfDeduction: totalNssfDeduction,
            shifDeduction: totalShifDeduction,
            housingLevy: totalHousingLevy,
            netSalary: totalNetSalary,
            cumulativePayeTax: finalPayeTax,
            cumulativeGrossSalary: totalGrossPay
          });
        }
      }

      setP9Data({
        year: selectedYear,
        employerName: "Your Company Name", // This should come from company settings
        employerPin: "P051234567X", // This should come from company settings
        employees: employeeP9Data
      });

      setShowPreview(true);
      
      toast({
        title: "P9 Forms Generated",
        description: `Generated P9 forms for ${employeeP9Data.length} employees for ${selectedYear}.`,
      });

    } catch (error) {
      console.error('Error generating P9 forms:', error);
      toast({
        title: "Error",
        description: "Failed to generate P9 forms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Kenya PAYE tax calculation function (annual input)
  const calculateTaxCharged = (chargeablePay: number): number => {
    let tax = 0;
    const monthlyChargeable = chargeablePay / 12;
    
    // Kenya PAYE tax bands (2024 rates)
    if (monthlyChargeable <= 24000) {
      tax = monthlyChargeable * 0.1;
    } else if (monthlyChargeable <= 32333) {
      tax = 24000 * 0.1 + (monthlyChargeable - 24000) * 0.25;
    } else if (monthlyChargeable <= 500000) {
      tax = 24000 * 0.1 + 8333 * 0.25 + (monthlyChargeable - 32333) * 0.3;
    } else if (monthlyChargeable <= 800000) {
      tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + (monthlyChargeable - 500000) * 0.325;
    } else {
      tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + 300000 * 0.325 + (monthlyChargeable - 800000) * 0.35;
    }
    
    return Math.round(tax * 12); // Annual tax
  };

  // Monthly PAYE calculator used for the grid rows
  const calculateMonthlyTax = (monthlyChargeable: number): number => {
    let tax = 0;
    if (monthlyChargeable <= 24000) {
      tax = monthlyChargeable * 0.1;
    } else if (monthlyChargeable <= 32333) {
      tax = 24000 * 0.1 + (monthlyChargeable - 24000) * 0.25;
    } else if (monthlyChargeable <= 500000) {
      tax = 24000 * 0.1 + 8333 * 0.25 + (monthlyChargeable - 32333) * 0.3;
    } else if (monthlyChargeable <= 800000) {
      tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + (monthlyChargeable - 500000) * 0.325;
    } else {
      tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + 300000 * 0.325 + (monthlyChargeable - 800000) * 0.35;
    }
    return Math.round(tax);
  };

  const downloadP9Form = (employee: P9Data) => {
    // Render KRA P9 template with monthly grid (Appendix 2A style)
    const monthRow = (row: MonthlyP9Row) => `
      <tr>
        <td style="text-align:left;">${row.month}</td>
        <td class="amt">${row.A.toLocaleString()}</td>
        <td class="amt">${row.B.toLocaleString()}</td>
        <td class="amt">${row.C.toLocaleString()}</td>
        <td class="amt">${row.D.toLocaleString()}</td>
        <td class="amt">${row.E1.toLocaleString()}</td>
        <td class="amt">${row.E2.toLocaleString()}</td>
        <td class="amt">${row.E3.toLocaleString()}</td>
        <td class="amt">${row.F.toLocaleString()}</td>
        <td class="amt">${row.G.toLocaleString()}</td>
        <td class="amt">${row.H.toLocaleString()}</td>
        <td class="amt">${row.I.toLocaleString()}</td>
        <td class="amt">${row.J.toLocaleString()}</td>
        <td class="amt">${row.K.toLocaleString()}</td>
        <td class="amt">${row.L.toLocaleString()}</td>
        <td class="amt">${row.M.toLocaleString()}</td>
        <td class="amt">${row.N.toLocaleString()}</td>
        <td class="amt">${row.O.toLocaleString()}</td>
      </tr>`;

    const totals = employee.monthly.reduce((acc, r) => {
      return {
        A: acc.A + r.A,
        B: acc.B + r.B,
        C: acc.C + r.C,
        D: acc.D + r.D,
        E1: acc.E1 + r.E1,
        E2: acc.E2 + r.E2,
        E3: acc.E3 + r.E3,
        F: acc.F + r.F,
        G: acc.G + r.G,
        H: acc.H + r.H,
        I: acc.I + r.I,
        J: acc.J + r.J,
        K: acc.K + r.K,
        L: acc.L + r.L,
        M: acc.M + r.M,
        N: acc.N + r.N,
        O: acc.O + r.O,
      };
    }, {A:0,B:0,C:0,D:0,E1:0,E2:0,E3:0,F:0,G:0,H:0,I:0,J:0,K:0,L:0,M:0,N:0,O:0});

    const p9Html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>P9 Form - ${employee.employeeName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #000; }
          .header { text-align: center; margin-bottom: 10px; }
          .kra { font-weight: 700; font-size: 18px; }
          .meta { width: 100%; margin-top: 6px; margin-bottom: 10px; font-size: 12px; }
          .meta td { padding: 6px 8px; }
          .meta .lbl { width: 200px; white-space: nowrap; }
          .dotted { border-bottom: 1px dotted #333; display: inline-block; min-width: 240px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; }
          th { background: #eee; }
          .left { text-align: left; }
          .amt { text-align: right; }
          .notes { font-size: 10px; margin-top: 12px; }
          .flex { display: flex; justify-content: space-between; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="kra">KENYA REVENUE AUTHORITY</div>
          <div>DOMESTIC TAXES DEPARTMENT - TAX DEDUCTION CARD (P9)</div>
          <div>YEAR ${p9Data?.year}</div>
        </div>

        <table class="meta">
          <tr>
            <td class="lbl">Employer's Name</td>
            <td><span class="dotted">${p9Data?.employerName || ''}</span></td>
            <td class="lbl">Employer's PIN</td>
            <td><span class="dotted">${p9Data?.employerPin || ''}</span></td>
          </tr>
          <tr>
            <td class="lbl">Employee's Main Name</td>
            <td><span class="dotted">${employee.employeeName}</span></td>
            <td class="lbl">Employee's PIN</td>
            <td><span class="dotted">${employee.pinNumber}</span></td>
          </tr>
        </table>

        <table>
          <thead>
            <tr>
              <th rowspan="2" class="left">MONTH</th>
              <th colspan="4">Emoluments</th>
              <th colspan="3">Defined Contribution Retirement Scheme</th>
              <th colspan="5">Other Deductions</th>
              <th rowspan="2">Chargeable Pay<br/>(K)</th>
              <th rowspan="2">Tax Charged<br/>(L)</th>
              <th rowspan="2">Personal Relief<br/>(M)</th>
              <th rowspan="2">Insurance Relief<br/>(N)</th>
              <th rowspan="2">PAYE Tax<br/>(O=L-M-N)</th>
            </tr>
            <tr>
              <th>A<br/>Basic Salary</th>
              <th>B<br/>Benefits NonCash</th>
              <th>C<br/>Value of Quarters</th>
              <th>D<br/>Total Gross Pay</th>
              <th>E1<br/>30% of A</th>
              <th>E2<br/>Actual</th>
              <th>E3<br/>Fixed (≤30,000)</th>
              <th>F<br/>AHL</th>
              <th>G<br/>SHIF</th>
              <th>H<br/>PRMF</th>
              <th>I<br/>Owner Occ. Interest</th>
              <th>J<br/>Total Deds</th>
            </tr>
          </thead>
          <tbody>
            ${employee.monthly.map(m => monthRow(m)).join('')}
            <tr>
              <td class="left"><strong>TOTAL</strong></td>
              <td class="amt"><strong>${totals.A.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.B.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.C.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.D.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.E1.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.E2.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.E3.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.F.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.G.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.H.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.I.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.J.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.K.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.L.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.M.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.N.toLocaleString()}</strong></td>
              <td class="amt"><strong>${totals.O.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="notes">
          <div><strong>IMPORTANT</strong></div>
          <div>1. Use P9A for all liable employees and where director/employee received benefits in addition to cash emoluments.</div>
          <div>2. Deductible pension contribution prior to December 2024 must not exceed KShs. 25,000 and commencing December 2024 must not exceed 30,000 per month. Use lower of 30% of basic salary, actual contribution or KShs. 30,000 p.m.</div>
          <div>3. Personal Relief is KShs. 2,400 per month or 28,800 per year.</div>
          <div>4. Insurance Relief is 15% of the premium up to a maximum of KShs. 5,000 per month or KShs. 60,000 per year.</div>
        </div>

        <div class="flex">
          <div>
            Employee Signature: ____________________<br/>
            Date: ____________________
          </div>
          <div>
            Employer Signature: ____________________<br/>
            Date: ____________________
          </div>
        </div>
      </body>
      </html>
    `;

    // Create and download the file
    const blob = new Blob([p9Html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `P9_Form_${employee.employeeName.replace(/\s+/g,'_')}_${selectedYear}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllP9Forms = () => {
    if (!p9Data) return;
    
    p9Data.employees.forEach(employee => {
      setTimeout(() => downloadP9FormPDF(employee), 150); // Small delay between downloads
    });
    
    toast({
      title: "Download Started",
      description: `Downloading P9 forms for ${p9Data.employees.length} employees.`,
    });
  };

  // --- PDF (KRA 2025 template) exporter ---
  const fetchTemplatePdf = async (): Promise<ArrayBuffer> => {
    const remoteUrl = "https://www.kra.go.ke/images/publications/P9-FORM-Template-2025.pdf";
    // Respect Vite base (e.g., "/app/") so path resolves correctly when app is served under subpath
    const base = (import.meta as any).env?.BASE_URL || "/";
    const normalizedBase = String(base).endsWith("/") ? String(base).slice(0, -1) : String(base);
    const localUrl = `${normalizedBase}/templates/P9-FORM-Template-2025.pdf`;
    try {
      const resp = await fetch(remoteUrl, { mode: "cors" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.arrayBuffer();
    } catch (e) {
      console.warn("Remote KRA template fetch failed, falling back to local template:", e);
      try {
        const respLocal = await fetch(localUrl);
        if (!respLocal.ok) throw new Error(`Local HTTP ${respLocal.status}`);
        return await respLocal.arrayBuffer();
      } catch (e2) {
        console.error("Local template fetch failed:", e2, "localUrl:", localUrl);
        throw e2;
      }
    }
  };

  const drawText = (
    page: any,
    text: string,
    x: number,
    y: number,
    font: any,
    size = 9,
    color = rgb(0, 0, 0),
    options: { align?: "left" | "right" | "center"; width?: number } = {}
  ) => {
    const { align = "left", width } = options;
    let drawX = x;
    if (width && (align === "right" || align === "center")) {
      const textWidth = font.widthOfTextAtSize(text, size);
      if (align === "right") drawX = x + width - textWidth;
      if (align === "center") drawX = x + (width - textWidth) / 2;
    }
    page.drawText(text, { x: drawX, y, size, font, color });
  };

  const numberFmt = (n: number) => (isFinite(n) ? n.toLocaleString("en-KE") : "0");

  const downloadP9FormPDF = async (employee: P9Data) => {
    try {
      const templateBytes = await fetchTemplatePdf();
      const pdfDoc = await PDFDocument.load(templateBytes);
      const page = pdfDoc.getPages()[0];
      const { height, width } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Header/meta approximate coordinates (tuned for KRA template layout)
      // Note: Coordinates are measured from bottom-left. Adjust if template margins differ.
      drawText(page, `YEAR ${p9Data?.year || selectedYear}`, width - 160, height - 90, font, 10);
      drawText(page, p9Data?.employerName || "", 120, height - 125, font, 10);
      drawText(page, p9Data?.employerPin || "", width - 220, height - 125, font, 10);
      drawText(page, employee.employeeName || "", 120, height - 145, font, 10);
      drawText(page, employee.pinNumber || "", width - 220, height - 145, font, 10);

      // Table placement (approximate grid overlay over template table)
      const tableLeft = 54; // left margin where MONTH column starts
      const tableTop = height - 205; // y for January row
      const rowH = 16; // row height
      // Column x positions relative to left
      const colXs = [
        0,   // MONTH (text left)
        120, // A
        170, // B
        220, // C
        270, // D
        330, // E1
        370, // E2
        410, // E3
        455, // F
        495, // G
        535, // H
        575, // I
        615, // J
        660, // K
        705, // L
        750, // M
        790, // N
        830  // O
      ];
      const colWidths = [120, 50, 50, 50, 55, 38, 38, 40, 38, 38, 38, 38, 42, 40, 40, 36, 36, 40];

      const writeRow = (rowIndex: number, label: string, r?: MonthlyP9Row) => {
        const y = tableTop - rowIndex * rowH;
        // Month label
        drawText(page, label, tableLeft + 4, y, font, 9);
        if (!r) return;
        const values = [
          r.A, r.B, r.C, r.D, r.E1, r.E2, r.E3,
          r.F, r.G, r.H, r.I, r.J, r.K, r.L, r.M, r.N, r.O
        ];
        for (let i = 0; i < values.length; i++) {
          const colX = tableLeft + colXs[i + 1];
          const width = colWidths[i + 1] || 40;
          drawText(page, numberFmt(values[i] || 0), colX + 2, y, font, 8.8, rgb(0, 0, 0), { align: "right", width: width - 6 });
        }
      };

      // 12 months
      const months = employee.monthly || [];
      const monthOrder = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ];
      for (let i = 0; i < 12; i++) {
        const mName = monthOrder[i];
        const r = months.find(m => m.month === mName);
        writeRow(i, mName, r);
      }

      // Totals row
      const totals = employee.monthly.reduce((acc, r) => ({
        A: acc.A + r.A, B: acc.B + r.B, C: acc.C + r.C, D: acc.D + r.D,
        E1: acc.E1 + r.E1, E2: acc.E2 + r.E2, E3: acc.E3 + r.E3,
        F: acc.F + r.F, G: acc.G + r.G, H: acc.H + r.H, I: acc.I + r.I,
        J: acc.J + r.J, K: acc.K + r.K, L: acc.L + r.L, M: acc.M + r.M, N: acc.N + r.N, O: acc.O + r.O
      }), {A:0,B:0,C:0,D:0,E1:0,E2:0,E3:0,F:0,G:0,H:0,I:0,J:0,K:0,L:0,M:0,N:0,O:0});
      const totalsRowIndex = 12; // row after December
      const totalsY = tableTop - totalsRowIndex * rowH;
      drawText(page, "TOTAL", tableLeft + 4, totalsY, font, 9);
      const totalsArr = [
        totals.A, totals.B, totals.C, totals.D, totals.E1, totals.E2, totals.E3,
        totals.F, totals.G, totals.H, totals.I, totals.J, totals.K, totals.L, totals.M, totals.N, totals.O
      ];
      for (let i = 0; i < totalsArr.length; i++) {
        const colX = tableLeft + colXs[i + 1];
        const width = colWidths[i + 1] || 40;
        drawText(page, numberFmt(totalsArr[i] || 0), colX + 2, totalsY, font, 9, rgb(0, 0, 0), { align: "right", width: width - 6 });
      }

      // Save & download
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `P9_Form_${employee.employeeName.replace(/\s+/g,'_')}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("P9 PDF export failed:", error);
      toast({
        title: "PDF Export Failed",
        description: `Could not export P9 using the KRA template. ${error?.message || "Please ensure the template is reachable."}`,
        variant: "destructive"
      });
    }
  };

  const handleEmployeeSelection = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(employees.map(emp => emp.id));
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            P9 Form Generator (Income Tax Certificate)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tax Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={selectAllEmployees} variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Select All
              </Button>
              <Button onClick={clearSelection} variant="outline" size="sm">
                Clear Selection
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateP9Forms} 
                disabled={loading || selectedEmployees.length === 0}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate P9 Forms"}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">
              Select Employees ({selectedEmployees.length} selected)
            </h3>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === employees.length && employees.length > 0}
                        onChange={(e) => e.target.checked ? selectAllEmployees() : clearSelection()}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>KRA PIN</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => handleEmployeeSelection(employee.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                          <div className="text-sm text-muted-foreground">{employee.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.kra_pin || 'N/A'}</TableCell>
                      <TableCell>
                        {selectedEmployees.includes(employee.id) ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Available</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P9 Forms Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              P9 Forms Preview - {selectedYear}
            </DialogTitle>
          </DialogHeader>
          
          {p9Data && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Generated {p9Data.employees.length} P9 Forms</h3>
                  <p className="text-sm text-muted-foreground">Tax Year: {p9Data.year}</p>
                </div>
                <Button onClick={downloadAllP9Forms}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All P9 Forms
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Basic Salary</TableHead>
                      <TableHead className="text-right">Total Gross Pay</TableHead>
                      <TableHead className="text-right">Chargeable Pay</TableHead>
                      <TableHead className="text-right">PAYE Tax</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {p9Data.employees.map((employee) => (
                      <TableRow key={employee.employeeId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">KSh {employee.basicSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-right">KSh {employee.totalGrossPay.toLocaleString()}</TableCell>
                        <TableCell className="text-right">KSh {employee.chargeablePay.toLocaleString()}</TableCell>
                        <TableCell className="text-right">KSh {employee.payeTax.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadP9FormPDF(employee)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}