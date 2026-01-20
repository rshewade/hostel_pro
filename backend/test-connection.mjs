import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://fteqtsoifrqigegdvqhx.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXF0c29pZnJxaWdlZ2R2cWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjQ1MTQsImV4cCI6MjA4MTc0MDUxNH0.VE3Wfcxdp5phhdd2GDk_2ZuuZVMjnu1gKjSN7o-47VU';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\nClient created successfully');
  console.log('Testing simple query...');

  // Try to check if we can make any request
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);

  if (error) {
    console.log('\n❌ Query failed:');
    console.log('Error:', error);
    console.log('Error message:', error.message);
  } else {
    console.log('\n✅ Query successful!');
    console.log('Data:', data);
  }

  console.log('\nClient methods available:');
  console.log('- auth:', !!supabase.auth);
  console.log('- from:', typeof supabase.from);
  console.log('- storage:', !!supabase.storage);

} catch (error) {
  console.log('\n❌ Connection failed:');
  console.log('Error:', error);
  console.log('Error message:', error.message);
  console.log('Error code:', error.code);
  console.log('Error type:', error.constructor.name);
}
