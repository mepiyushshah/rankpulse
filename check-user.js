// Check if user exists in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(email) {
  try {
    // Check in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error querying database:', error);
      return;
    }

    if (data) {
      console.log('\n✅ User found in profiles table:');
      console.log('-----------------------------------');
      console.log('ID:', data.id);
      console.log('Email:', data.email);
      console.log('Full Name:', data.full_name || 'Not set');
      console.log('Organization:', data.organization_name || 'Not set');
      console.log('Created At:', data.created_at);
      console.log('-----------------------------------\n');
    } else {
      console.log('\n❌ No user found with email:', email);
      console.log('-----------------------------------\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

const email = process.argv[2] || 'piyush.shah2212@gmail.com';
checkUser(email);
