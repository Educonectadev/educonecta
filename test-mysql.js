import mysql from 'mysql2'; console.log(mysql.format('SELECT * FROM a WHERE isActive = true', [])); console.log(mysql.format('SELECT * FROM a WHERE isActive = ?', [true]));
