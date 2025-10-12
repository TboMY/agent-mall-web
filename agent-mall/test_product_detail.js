const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testProductDetail() {
  try {
    console.log('🧪 测试商品详情API...\n');
    
    // 获取商品详情
    const response = await axios.get(`${BASE_URL}/products/9`);
    const product = response.data.data;
    
    console.log('商品详情:');
    console.log('- ID:', product.id);
    console.log('- 名称:', product.name);
    console.log('- 商品类型ID:', product.product_type_id);
    console.log('- 规格信息:', product.specifications);
    console.log('- 分类ID:', product.category_id);
    console.log('- 品牌ID:', product.brand_id);
    
    if (product.product_type_id) {
      console.log('\n🔍 测试商品属性API...');
      const attributesResponse = await axios.get(`${BASE_URL}/product-attributes/type/${product.product_type_id}`);
      console.log('属性数量:', attributesResponse.data.data.length);
      console.log('属性列表:', attributesResponse.data.data.map(attr => ({
        id: attr.id,
        name: attr.name,
        value_type: attr.value_type,
        is_required: attr.is_required,
        values_count: attr.values ? attr.values.length : 0
      })));
    } else {
      console.log('❌ 商品没有商品类型ID');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testProductDetail();
