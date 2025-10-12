-- AI商城数据库表结构设计
-- 基于前端代码分析的业务需求

-- 1. 管理员用户表
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码(加密)',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `role` enum('super_admin','admin','operator') DEFAULT 'admin' COMMENT '角色',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `last_login_at` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员用户表';

-- 2. 商品分类表
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `parent_id` int(11) DEFAULT 0 COMMENT '父分类ID，0为顶级分类',
  `level` tinyint(2) DEFAULT 1 COMMENT '分类层级',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `icon` varchar(255) DEFAULT NULL COMMENT '分类图标',
  `description` text COMMENT '分类描述',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_level` (`level`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 3. 品牌表
CREATE TABLE `brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '品牌名称',
  `logo` varchar(255) DEFAULT NULL COMMENT '品牌logo',
  `description` text COMMENT '品牌描述',
  `website` varchar(255) DEFAULT NULL COMMENT '官网',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='品牌表';

-- 4. 商品表
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '商品名称',
  `description` text COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `image` varchar(500) NOT NULL COMMENT '主图',
  `images` json DEFAULT NULL COMMENT '商品图片列表',
  `category_id` int(11) NOT NULL COMMENT '分类ID',
  `brand_id` int(11) DEFAULT NULL COMMENT '品牌ID',
  `sku` varchar(100) DEFAULT NULL COMMENT '商品SKU',
  `stock` int(11) DEFAULT 0 COMMENT '库存数量',
  `sales_count` int(11) DEFAULT 0 COMMENT '销量',
  `view_count` int(11) DEFAULT 0 COMMENT '浏览量',
  `heat_score` int(11) DEFAULT 0 COMMENT '热度分数',
  `is_ai_recommended` tinyint(1) DEFAULT 0 COMMENT '是否AI推荐: 1=是, 0=否',
  `ai_recommendation` text COMMENT 'AI推荐理由',
  `source_platform` varchar(50) DEFAULT NULL COMMENT '来源平台: bilibili, douyin, xiaohongshu',
  `source_url` varchar(500) DEFAULT NULL COMMENT '来源链接',
  `tags` json DEFAULT NULL COMMENT '标签列表',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=上架, 0=下架',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_brand_id` (`brand_id`),
  KEY `idx_price` (`price`),
  KEY `idx_heat_score` (`heat_score`),
  KEY `idx_is_ai_recommended` (`is_ai_recommended`),
  KEY `idx_source_platform` (`source_platform`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 5. 轮播图表
CREATE TABLE `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL COMMENT '标题',
  `image` varchar(500) NOT NULL COMMENT '图片URL',
  `link_url` varchar(500) DEFAULT NULL COMMENT '跳转链接',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `position` varchar(50) DEFAULT 'home' COMMENT '位置: home=首页',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_position` (`position`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- 6. AI Agent执行日志表
CREATE TABLE `ai_agent_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_type` varchar(50) NOT NULL COMMENT '任务类型: product_discovery, trend_analysis',
  `source_platform` varchar(50) NOT NULL COMMENT '来源平台',
  `products_added` int(11) DEFAULT 0 COMMENT '新增商品数量',
  `products_updated` int(11) DEFAULT 0 COMMENT '更新商品数量',
  `execution_time` int(11) DEFAULT 0 COMMENT '执行时间(秒)',
  `status` enum('success','failed','partial') DEFAULT 'success' COMMENT '执行状态',
  `error_message` text COMMENT '错误信息',
  `config` json DEFAULT NULL COMMENT '执行配置',
  `result` json DEFAULT NULL COMMENT '执行结果',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_source_platform` (`source_platform`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI Agent执行日志表';

-- 7. 热点数据表
CREATE TABLE `trending_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `platform` varchar(50) NOT NULL COMMENT '平台: bilibili, douyin, xiaohongshu',
  `content_type` varchar(50) NOT NULL COMMENT '内容类型: video, post, article',
  `title` varchar(500) NOT NULL COMMENT '标题',
  `content` text COMMENT '内容',
  `url` varchar(500) DEFAULT NULL COMMENT '原始链接',
  `author` varchar(100) DEFAULT NULL COMMENT '作者',
  `view_count` int(11) DEFAULT 0 COMMENT '观看数',
  `like_count` int(11) DEFAULT 0 COMMENT '点赞数',
  `comment_count` int(11) DEFAULT 0 COMMENT '评论数',
  `share_count` int(11) DEFAULT 0 COMMENT '分享数',
  `trend_score` int(11) DEFAULT 0 COMMENT '热度分数',
  `keywords` json DEFAULT NULL COMMENT '关键词',
  `tags` json DEFAULT NULL COMMENT '标签',
  `published_at` datetime DEFAULT NULL COMMENT '发布时间',
  `crawled_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '爬取时间',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=有效, 0=无效',
  PRIMARY KEY (`id`),
  KEY `idx_platform` (`platform`),
  KEY `idx_content_type` (`content_type`),
  KEY `idx_trend_score` (`trend_score`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_crawled_at` (`crawled_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热点数据表';

-- 8. 商品推荐表
CREATE TABLE `product_recommendations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL COMMENT '商品ID',
  `recommendation_type` varchar(50) NOT NULL COMMENT '推荐类型: ai_hot, user_based, category_based',
  `recommendation_reason` text COMMENT '推荐理由',
  `confidence_score` decimal(3,2) DEFAULT 0.00 COMMENT '置信度分数(0-1)',
  `source_data` json DEFAULT NULL COMMENT '来源数据',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=有效, 0=无效',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_recommendation_type` (`recommendation_type`),
  KEY `idx_confidence_score` (`confidence_score`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品推荐表';

-- 9. 系统配置表
CREATE TABLE `system_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text COMMENT '配置值',
  `config_type` varchar(50) DEFAULT 'string' COMMENT '配置类型: string, number, boolean, json',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `group_name` varchar(50) DEFAULT 'general' COMMENT '配置分组',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`),
  KEY `idx_group_name` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 10. 操作日志表
CREATE TABLE `operation_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) DEFAULT NULL COMMENT '管理员ID',
  `operation_type` varchar(50) NOT NULL COMMENT '操作类型: create, update, delete, login, logout',
  `table_name` varchar(50) DEFAULT NULL COMMENT '操作表名',
  `record_id` int(11) DEFAULT NULL COMMENT '记录ID',
  `operation_desc` varchar(255) DEFAULT NULL COMMENT '操作描述',
  `request_data` json DEFAULT NULL COMMENT '请求数据',
  `response_data` json DEFAULT NULL COMMENT '响应数据',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_table_name` (`table_name`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 插入初始数据

-- 插入默认管理员
INSERT INTO `admin_users` (`username`, `password`, `email`, `role`) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'super_admin');

-- 插入商品分类
INSERT INTO `categories` (`name`, `parent_id`, `level`, `sort_order`, `description`) VALUES
('手机', 0, 1, 1, '智能手机及配件'),
('穿戴', 0, 1, 2, '智能穿戴设备'),
('平板', 0, 1, 3, '平板电脑及配件'),
('笔记本', 0, 1, 4, '笔记本电脑'),
('智慧屏', 0, 1, 5, '智能电视及显示器'),
('家电', 0, 1, 6, '智能家电产品');

-- 插入品牌数据
INSERT INTO `brands` (`name`, `description`) VALUES
('华为', '华为技术有限公司'),
('小米', '小米科技有限责任公司'),
('苹果', 'Apple Inc.'),
('三星', 'Samsung Electronics'),
('OPPO', 'OPPO广东移动通信有限公司'),
('vivo', '维沃移动通信有限公司');

-- 插入系统配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `description`, `group_name`) VALUES
('site_name', 'AI智能商城', 'string', '网站名称', 'general'),
('ai_agent_enabled', 'true', 'boolean', 'AI代理是否启用', 'ai'),
('trend_analysis_interval', '3600', 'number', '热点分析间隔(秒)', 'ai'),
('max_products_per_batch', '10', 'number', '每批最大商品数量', 'ai'),
('supported_platforms', '["bilibili", "douyin", "xiaohongshu"]', 'json', '支持的平台', 'ai');

-- 创建索引优化查询性能
CREATE INDEX idx_products_ai_heat ON products(is_ai_recommended, heat_score DESC, created_at DESC);
CREATE INDEX idx_products_category_status ON products(category_id, status, created_at DESC);
CREATE INDEX idx_trending_platform_score ON trending_data(platform, trend_score DESC, published_at DESC);
CREATE INDEX idx_agent_logs_created ON ai_agent_logs(created_at DESC, status);
