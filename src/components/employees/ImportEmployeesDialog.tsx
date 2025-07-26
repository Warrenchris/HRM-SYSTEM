import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string; data: any }>;
}

interface ImportEmployeesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const REQUIRED_FIELDS = [
  'employee_id',
  'first_name', 
  'last_name',
  'email',
  'department',
  'position',
  'join_date'
];

const OPTIONAL_FIELDS = [
  'second_name',
  'other_name',
  'phone',
  'address',
  'basic_salary',
  'hourly_rate',
  'contract_start_date',
  'contract_end_date',
  'office_email',
  'personal_email',
  'gender',
  'marital_status',
  'date_of_birth',
  'id_number',
  'kra_pin',
  'nssf_number',
  'shif_number',
  'bank_name',
  'bank_account_number',
  'bank_account_holder_name',
  'mpesa_name',
  'mpesa_number',
  'site_project',
  'office_branch',
  'reporting_to',
  'local_address',
  'permanent_address',
  'emergency_contact_person',
  'emergency_contact_number',
  'next_of_kin_name',
  'next_of_kin_relationship',
  'next_of_kin_mobile',
  'next_of_kin_email'
];

export function ImportEmployeesDialog({ isOpen, onClose, onImportComplete }: ImportEmployeesDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isValidFile, setIsValidFile] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [{
      employee_id: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      second_name: 'Michael',
      email: 'john.doe@company.com',
      department: 'IT',
      position: 'Software Developer',
      join_date: '2024-01-15',
      phone: '+254712345678',
      basic_salary: '80000',
      office_email: 'john.doe@company.com',
      personal_email: 'john.personal@gmail.com',
      gender: 'Male',
      marital_status: 'Single',
      date_of_birth: '1990-05-15',
      id_number: '12345678',
      site_project: 'Main Office',
      office_branch: 'Nairobi'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');
    XLSX.writeFile(wb, 'employee_import_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Employee import template has been downloaded.",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    previewFile(selectedFile);
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let jsonData: any[] = [];

        if (file.type === 'text/csv') {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        // Validate required fields
        if (jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
          
          if (missingFields.length > 0) {
            toast({
              title: "Missing Required Fields",
              description: `Missing: ${missingFields.join(', ')}`,
              variant: "destructive",
            });
            setIsValidFile(false);
          } else {
            setIsValidFile(true);
          }
        }

        setPreviewData(jsonData.slice(0, 5)); // Show first 5 rows for preview
      } catch (error) {
        toast({
          title: "File Parse Error",
          description: "Unable to parse the selected file.",
          variant: "destructive",
        });
      }
    };

    if (file.type === 'text/csv') {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const validateEmployeeData = (data: any, rowIndex: number): string[] => {
    const errors: string[] = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: ${field} is required`);
      }
    });

    // Validate email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push(`Row ${rowIndex + 2}: Invalid email format`);
    }

    // Validate date formats
    if (data.join_date && isNaN(Date.parse(data.join_date))) {
      errors.push(`Row ${rowIndex + 2}: Invalid join_date format (use YYYY-MM-DD)`);
    }

    if (data.date_of_birth && isNaN(Date.parse(data.date_of_birth))) {
      errors.push(`Row ${rowIndex + 2}: Invalid date_of_birth format (use YYYY-MM-DD)`);
    }

    return errors;
  };

  const processImport = async () => {
    if (!file || !isValidFile) return;

    setIsImporting(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        let jsonData: any[] = [];

        if (file.type === 'text/csv') {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        const result: ImportResult = {
          success: 0,
          failed: 0,
          errors: []
        };

        // Process each row
        for (let i = 0; i < jsonData.length; i++) {
          const rowData = jsonData[i];
          setProgress(((i + 1) / jsonData.length) * 100);

          // Validate row data
          const validationErrors = validateEmployeeData(rowData, i);
          if (validationErrors.length > 0) {
            result.failed++;
            validationErrors.forEach(error => {
              result.errors.push({
                row: i + 2,
                field: 'validation',
                message: error,
                data: rowData
              });
            });
            continue;
          }

          try {
            // Transform data to match database schema
            const employeeData = {
              employee_id: rowData.employee_id,
              first_name: rowData.first_name,
              last_name: rowData.last_name,
              second_name: rowData.second_name || null,
              other_name: rowData.other_name || null,
              email: rowData.email,
              department: rowData.department,
              position: rowData.position,
              join_date: rowData.join_date,
              phone: rowData.phone || null,
              address: rowData.address || null,
              basic_salary: rowData.basic_salary ? parseFloat(rowData.basic_salary) : null,
              hourly_rate: rowData.hourly_rate ? parseFloat(rowData.hourly_rate) : null,
              contract_start_date: rowData.contract_start_date || null,
              contract_end_date: rowData.contract_end_date || null,
              office_email: rowData.office_email || null,
              personal_email: rowData.personal_email || null,
              gender: rowData.gender || null,
              marital_status: rowData.marital_status || null,
              date_of_birth: rowData.date_of_birth || null,
              id_number: rowData.id_number || null,
              kra_pin: rowData.kra_pin || null,
              nssf_number: rowData.nssf_number || null,
              shif_number: rowData.shif_number || null,
              bank_name: rowData.bank_name || null,
              bank_account_number: rowData.bank_account_number || null,
              bank_account_holder_name: rowData.bank_account_holder_name || null,
              mpesa_name: rowData.mpesa_name || null,
              mpesa_number: rowData.mpesa_number || null,
              site_project: rowData.site_project || null,
              office_branch: rowData.office_branch || null,
              reporting_to: rowData.reporting_to || null,
              local_address: rowData.local_address || null,
              permanent_address: rowData.permanent_address || null,
              emergency_contact_person: rowData.emergency_contact_person || null,
              emergency_contact_number: rowData.emergency_contact_number || null,
              next_of_kin_name: rowData.next_of_kin_name || null,
              next_of_kin_relationship: rowData.next_of_kin_relationship || null,
              next_of_kin_mobile: rowData.next_of_kin_mobile || null,
              next_of_kin_email: rowData.next_of_kin_email || null,
              status: 'active'
            };

            // Insert employee into database
            const { error } = await supabase
              .from('employees')
              .insert([employeeData]);

            if (error) {
              result.failed++;
              result.errors.push({
                row: i + 2,
                field: 'database',
                message: error.message,
                data: rowData
              });
            } else {
              result.success++;
            }
          } catch (error) {
            result.failed++;
            result.errors.push({
              row: i + 2,
              field: 'processing',
              message: error instanceof Error ? error.message : 'Unknown error',
              data: rowData
            });
          }
        }

        setImportResult(result);
        setIsImporting(false);

        if (result.success > 0) {
          toast({
            title: "Import Completed",
            description: `Successfully imported ${result.success} employees. ${result.failed} failed.`,
          });
          onImportComplete();
        }
      } catch (error) {
        setIsImporting(false);
        toast({
          title: "Import Failed",
          description: "An error occurred during import.",
          variant: "destructive",
        });
      }
    };

    if (file.type === 'text/csv') {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setProgress(0);
    setIsValidFile(false);
    setIsImporting(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Employees</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Download Template</h3>
              <p className="text-sm text-muted-foreground">
                Download the Excel template to ensure proper formatting
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Select File</Label>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isImporting}
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>

          {/* File Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>File Preview</Label>
                {isValidFile ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Invalid
                  </Badge>
                )}
              </div>
              <ScrollArea className="h-40 border rounded-lg p-2">
                <div className="text-xs">
                  <div className="grid grid-cols-6 gap-2 font-medium border-b pb-1">
                    <div>Employee ID</div>
                    <div>First Name</div>
                    <div>Last Name</div>
                    <div>Email</div>
                    <div>Department</div>
                    <div>Position</div>
                  </div>
                  {previewData.map((row, index) => (
                    <div key={index} className="grid grid-cols-6 gap-2 py-1 border-b">
                      <div className="truncate">{row.employee_id}</div>
                      <div className="truncate">{row.first_name}</div>
                      <div className="truncate">{row.last_name}</div>
                      <div className="truncate">{row.email}</div>
                      <div className="truncate">{row.department}</div>
                      <div className="truncate">{row.position}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Progress */}
          {isImporting && (
            <div className="space-y-2">
              <Label>Import Progress</Label>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                Processing employees... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{importResult.success}</strong> employees imported successfully
                  </AlertDescription>
                </Alert>
                
                {importResult.failed > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{importResult.failed}</strong> employees failed to import
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <Label>Import Errors</Label>
                  <ScrollArea className="h-40 border rounded-lg p-2">
                    <div className="space-y-1">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600">
                          {error.message}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isImporting}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button 
                onClick={processImport} 
                disabled={!file || !isValidFile || isImporting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Employees'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}