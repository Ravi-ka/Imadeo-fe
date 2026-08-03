const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { Workspace } from '@/components/dam/types';

interface FetchOptions extends RequestInit {
  tenantId?: string;
}

async function workspaceFetch<T>(path: string, token: string, opts: FetchOptions): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };

  if (opts.tenantId) {
    headers["X-Tenant-Id"] = opts.tenantId;
  }

  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error || "Request failed"), { status: res.status, data });
  }
  return data as T;
}

export const getWorkspacesApi = async (token: string): Promise<Workspace[]> => {
  const res = await workspaceFetch<any>('/api/workspaces/me', token, {});
  return res.workspaces || res;
};
