const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '10.203.248.26',
  user: 'zyc',
  password: 'cj',
  database: 'agent-mall',
  port: 3307
};

async function addSpecificationsField() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 添加 specifications 字段
    console.log('📝 添加 specifications 字段到 products 表...');
    const sql = `
      ALTER TABLE products 
      ADD COLUMN specifications JSON DEFAULT NULL 
      COMMENT '商品规格信息'
    `;
    
    await connection.execute(sql);
    console.log('✅ specifications 字段添加成功');

    // 验证字段是否添加成功
    console.log('🔍 验证字段添加结果...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'agent-mall' 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'specifications'
    `);
    
    if (columns.length > 0) {
      console.log('✅ 验证成功，specifications 字段已存在:');
      console.log(columns[0]);
    } else {
      console.log('❌ 验证失败，specifications 字段未找到');
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ 字段已存在，无需重复添加');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
addSpecificationsField();