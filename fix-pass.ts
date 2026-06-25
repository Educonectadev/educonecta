import { getSupabaseAdmin } from './src/lib/supabase';
async function run() {
  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'juan.perez.ruiz@la.pre.edu.pe');
  if (user) {
    await supabase.auth.admin.updateUserById(user.id, { password: 'Juan1234@' });
    console.log('Password updated successfully in Supabase auth for', user.email);
  } else {
    console.log('User not found in Supabase Auth', users);
  }
}
run();
