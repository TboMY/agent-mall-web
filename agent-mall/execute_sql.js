const mysql = require('mysql2/promise');
const config = require('./config/database');

async function executeSQL() {
  const connection = await mysql.createConnection(config);
  
  try {
    // 添加 specifications 字段
    await connection.execute(`
      ALTER TABLE products 
      ADD COLUMN specifications JSON DEFAULT NULL COMMENT '商品规格信息'
    `);
    console.log('✅ 成功添加 specifications 字段');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ specifications 字段已存在');
    } else {
      console.error('❌ 添加字段失败:', error.message);
    }
  } finally {
    await connection.end();
  }
}

executeSQL().catch(console.error);
