import mysql from 'mysql2'; console.log(mysql.format('SELECT * FROM a WHERE dueDate >= ?', [new Date()]));
