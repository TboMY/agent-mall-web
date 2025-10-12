const { testConnection, query } = require('./config/database');

async function testDatabaseConnection() {
  console.log('🧪 测试数据库连接...\n');

  try {
    // 1. 测试基本连接
    console.log('1. 测试数据库连接');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ 数据库连接失败');
      return;
    }

    // 2. 测试查询表是否存在
    console.log('\n2. 检查数据库表结构');
    const tables = await query('SHOW TABLES');
    console.log('✅ 数据库表列表:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // 3. 检查关键表的数据
    console.log('\n3. 检查关键表数据');
    
    // 检查管理员表
    try {
      const adminCount = await query('SELECT COUNT(*) as count FROM admin_users');
      console.log(`✅ 管理员用户数量: ${adminCount[0].count}`);
    } catch (error) {
      console.log('⚠️  管理员表可能不存在或为空');
    }

    // 检查分类表
    try {
      const categoryCount = await query('SELECT COUNT(*) as count FROM categories');
      console.log(`✅ 分类数量: ${categoryCount[0].count}`);
    } catch (error) {
      console.log('⚠️  分类表可能不存在或为空');
    }

    // 检查品牌表
    try {
      const brandCount = await query('SELECT COUNT(*) as count FROM brands');
      console.log(`✅ 品牌数量: ${brandCount[0].count}`);
    } catch (error) {
      console.log('⚠️  品牌表可能不存在或为空');
    }

    // 检查商品表
    try {
      const productCount = await query('SELECT COUNT(*) as count FROM products');
      console.log(`✅ 商品数量: ${productCount[0].count}`);
    } catch (error) {
      console.log('⚠️  商品表可能不存在或为空');
    }

    console.log('\n🎉 数据库连接测试完成！');
    console.log('\n📋 下一步操作:');
    console.log('   1. 运行 npm run dev 启动服务器');
    console.log('   2. 运行 npm test 测试API接口');
    console.log('   3. 访问 http://localhost:3000/api/products 查看商品API');

  } catch (error) {
    console.error('❌ 数据库测试失败:', error.message);
    console.log('\n🔧 故障排除建议:');
    console.log('   1. 检查MySQL服务是否运行');
    console.log('   2. 确认IP地址和端口是否正确');
    console.log('   3. 检查数据库用户权限');
    console.log('   4. 确认数据库名称是否正确');
  }
}

// 运行测试
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = testDatabaseConnection;
