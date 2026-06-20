const DEFAULT_API_URL = 'http://localhost:3001';

export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bmf_api_url') || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
};

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${getApiUrl()}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bmf_admin_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi server (mã: ${response.status})`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
