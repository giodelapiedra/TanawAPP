/**
 * Shared shape helpers for User-returning services.
 *
 * - `USER_INCLUDE`: canonical Prisma `include` for the user profile payload
 *   we ship to clients (auth + users endpoints).
 * - `stripPassword`: remove `passwordHash` from a DB row before returning it.
 *
 * Keeping these in one place guarantees auth.service and users.service always
 * return the same user shape — no accidental drift between login and getMe.
 */

export const USER_INCLUDE = { address: true, barangay: true } as const;

export function stripPassword<T extends { passwordHash: string }>(
  user: T
): Omit<T, 'passwordHash'> {
  const { passwordHash: _omit, ...safe } = user;
  return safe;
}
