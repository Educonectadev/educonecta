import { query } from './src/lib/supabase-db';
query('SELECT COUNT(*) as total FROM Schedule WHERE institutionId = 1 AND dayOfWeek = 4 AND courseId IN (?)', [[]]).then(console.log).catch(console.error);
