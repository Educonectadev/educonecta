import { query } from './src/lib/supabase-db';
query('SELECT COUNT(*) as total FROM Student WHERE institutionId = 1 AND isActive = true').then(console.log).catch(console.error);
