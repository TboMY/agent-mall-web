const mysql = require('mysql2/promise');
const config = require('./agent-mall/config/database');

async function addSpecificationsField() {
  const connection = await mysql.createConnection(config);
  
  try {
    // 添加 specifications 字段
    await connection.execute(`
      ALTER TABLE products 
      ADD COLUMN specifications JSON DEFAULT NULL COMMENT '商品规格信息'
    `);
    console.log('✅ 成功添加 specifications 字段');
    
    // 验证字段是否添加成功
    const [rows] = await connection.execute('DESCRIBE products');
    const specificationsField = rows.find(row => row.Field === 'specifications');
    if (specificationsField) {
      console.log('✅ 字段验证成功:', specificationsField);
    } else {
      console.log('❌ 字段添加失败');
    }
    
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

addSpecificationsField().catch(console.error);
