const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || '10.203.248.26',
  user: process.env.DB_USER || 'zyc',
  password: process.env.DB_PASSWORD || 'cj',
  database: process.env.DB_NAME || 'agent-mall',
  port: process.env.DB_PORT || 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 打印数据库连接信息（用于调试）
console.log('🔗 数据库连接配置:');
console.log(`   主机: ${dbConfig.host}`);
console.log(`   端口: ${dbConfig.port}`);
console.log(`   数据库: ${dbConfig.database}`);
console.log(`   用户: ${dbConfig.user}`);

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询的通用方法
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 执行事务
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
