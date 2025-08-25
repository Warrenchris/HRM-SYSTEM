import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function verifyCompanySetup() {
  console.log('Verifying company setup...');

  // Check if default company exists
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('*');

  if (companyError) {
    console.error('Error checking companies:', companyError);
    return;
  }

  if (companies.length === 0) {
    console.error('No companies found! Migration may have failed.');
    return;
  }

  console.log(`Found ${companies.length} companies`);
  const defaultCompany = companies[0];
  console.log('Default company:', defaultCompany);

  // Check employees
  const { data: employees, error: employeeError } = await supabase
    .from('employees')
    .select('id, company_id');

  if (employeeError) {
    console.error('Error checking employees:', employeeError);
    return;
  }

  const employeesWithoutCompany = employees.filter(e => !e.company_id);
  console.log(`Found ${employees.length} employees`);
  console.log(`Employees without company: ${employeesWithoutCompany.length}`);

  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, company_id');

  if (profileError) {
    console.error('Error checking profiles:', profileError);
    return;
  }

  const profilesWithoutCompany = profiles.filter(p => !p.company_id);
  console.log(`Found ${profiles.length} profiles`);
  console.log(`Profiles without company: ${profilesWithoutCompany.length}`);

  // Check attendance records
  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance_records')
    .select('id, company_id');

  if (attendanceError) {
    console.error('Error checking attendance records:', attendanceError);
    return;
  }

  const attendanceWithoutCompany = attendance.filter(a => !a.company_id);
  console.log(`Found ${attendance.length} attendance records`);
  console.log(`Attendance records without company: ${attendanceWithoutCompany.length}`);

  console.log('Verification complete!');
}

verifyCompanySetup()
  .catch(console.error);
