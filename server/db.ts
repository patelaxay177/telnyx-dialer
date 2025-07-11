import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, calls, contacts } from "@shared/schema";

let db: ReturnType<typeof drizzle>;

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for MySQL connection");
  }

  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    db = drizzle(connection);
    
    console.log("✅ MySQL database connection established");
    return db;
  } catch (error) {
    console.error("❌ Failed to connect to MySQL database:", error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}

export { db };