# 🚀 AI商城后台快速启动指南

## 📋 当前配置
- **MySQL服务器**: `10.203.248.26:3306`
- **数据库名称**: `agent-mall`
- **默认用户**: `root`
- **默认密码**: 空

## 🛠 启动步骤

### 1. 安装依赖
```bash
cd agent-mall
npm install
```

### 2. 测试数据库连接
```bash
npm run test-db
```
这个命令会：
- 测试数据库连接
- 检查表结构
- 显示各表的数据数量

### 3. 启动服务器
```bash
npm run dev
```

### 4. 测试API接口
```bash
npm test
```

## 🔧 配置说明

### 数据库配置
当前配置在 `config/database.js` 中：
```javascript
{
  host: '10.203.248.26',
  user: 'root',
  password: '',  // 如果需要密码，请修改这里
  database: 'agent-mall',
  port: 3306
}
```

### 环境变量（可选）
如果需要修改配置，可以设置环境变量：
```bash
export DB_HOST=10.203.248.26
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=agent-mall
```

## 📚 API端点

启动成功后，可以访问以下API：

### 商品管理
- `GET http://localhost:3000/api/products` - 获取商品列表
- `POST http://localhost:3000/api/products` - 创建商品
- `GET http://localhost:3000/api/products/1` - 获取商品详情

### 分类管理
- `GET http://localhost:3000/api/categories` - 获取分类列表
- `GET http://localhost:3000/api/categories/tree` - 获取分类树

### 品牌管理
- `GET http://localhost:3000/api/brands` - 获取品牌列表

## 🧪 测试示例

### 创建商品
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试商品",
    "price": 99.99,
    "image": "https://example.com/image.jpg",
    "category_id": 1
  }'
```

### 获取商品列表
```bash
curl -X GET "http://localhost:3000/api/products"
```

## 🚨 故障排除

### 数据库连接失败
1. 检查MySQL服务是否运行
2. 确认IP地址 `10.203.248.26` 是否可访问
3. 检查端口 `3306` 是否开放
4. 确认数据库 `agent-mall` 是否存在

### 权限问题
如果遇到权限问题，请检查：
1. MySQL用户是否有访问数据库的权限
2. 是否需要设置密码

### 表不存在
如果表不存在，请运行：
```bash
mysql -h 10.203.248.26 -u root -p agent-mall < database_schema.sql
```

## 📞 技术支持

如果遇到问题，请检查：
1. 控制台输出的错误信息
2. 数据库连接状态
3. 网络连接是否正常

## 🎯 下一步

1. 运行 `npm run test-db` 测试数据库连接
2. 运行 `npm run dev` 启动服务器
3. 运行 `npm test` 测试API接口
4. 开始使用API进行商品管理
