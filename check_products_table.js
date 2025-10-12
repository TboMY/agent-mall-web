const mysql = require('mysql2/promise');
const config = require('./agent-mall/config/database');

async function checkTable() {
  const connection = await mysql.createConnection(config);
  const [rows] = await connection.execute('DESCRIBE products');
  console.log('Products table structure:');
  rows.forEach(row => console.log(row));
  await connection.end();
}

checkTable().catch(console.error);
