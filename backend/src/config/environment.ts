// Backend Environment Configuration
export interface BackendConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  REDIS_URL: string;
  CORS_ORIGIN: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  AUTH_RATE_LIMIT_MAX: number;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  REQUEST_TIMEOUT: number;
  RESPONSE_TIMEOUT: number;
  UPLOAD_PATH: string;
  ENABLE_PROJECT_STATS: boolean;
  ENABLE_PROJECT_EXPORT: boolean;
  ENABLE_PROJECT_SHARING: boolean;
  TRUST_PROXY: boolean;
  DEBUG_MODE: boolean;
  AZURE_TENANT_ID?: string;
  AZURE_CLIENT_ID?: string;
  AZURE_CLIENT_SECRET?: string;
  AZURE_REFRESH_TOKEN?: string;
}

// Development Environment
const developmentConfig: BackendConfig = {
  NODE_ENV: 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://minicde_user:minicde_password@localhost:5432/minicde',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_key_2024',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CORS_ORIGIN: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost',
    'http://127.0.0.1'
  ],
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 1000,
  AUTH_RATE_LIMIT_MAX: 200,
  MAX_FILE_SIZE: 104857600, // 100MB
  ALLOWED_FILE_TYPES: ['pdf', 'dwg', 'rvt', 'ifc', 'docx', 'xlsx', 'jpg', 'png'],
  REQUEST_TIMEOUT: 30000,
  RESPONSE_TIMEOUT: 30000,
  UPLOAD_PATH: './uploads',
  ENABLE_PROJECT_STATS: true,
  ENABLE_PROJECT_EXPORT: true,
  ENABLE_PROJECT_SHARING: true,
  TRUST_PROXY: false,
  DEBUG_MODE: true,
  AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
  AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
  AZURE_REFRESH_TOKEN: process.env.AZURE_REFRESH_TOKEN,
};

