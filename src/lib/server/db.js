// src/lib/server/db.js

import pg from 'pg';
import { env } from '$env/dynamic/private';

const { Pool } = pg;

const globalForDatabase = globalThis;

export const db =
  globalForDatabase.__mockTestDatabasePool ??
  new Pool({
    connectionString:
      env.DATABASE_URL
  });

if (!globalForDatabase.__mockTestDatabasePool) {
  globalForDatabase.__mockTestDatabasePool =
    db;
}

db.on('error', (error) => {
  console.error(
    'Unexpected PostgreSQL pool error:',
    error
  );
});