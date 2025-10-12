// 环境配置示例文件
module.exports = {
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agent_mall',
    port: process.env.DB_PORT || 3306
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // 文件上传配置
  upload: {
    path: process.env.UPLOAD_PATH || './public/uploads',
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880 // 5MB
  }
};
