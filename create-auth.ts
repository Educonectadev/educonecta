import { getSupabaseAdmin } from './src/lib/supabase';
async function run() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'juan.perez.ruiz@la.pre.edu.pe',
    password: 'Juan1234@',
    email_confirm: true,
  });
  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created in Supabase auth successfully:', data.user.email);
  }
}
run();
