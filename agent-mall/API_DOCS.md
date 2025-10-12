# AI商城后台API文档

## 基础信息
- 基础URL: `http://localhost:3000/api`
- 数据格式: JSON
- 字符编码: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误信息"
}
```

## 商品管理 API

### 1. 获取商品列表
- **URL**: `GET /api/products`
- **参数**:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 10)
  - `search`: 搜索关键词
  - `category_id`: 分类ID
  - `brand_id`: 品牌ID
  - `status`: 状态 (0=下架, 1=上架)
  - `is_ai_recommended`: AI推荐 (0=否, 1=是)
  - `sort_by`: 排序字段 (created_at, price, heat_score, sales_count)
  - `sort_order`: 排序方向 (ASC, DESC)

**示例**:
```
GET /api/products?page=1&limit=10&search=手机&category_id=1&status=1
```

### 2. 获取商品详情
- **URL**: `GET /api/products/:id`
- **参数**: `id` - 商品ID

### 3. 创建商品
- **URL**: `POST /api/products`
- **请求体**:
```json
{
  "name": "商品名称",
  "description": "商品描述",
  "price": 99.99,
  "original_price": 199.99,
  "image": "https://example.com/image.jpg",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "category_id": 1,
  "brand_id": 1,
  "sku": "SKU001",
  "stock": 100,
  "heat_score": 85,
  "is_ai_recommended": true,
  "ai_recommendation": "AI推荐理由",
  "source_platform": "douyin",
  "source_url": "https://example.com/source",
  "tags": ["热门", "推荐"],
  "status": 1
}
```

### 4. 更新商品
- **URL**: `PUT /api/products/:id`
- **请求体**: 同创建商品，但所有字段都是可选的

### 5. 删除商品
- **URL**: `DELETE /api/products/:id`

### 6. 批量删除商品
- **URL**: `DELETE /api/products`
- **请求体**:
```json
{
  "ids": [1, 2, 3]
}
```

### 7. 更新商品状态
- **URL**: `PATCH /api/products/:id/status`
- **请求体**:
```json
{
  "status": 1
}
```

### 8. 更新商品库存
- **URL**: `PATCH /api/products/:id/stock`
- **请求体**:
```json
{
  "stock": 100
}
```

### 9. 获取AI推荐商品
- **URL**: `GET /api/products/ai/recommended`
- **参数**: `limit` - 数量限制 (默认: 10)

### 10. 获取热门商品
- **URL**: `GET /api/products/hot`
- **参数**: `limit` - 数量限制 (默认: 10)

## 分类管理 API

### 1. 获取所有分类
- **URL**: `GET /api/categories`

### 2. 获取分类树形结构
- **URL**: `GET /api/categories/tree`

### 3. 获取分类详情
- **URL**: `GET /api/categories/:id`

### 4. 创建分类
- **URL**: `POST /api/categories`
- **请求体**:
```json
{
  "name": "分类名称",
  "parent_id": 0,
  "level": 1,
  "sort_order": 0,
  "icon": "https://example.com/icon.jpg",
  "description": "分类描述",
  "status": 1
}
```

### 5. 更新分类
- **URL**: `PUT /api/categories/:id`

### 6. 删除分类
- **URL**: `DELETE /api/categories/:id`

## 品牌管理 API

### 1. 获取所有品牌
- **URL**: `GET /api/brands`

### 2. 获取品牌详情
- **URL**: `GET /api/brands/:id`

### 3. 创建品牌
- **URL**: `POST /api/brands`
- **请求体**:
```json
{
  "name": "品牌名称",
  "logo": "https://example.com/logo.jpg",
  "description": "品牌描述",
  "website": "https://example.com",
  "status": 1
}
```

### 4. 更新品牌
- **URL**: `PUT /api/brands/:id`

### 5. 删除品牌
- **URL**: `DELETE /api/brands/:id`

## 数据验证规则

### 商品验证
- `name`: 必填，1-255字符
- `price`: 必填，正数，最多2位小数
- `image`: 必填，有效URL
- `category_id`: 必填，正整数
- `stock`: 非负整数
- `heat_score`: 非负整数
- `source_platform`: 可选，必须是 bilibili/douyin/xiaohongshu 之一

### 分类验证
- `name`: 必填，1-100字符
- `parent_id`: 非负整数
- `level`: 1-3之间的整数
- `sort_order`: 非负整数

### 品牌验证
- `name`: 必填，1-100字符
- `logo`: 可选，有效URL
- `website`: 可选，有效URL

## 错误码说明

- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 使用示例

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

### 删除商品
```bash
curl -X DELETE "http://localhost:3000/api/products/1"
```
