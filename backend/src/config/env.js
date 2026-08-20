import "dotenv/config";

const required = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "DATABASE_URL",
  "SMTP_USER",
  "SMTP_PASS",
  "GOOGLE_CLIENT_ID",
];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

export const env = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  databaseUrl: process.env.DATABASE_URL,

  // Redis Configuration
  redisUrl: process.env.REDIS_URL,
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  redisDb: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,

  // Socket.IO Configuration
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
  socketPath: process.env.SOCKET_PATH || "/socket.io",
};
