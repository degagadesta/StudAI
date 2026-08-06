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

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn'],
});

export default prisma;
