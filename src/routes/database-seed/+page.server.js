// src/routes/database-seed/+page.server.js

import questionBank from '$lib/data/questions.json';
import { seedTest } from '$lib/server/seedTest.js';

export async function load() {
  try {
    const result =
      await seedTest(
        questionBank
      );

    return {
      success: true,
      result
    };
  } catch (error) {
    console.error(
      'Database seed failed:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown database seed error.'
    };
  }
}