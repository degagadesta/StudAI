import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
import pkg from "pg";
const { Pool } = pkg;

// Create connection pool with increased timeout settings
const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 30000,
  query_timeout: 30000,
  statement_timeout: 30000,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 60000, // 1 minute
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database connection error:', err);
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

// Middleware to handle connection errors
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    // Check for connection and timeout errors
    if (
      error.code === 'P1001' || // Can't reach database
      error.code === 'P1002' || // Database timeout
      error.code === 'P2024' || // Timed out fetching
      error.message?.includes('timed out') ||
      error.message?.includes('connection') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED'
    ) {
      const networkError = new Error("Unable to connect to the database. Please check your connection and try again");
      networkError.code = 'NETWORK_ERROR';
      networkError.statusCode = 503;
      throw networkError;
    }

    // Re-throw original error if not a network issue
    throw error;
  }
});

export { prisma };
export default prisma;
