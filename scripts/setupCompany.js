import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function setupDefaultCompany() {
  console.log('Setting up default company...');

  try {
    // Check if we have any companies
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (!existingCompanies || existingCompanies.length === 0) {
      // Create default company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Default Company',
          email: 'admin@defaultcompany.com',
          phone: '+1234567890',
          address: '123 Business Street',
          website: 'www.defaultcompany.com',
          subscription_status: 'active',
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      console.log('Created default company:', company);
      
      // Update all existing employees
      const { error: employeeError } = await supabase
        .rpc('update_employees_company', { new_company_id: company.id });
      
      if (employeeError) {
        throw employeeError;
      }

      // Update all existing profiles
      const { error: profileError } = await supabase
        .rpc('update_profiles_company', { new_company_id: company.id });
      
      if (profileError) {
        throw profileError;
      }

      console.log('Updated all employees and profiles with default company');
    } else {
      console.log('Company already exists, updating any unassigned records...');
      
      const companyId = existingCompanies[0].id;
      
      // Update unassigned employees
      const { error: employeeError } = await supabase
        .rpc('update_employees_company', { new_company_id: companyId });
      
      if (employeeError) {
        throw employeeError;
      }

      // Update unassigned profiles
      const { error: profileError } = await supabase
        .rpc('update_profiles_company', { new_company_id: companyId });
      
      if (profileError) {
        throw profileError;
      }
    }

    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

// Run the setup
setupDefaultCompany();
