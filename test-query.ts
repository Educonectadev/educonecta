import { query } from './src/lib/supabase-db';
query('SELECT id, email, name FROM "User"').then(console.log).catch(console.error);
