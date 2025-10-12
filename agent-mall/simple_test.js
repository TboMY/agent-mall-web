const Product = require('./models/Product');

async function simpleTest() {
  try {
    console.log('🧪 简单测试Product.getProducts...');
    
    const result = await Product.getProducts({
      page: 1,
      limit: 5,
      search: '',
      category_id: null,
      brand_id: null,
      status: null,
      is_ai_recommended: null,
      sort_by: 'created_at',
      sort_order: 'DESC'
    });
    
    console.log('✅ 成功!');
    console.log('📊 商品数量:', result.products.length);
    console.log('📄 分页信息:', result.pagination);
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.error('🔍 错误详情:', error);
  }
}

simpleTest();
