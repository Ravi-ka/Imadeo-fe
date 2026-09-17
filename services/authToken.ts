import type { useAuth } from '@clerk/nextjs';

type GetToken = ReturnType<typeof useAuth>['getToken'];

const DEFAULT_JWT_TEMPLATE = 'jwt-imadeo-dev';

function getJwtTemplate(): string {
  return process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim() || DEFAULT_JWT_TEMPLATE;
}

/**
 * Token used for Imadeo backend requests.
 * Prefers the Clerk JWT template the API is configured for, then the session token.
 */
export async function getApiToken(getToken: GetToken): Promise<string> {
  const template = getJwtTemplate();
  const templated = await getToken({ template });
  if (templated) return templated;

  const sessionToken = await getToken();
  if (sessionToken) return sessionToken;

  throw new Error('Not authenticated');
}
