const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/products?page=1&limit=20&search=',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('响应体:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('解析后的数据:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('JSON解析失败:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
  });

  req.end();
}

console.log('🧪 测试修复后的API接口...');
testAPI();
