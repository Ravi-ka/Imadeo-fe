import type { useAuth } from '@clerk/nextjs';

type GetToken = ReturnType<typeof useAuth>['getToken'];

const DEV_FALLBACK_JWT_TEMPLATE = 'jwt-imadeo-dev';

function getJwtTemplate(): string {
  const configured = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_CLERK_JWT_TEMPLATE is required in production. Set it in your Vercel environment variables.'
    );
  }

  return DEV_FALLBACK_JWT_TEMPLATE;
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
