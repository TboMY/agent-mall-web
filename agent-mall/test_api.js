const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试函数
async function testAPI() {
  console.log('🚀 开始测试API接口...\n');

  try {
    // 1. 测试获取商品列表
    console.log('1. 测试获取商品列表');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ 商品列表:', productsResponse.data);
    console.log('');

    // 2. 测试获取分类列表
    console.log('2. 测试获取分类列表');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ 分类列表:', categoriesResponse.data);
    console.log('');

    // 3. 测试获取品牌列表
    console.log('3. 测试获取品牌列表');
    const brandsResponse = await axios.get(`${BASE_URL}/brands`);
    console.log('✅ 品牌列表:', brandsResponse.data);
    console.log('');

    // 4. 测试创建商品
    console.log('4. 测试创建商品');
    const newProduct = {
      name: '测试商品',
      description: '这是一个测试商品',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      category_id: 1,
      stock: 100,
      status: 1
    };
    
    const createResponse = await axios.post(`${BASE_URL}/products`, newProduct);
    console.log('✅ 创建商品成功:', createResponse.data);
    const productId = createResponse.data.data.id;
    console.log('');

    // 5. 测试获取商品详情
    console.log('5. 测试获取商品详情');
    const productDetailResponse = await axios.get(`${BASE_URL}/products/${productId}`);
    console.log('✅ 商品详情:', productDetailResponse.data);
    console.log('');

    // 6. 测试更新商品
    console.log('6. 测试更新商品');
    const updateData = {
      name: '更新后的测试商品',
      price: 199.99
    };
    const updateResponse = await axios.put(`${BASE_URL}/products/${productId}`, updateData);
    console.log('✅ 更新商品成功:', updateResponse.data);
    console.log('');

    // 7. 测试更新商品状态
    console.log('7. 测试更新商品状态');
    const statusResponse = await axios.patch(`${BASE_URL}/products/${productId}/status`, { status: 0 });
    console.log('✅ 更新商品状态成功:', statusResponse.data);
    console.log('');

    // 8. 测试更新商品库存
    console.log('8. 测试更新商品库存');
    const stockResponse = await axios.patch(`${BASE_URL}/products/${productId}/stock`, { stock: 50 });
    console.log('✅ 更新商品库存成功:', stockResponse.data);
    console.log('');

    // 9. 测试获取AI推荐商品
    console.log('9. 测试获取AI推荐商品');
    const aiResponse = await axios.get(`${BASE_URL}/products/ai/recommended`);
    console.log('✅ AI推荐商品:', aiResponse.data);
    console.log('');

    // 10. 测试获取热门商品
    console.log('10. 测试获取热门商品');
    const hotResponse = await axios.get(`${BASE_URL}/products/hot`);
    console.log('✅ 热门商品:', hotResponse.data);
    console.log('');

    // 11. 测试删除商品
    console.log('11. 测试删除商品');
    const deleteResponse = await axios.delete(`${BASE_URL}/products/${productId}`);
    console.log('✅ 删除商品成功:', deleteResponse.data);
    console.log('');

    console.log('🎉 所有API测试完成！');

  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
