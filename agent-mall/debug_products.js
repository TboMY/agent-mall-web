const Product = require('./models/Product');
const { query } = require('./config/database');

async function testGetProducts() {
  try {
    console.log('🧪 测试获取商品列表...');
    
    const options = {
      page: 1,
      limit: 20,
      search: '',
      category_id: null,
      brand_id: null,
      status: null,
      is_ai_recommended: null,
      sort_by: 'created_at',
      sort_order: 'DESC'
    };
    
    console.log('📋 请求参数:', options);
    
    // 手动构建SQL来调试
    const pageNum = parseInt(options.page) || 1;
    const limitNum = parseInt(options.limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    // 尝试方法1：使用字符串拼接LIMIT和OFFSET
    let sql1 = `
      SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
      ORDER BY p.created_at DESC LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    console.log('🔍 方法1 - 字符串拼接SQL:', sql1);
    
    try {
      const products1 = await query(sql1, []);
      console.log('✅ 方法1成功，商品数量:', products1.length);
    } catch (error1) {
      console.log('❌ 方法1失败:', error1.message);
    }
    
    // 尝试方法2：使用参数化查询
    let sql2 = `
      SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
      ORDER BY p.created_at DESC LIMIT ? OFFSET ?
    `;
    
    const params = [limitNum, offset];
    
    console.log('🔍 方法2 - 参数化查询SQL:', sql2);
    console.log('📊 参数:', params);
    console.log('📊 参数类型:', params.map(p => typeof p));
    
    try {
      const products2 = await query(sql2, params);
      console.log('✅ 方法2成功，商品数量:', products2.length);
    } catch (error2) {
      console.log('❌ 方法2失败:', error2.message);
    }
    
    // 现在测试Product.getProducts方法
    console.log('\n🧪 测试Product.getProducts方法...');
    const result = await Product.getProducts(options);
    
    console.log('✅ 成功获取商品列表');
    console.log('📊 商品数量:', result.products.length);
    console.log('📄 分页信息:', result.pagination);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('🔍 错误详情:', error);
  }
}

testGetProducts();

