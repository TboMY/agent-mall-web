-- 商品类型管理系统数据库表结构
-- 用于管理不同商品类型的自定义规格属性

-- 1. 商品类型表
CREATE TABLE `product_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '商品类型名称',
  `description` text COMMENT '商品类型描述',
  `icon` varchar(255) DEFAULT NULL COMMENT '类型图标',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品类型表';

-- 2. 商品属性表
CREATE TABLE `product_attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_type_id` int(11) NOT NULL COMMENT '商品类型ID',
  `name` varchar(100) NOT NULL COMMENT '属性名称',
  `attribute_key` varchar(100) NOT NULL COMMENT '属性键名',
  `description` text COMMENT '属性描述',
  `value_type` enum('single','multiple','custom') DEFAULT 'single' COMMENT '值类型: single=单选, multiple=多选, custom=自定义输入',
  `is_required` tinyint(1) DEFAULT 0 COMMENT '是否必填: 1=必填, 0=非必填',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_type_id` (`product_type_id`),
  KEY `idx_attribute_key` (`attribute_key`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_product_attributes_type` FOREIGN KEY (`product_type_id`) REFERENCES `product_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品属性表';

-- 3. 商品属性值表
CREATE TABLE `product_attribute_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attribute_id` int(11) NOT NULL COMMENT '属性ID',
  `value` varchar(255) NOT NULL COMMENT '属性值',
  `label` varchar(255) DEFAULT NULL COMMENT '显示标签',
  `color` varchar(20) DEFAULT NULL COMMENT '颜色值(用于颜色属性)',
  `image` varchar(255) DEFAULT NULL COMMENT '图片URL(用于图片属性)',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_attribute_id` (`attribute_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_product_attribute_values_attribute` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品属性值表';

-- 4. 商品规格表 (存储商品的具体规格值)
CREATE TABLE `product_specifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL COMMENT '商品ID',
  `attribute_id` int(11) NOT NULL COMMENT '属性ID',
  `attribute_value_id` int(11) DEFAULT NULL COMMENT '属性值ID(预定义值)',
  `custom_value` text DEFAULT NULL COMMENT '自定义值',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_attribute` (`product_id`, `attribute_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_attribute_id` (`attribute_id`),
  KEY `idx_attribute_value_id` (`attribute_value_id`),
  CONSTRAINT `fk_product_specifications_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_specifications_attribute` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_specifications_value` FOREIGN KEY (`attribute_value_id`) REFERENCES `product_attribute_values` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格表';

-- 5. 在商品表中添加商品类型字段
ALTER TABLE `products` ADD COLUMN `product_type_id` int(11) DEFAULT NULL COMMENT '商品类型ID' AFTER `category_id`;
ALTER TABLE `products` ADD KEY `idx_product_type_id` (`product_type_id`);
ALTER TABLE `products` ADD CONSTRAINT `fk_products_product_type` FOREIGN KEY (`product_type_id`) REFERENCES `product_types` (`id`) ON DELETE SET NULL;

-- 插入示例数据
INSERT INTO `product_types` (`name`, `description`, `icon`, `sort_order`, `status`) VALUES
('手机', '智能手机产品', '📱', 1, 1),
('笔记本电脑', '便携式电脑产品', '💻', 2, 1),
('耳机', '音频设备产品', '🎧', 3, 1),
('服装', '服装类产品', '👕', 4, 1);

-- 手机类型属性示例
INSERT INTO `product_attributes` (`product_type_id`, `name`, `attribute_key`, `description`, `value_type`, `is_required`, `sort_order`, `status`) VALUES
(1, '存储容量', 'storage', '手机存储容量', 'single', 1, 1, 1),
(1, '颜色', 'color', '手机颜色', 'single', 1, 2, 1),
(1, '屏幕尺寸', 'screen_size', '屏幕尺寸', 'single', 0, 3, 1),
(1, '网络制式', 'network', '支持的网络制式', 'multiple', 0, 4, 1);

-- 存储容量属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(1, '128GB', '128GB', 1, 1),
(1, '256GB', '256GB', 2, 1),
(1, '512GB', '512GB', 3, 1),
(1, '1TB', '1TB', 4, 1);

-- 颜色属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `color`, `sort_order`, `status`) VALUES
(2, 'black', '黑色', '#000000', 1, 1),
(2, 'white', '白色', '#FFFFFF', 2, 1),
(2, 'blue', '蓝色', '#0066CC', 3, 1),
(2, 'red', '红色', '#CC0000', 4, 1),
(2, 'green', '绿色', '#00CC00', 5, 1);

-- 屏幕尺寸属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(3, '6.1', '6.1英寸', 1, 1),
(3, '6.7', '6.7英寸', 2, 1),
(3, '6.9', '6.9英寸', 3, 1);

-- 网络制式属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(4, '5G', '5G网络', 1, 1),
(4, '4G', '4G网络', 2, 1),
(4, 'WiFi', 'WiFi', 3, 1),
(4, 'Bluetooth', '蓝牙', 4, 1);

-- 笔记本电脑类型属性示例
INSERT INTO `product_attributes` (`product_type_id`, `name`, `attribute_key`, `description`, `value_type`, `is_required`, `sort_order`, `status`) VALUES
(2, '处理器', 'processor', 'CPU处理器', 'single', 1, 1, 1),
(2, '内存', 'memory', '内存容量', 'single', 1, 2, 1),
(2, '硬盘', 'storage', '硬盘容量', 'single', 1, 3, 1),
(2, '显卡', 'graphics', '显卡型号', 'single', 0, 4, 1),
(2, '操作系统', 'os', '预装操作系统', 'single', 0, 5, 1);

-- 处理器属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(5, 'Intel i5', 'Intel Core i5', 1, 1),
(5, 'Intel i7', 'Intel Core i7', 2, 1),
(5, 'Intel i9', 'Intel Core i9', 3, 1),
(5, 'AMD Ryzen 5', 'AMD Ryzen 5', 4, 1),
(5, 'AMD Ryzen 7', 'AMD Ryzen 7', 5, 1);

-- 内存属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(6, '8GB', '8GB', 1, 1),
(6, '16GB', '16GB', 2, 1),
(6, '32GB', '32GB', 3, 1),
(6, '64GB', '64GB', 4, 1);

-- 硬盘属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(7, '256GB SSD', '256GB SSD', 1, 1),
(7, '512GB SSD', '512GB SSD', 2, 1),
(7, '1TB SSD', '1TB SSD', 3, 1),
(7, '2TB SSD', '2TB SSD', 4, 1),
(7, '1TB HDD', '1TB HDD', 5, 1);

-- 显卡属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(8, '集成显卡', '集成显卡', 1, 1),
(8, 'NVIDIA GTX 1650', 'NVIDIA GTX 1650', 2, 1),
(8, 'NVIDIA RTX 3060', 'NVIDIA RTX 3060', 3, 1),
(8, 'NVIDIA RTX 3070', 'NVIDIA RTX 3070', 4, 1),
(8, 'AMD Radeon RX 6600', 'AMD Radeon RX 6600', 5, 1);

-- 操作系统属性值
INSERT INTO `product_attribute_values` (`attribute_id`, `value`, `label`, `sort_order`, `status`) VALUES
(9, 'Windows 11', 'Windows 11', 1, 1),
(9, 'Windows 10', 'Windows 10', 2, 1),
(9, 'macOS', 'macOS', 3, 1),
(9, 'Linux', 'Linux', 4, 1),
(9, '无系统', '无预装系统', 5, 1);
