// src/lib/server/users.js

import { db } from '$lib/server/db.js';


export async function getUserProfile(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          user_id,
          role,
          display_name,
          created_at,
          updated_at
        FROM user_profiles
        WHERE user_id = $1
      `,
      [
        userId
      ]
    );

  if (result.rowCount === 0) {
    return null;
  }

  return mapProfileRow(
    result.rows[0]
  );
}


export async function createUserProfile({
  userId,
  role = 'student',
  displayName = null
}) {
  validateRole(role);

  const result =
    await db.query(
      `
        INSERT INTO user_profiles (
          user_id,
          role,
          display_name
        )
        VALUES (
          $1,
          $2,
          $3
        )
        RETURNING
          user_id,
          role,
          display_name,
          created_at,
          updated_at
      `,
      [
        userId,
        role,
        displayName
      ]
    );

  return mapProfileRow(
    result.rows[0]
  );
}


function validateRole(role) {
  if (
    role !== 'admin' &&
    role !== 'student'
  ) {
    throw new Error(
      `Invalid user role: ${role}`
    );
  }
}


function mapProfileRow(row) {
  return {
    userId:
      row.user_id,

    role:
      row.role,

    displayName:
      row.display_name,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at
  };
}