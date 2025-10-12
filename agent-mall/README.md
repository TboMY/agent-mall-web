# AI商城后台管理系统

基于Node.js + Express + MySQL的AI商城后台管理系统，提供完整的商品管理功能。

## 🚀 功能特性

- ✅ **商品管理**: 完整的CRUD操作，支持AI推荐、热度评分
- ✅ **分类管理**: 多级分类，树形结构展示
- ✅ **品牌管理**: 品牌信息维护
- ✅ **数据验证**: 完整的输入验证和错误处理
- ✅ **API文档**: 详细的接口文档
- ✅ **数据库设计**: 优化的MySQL表结构

## 📋 系统要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm >= 6.0.0

## 🛠 安装步骤

### 1. 安装依赖
```bash
cd agent-mall
npm install
```

### 2. 数据库配置
1. 创建MySQL数据库：
```sql
CREATE DATABASE agent_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 导入数据库结构：
```bash
mysql -u root -p agent_mall < database_schema.sql
```

3. 配置数据库连接（可选，使用环境变量）：
```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=agent_mall
export DB_PORT=3306
```

### 3. 启动服务
```bash
# 开发模式启动
npm run dev

# 或者使用传统方式
npm start
```

## 📚 API接口

### 商品管理
- `GET /api/products` - 获取商品列表（支持分页、搜索、筛选）
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品
- `PATCH /api/products/:id/status` - 更新商品状态
- `PATCH /api/products/:id/stock` - 更新商品库存
- `GET /api/products/ai/recommended` - 获取AI推荐商品
- `GET /api/products/hot` - 获取热门商品

### 分类管理
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/tree` - 获取分类树形结构
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 品牌管理
- `GET /api/brands` - 获取所有品牌
- `GET /api/brands/:id` - 获取品牌详情
- `POST /api/brands` - 创建品牌
- `PUT /api/brands/:id` - 更新品牌
- `DELETE /api/brands/:id` - 删除品牌

## 🧪 测试

运行API测试：
```bash
npm test
```

## 📖 使用示例

### 获取商品列表
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&status=1"
```

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

### 更新商品
```bash
curl -X PUT "http://localhost:3000/api/products/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的商品名称",
    "price": 199.99
  }'
```

## 📁 项目结构

```
agent-mall/
├── config/                 # 配置文件
│   └── database.js        # 数据库连接配置
├── middleware/            # 中间件
│   └── validation.js     # 数据验证中间件
├── models/               # 数据模型
│   ├── Product.js        # 商品模型
│   ├── Category.js       # 分类模型
│   └── Brand.js          # 品牌模型
├── routes/               # 路由
│   ├── products.js       # 商品路由
│   ├── categories.js     # 分类路由
│   └── brands.js         # 品牌路由
├── database_schema.sql   # 数据库结构
├── API_DOCS.md          # API文档
├── test_api.js          # API测试脚本
└── start.js             # 启动脚本
```

## 🔧 配置说明

### 数据库配置
在 `config/database.js` 中配置数据库连接参数，或使用环境变量：

```javascript
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agent_mall',
  port: process.env.DB_PORT || 3306
};
```

### 数据验证
所有API都包含完整的数据验证，验证规则在 `middleware/validation.js` 中定义。

## 🚨 注意事项

1. 确保MySQL服务正在运行
2. 数据库用户需要有创建表的权限
3. 建议在生产环境中使用环境变量配置敏感信息
4. 文件上传功能需要配置适当的存储路径

## 📞 技术支持

如有问题，请查看：
- API文档：`API_DOCS.md`
- 数据库结构：`database_schema.sql`
- 测试脚本：`test_api.js`

## 🎯 下一步计划

- [ ] 添加用户认证和权限管理
- [ ] 实现文件上传功能
- [ ] 添加商品图片管理
- [ ] 实现AI推荐算法
- [ ] 添加数据统计和分析功能
