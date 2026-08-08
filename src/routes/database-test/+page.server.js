// src/routes/database-test/+page.server.js

import { db } from '$lib/server/db.js';

export async function load() {
  try {
    const result = await db.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        NOW() AS database_time
    `);

    return {
      connected: true,
      connection: result.rows[0]
    };
  } catch (error) {
    console.error(
      'Database connection test failed:',
      error
    );

    return {
      connected: false,
      error:
        'Could not connect to PostgreSQL.'
    };
  }
}