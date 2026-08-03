import "dotenv/config";

const required = [
  "JWT_SECRET",
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
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  databaseUrl: process.env.DATABASE_URL,
};