// Production Environment (Heroku)
const productionConfig: BackendConfig = {
  NODE_ENV: 'production',
  PORT: parseInt(process.env.PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'minicde_jwt_secret_2024_secure_production_key',
  REDIS_URL: process.env.REDIS_URL || '',
  CORS_ORIGIN: [
    'https://minicde-production-589be4b0d52b.herokuapp.com',
    'https://minicde-production-589be4b0d52b.herokuapp.com/api',
    'https://minicde-frontend-833302d6ab3c.herokuapp.com',
    'https://qlda.hoanglong24.com',
    'https://*.herokuapp.com',
    'https://*.vercel.app',
    'https://*.netlify.app',
    'https://*.railway.app',
    // Allow all origins for production to fix CORS issues
    '*'
  ],
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 1000,
  AUTH_RATE_LIMIT_MAX: 200, // Increased from 50 to 200 for better user experience
  MAX_FILE_SIZE: 104857600, // 100MB
  ALLOWED_FILE_TYPES: ['pdf', 'dwg', 'rvt', 'ifc', 'docx', 'xlsx', 'jpg', 'png'],
  REQUEST_TIMEOUT: 30000,
  RESPONSE_TIMEOUT: 30000,
  UPLOAD_PATH: '/app/uploads',
  ENABLE_PROJECT_STATS: true,
  ENABLE_PROJECT_EXPORT: true,
  ENABLE_PROJECT_SHARING: true,
  TRUST_PROXY: true,
  DEBUG_MODE: false,
  AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
  AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
  AZURE_REFRESH_TOKEN: process.env.AZURE_REFRESH_TOKEN,
};

// Local Production Environment (Docker)
const localProductionConfig: BackendConfig = {
  NODE_ENV: 'production',
  PORT: parseInt(process.env.PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://minicde_user:minicde_password@postgres:5432/minicde',
  JWT_SECRET: process.env.JWT_SECRET || 'minicde_jwt_secret_2024_secure_production_key',
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
  CORS_ORIGIN: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost',
    'http://127.0.0.1'
  ],
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 1000,
  AUTH_RATE_LIMIT_MAX: 200, // Increased from 50 to 200 for better user experience
  MAX_FILE_SIZE: 104857600, // 100MB
  ALLOWED_FILE_TYPES: ['pdf', 'dwg', 'rvt', 'ifc', 'docx', 'xlsx', 'jpg', 'png'],
  REQUEST_TIMEOUT: 30000,
  RESPONSE_TIMEOUT: 30000,
  UPLOAD_PATH: '/app/uploads',
  ENABLE_PROJECT_STATS: true,
  ENABLE_PROJECT_EXPORT: true,
  ENABLE_PROJECT_SHARING: true,
  TRUST_PROXY: false,
  DEBUG_MODE: false,
  AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
  AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
  AZURE_REFRESH_TOKEN: process.env.AZURE_REFRESH_TOKEN,
};

// Shared Hosting Environment (tenten)
const sharedHostingConfig: BackendConfig = {
  NODE_ENV: 'production',
  PORT: parseInt(process.env.PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'minicde_jwt_secret_2024_secure_shared_hosting_key',
  REDIS_URL: process.env.REDIS_URL || '', // Có thể không có Redis trên shared hosting
  CORS_ORIGIN: [
    'https://qlda.hoanglong24.com',
    'https://www.qlda.hoanglong24.com',
    'http://localhost:3000',
    'http://localhost:3001',
    // Allow all origins for shared hosting to fix CORS issues
    '*'
  ],
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 500, // Giảm xuống cho shared hosting
  AUTH_RATE_LIMIT_MAX: 100, // Giảm xuống cho shared hosting
  MAX_FILE_SIZE: 52428800, // 50MB - giảm xuống cho shared hosting
  ALLOWED_FILE_TYPES: ['pdf', 'dwg', 'rvt', 'ifc', 'docx', 'xlsx', 'jpg', 'png'],
  REQUEST_TIMEOUT: 30000,
  RESPONSE_TIMEOUT: 30000,
  UPLOAD_PATH: './uploads', // Đường dẫn tương đối cho shared hosting
  ENABLE_PROJECT_STATS: true,
  ENABLE_PROJECT_EXPORT: true,
  ENABLE_PROJECT_SHARING: true,
  TRUST_PROXY: false, // Tắt cho shared hosting
  DEBUG_MODE: false,
  AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
  AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
  AZURE_REFRESH_TOKEN: process.env.AZURE_REFRESH_TOKEN,
};

// Environment detection
export const getEnvironment = (): string => {
  const nodeEnv = process.env.NODE_ENV;
  const hostname = process.env.HOSTNAME || '';
  const port = process.env.PORT;
  
  // Check for shared hosting environment
  if (process.env.SHARED_HOSTING === 'true' || hostname.includes('tenten') || hostname.includes('shared')) {
    return 'shared-hosting';
  }
  
  // Check for Heroku environment
  if (process.env.DYNO || hostname.includes('herokuapp.com')) {
    return 'heroku';
  }
  
  // Check for local development
  if (nodeEnv === 'development' || port === '3001') {
    return 'development';
  }
  
  // Default to production
  return 'production';
};

// Get configuration based on environment
export const getConfig = (): BackendConfig => {
  const env = getEnvironment();
  
  switch (env) {
    case 'shared-hosting':
      return sharedHostingConfig;
    case 'heroku':
      return productionConfig;
    case 'development':
      return developmentConfig;
    case 'local-production':
      return localProductionConfig;
    default:
      return productionConfig;
  }
};

// Export current configuration
export const backendConfig = getConfig();

// Environment info for debugging
export const backendEnvironmentInfo = {
  current: process.env.NODE_ENV || 'development',
  config: backendConfig,
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL ? '***hidden***' : 'not set',
  redisUrl: process.env.REDIS_URL ? '***hidden***' : 'not set',
};

// Log environment info in development
if (backendConfig.DEBUG_MODE) {
  } 