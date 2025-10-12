-- 添加 specifications 字段到 products 表
ALTER TABLE products ADD COLUMN specifications JSON DEFAULT NULL COMMENT '商品规格信息';
