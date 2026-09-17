const DEV_FALLBACK_API_URL = 'http://localhost:8000';

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL is required in production. Set it in your Vercel environment variables.'
    );
  }

  return DEV_FALLBACK_API_URL;
}

export const API_BASE_URL = getApiBaseUrl();
