// src/hooks.server.js

import {
  building
} from '$app/environment';

import {
  svelteKitHandler
} from 'better-auth/svelte-kit';

import {
  auth
} from '$lib/server/auth.js';

import {
  getUserProfile
} from '$lib/server/users.js';


export async function handle({
  event,
  resolve
}) {
  const authSession =
    await auth.api.getSession({
      headers:
        event.request.headers
    });

  if (authSession) {
    event.locals.user =
      authSession.user;

    event.locals.session =
      authSession.session;

    event.locals.profile =
      await getUserProfile(
        authSession.user.id
      );
  } else {
    event.locals.user =
      null;

    event.locals.session =
      null;

    event.locals.profile =
      null;
  }

  return svelteKitHandler({
    event,
    resolve,
    auth,
    building
  });
}