import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'juan.perez.ruiz@la.pre.edu.pe',
    password: 'Juan1234@'
  });
  if (error) {
    console.error("Login failed:", error.message);
  } else {
    console.log("Login successful:", data.user?.email);
  }
}

testLogin();
