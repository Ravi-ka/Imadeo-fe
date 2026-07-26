const NGROK_BASE_URL = 'https://unfrosted-secret-barista.ngrok-free.dev';

export interface GetImadeoIdResponse {
  imadeoId?: string | null;
  imadeo_id?: string | null;
  data?: {
    imadeoId?: string | null;
    imadeo_id?: string | null;
  };
  [key: string]: any;
}

export interface CreateImadeoIdResponse {
  success?: boolean;
  message?: string;
  imadeoId?: string;
  imadeo_id?: string;
  [key: string]: any;
}

/**
 * Fetch the user's permanent Imadeo ID status from the backend DB.
 * Uses no-cache headers to guarantee fresh backend responses.
 */
export async function getImadeoIdApi(token?: string | null): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${NGROK_BASE_URL}/api/dashboard/get-imadeo-id`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorJson.error || errorMsg;
      } catch (e) {
        // use raw text if available
      }
      throw new Error(errorMsg);
    }

    const data: GetImadeoIdResponse = await response.json();
    
    // Check all possible return locations for imadeoId from API response
    const rawId = 
      data?.imadeoId ?? 
      data?.imadeo_id ?? 
      data?.data?.imadeoId ?? 
      data?.data?.imadeo_id;

    if (rawId && typeof rawId === 'string' && rawId.trim() !== '' && rawId !== 'null' && rawId !== 'undefined') {
      return rawId.trim();
    }

    return null;
  } catch (error: any) {
    console.error('Failed to fetch Imadeo ID from backend DB:', error);
    throw error;
  }
}

/**
 * Create the user's permanent Imadeo ID in the database.
 */
export async function createImadeoIdApi(imadeoId: string, token?: string | null): Promise<CreateImadeoIdResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${NGROK_BASE_URL}/api/dashboard/create-imadeo-id`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ imadeo_id: imadeoId }),
    });

    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: responseText };
    }

    if (!response.ok) {
      const errorMessage =
        data.message ||
        data.error ||
        data.detail ||
        (response.status === 409
          ? `The Imadeo ID "${imadeoId}" is already taken. Please choose another.`
          : response.status === 400
          ? `Invalid Imadeo ID. Please use 3-30 characters (letters, numbers, underscores).`
          : `Failed to create Imadeo ID (${response.status})`);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('Failed to create Imadeo ID in backend DB:', error);
    throw error;
  }
}
