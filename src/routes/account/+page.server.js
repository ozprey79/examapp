// src/routes/account/+page.server.js

import {
  redirect
} from '@sveltejs/kit';


export function load({
  locals
}) {
  if (!locals.user) {
    redirect(
      303,
      '/sign-in'
    );
  }

  if (
    locals.profile?.role ===
      'admin'
  ) {
    redirect(
      303,
      '/admin'
    );
  }

  if (
    locals.profile?.role ===
      'student'
  ) {
    redirect(
      303,
      '/student'
    );
  }

  redirect(
    303,
    '/sign-in'
  );
}