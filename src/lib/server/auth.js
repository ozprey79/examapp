// src/lib/server/auth.js

import { betterAuth } from 'better-auth';

import { db } from '$lib/server/db.js';

import {
  createUserProfile
} from '$lib/server/users.js';


export const auth = betterAuth({
  database: db,

  emailAndPassword: {
    enabled: true,
    disableSignUp: false
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createUserProfile({
            userId: user.id,
            role: 'student',
            displayName:
              user.name ?? null
          });
        }
      }
    }
  }
});