import mysql from 'mysql2'; console.log(mysql.format('SELECT COUNT(*) FROM Student WHERE gradeId IN (?)', [[1, 2]]));
