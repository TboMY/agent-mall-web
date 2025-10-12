const Brand = require('./models/Brand');
const Category = require('./models/Category');

async function testAPIs() {
  try {
    console.log('🧪 测试品牌API...');
    const brands = await Brand.getAll();
    console.log('✅ 品牌列表:', brands.length, '个品牌');
    
    console.log('🧪 测试分类API...');
    const categories = await Category.getTree();
    console.log('✅ 分类树:', categories.length, '个顶级分类');
    
    console.log('🎉 所有API测试通过！');
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

testAPIs();
