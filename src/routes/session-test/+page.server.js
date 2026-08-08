// src/routes/session-test/+page.server.js
export function load({
  locals
}) {
  return {
    user:
      locals.user,

    session:
      locals.session,

    profile:
      locals.profile
  };
}