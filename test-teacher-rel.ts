import { getSupabaseAdmin } from './src/lib/supabase';
async function run() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('Teacher').select('*, user:User(id, name, email, phone)').limit(1);
  console.log(JSON.stringify(data, null, 2));
}
run();
