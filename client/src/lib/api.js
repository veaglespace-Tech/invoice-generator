export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
export async function fetchApi(endpoint, options = {}) {
  const { data, headers, ...customConfig } = options;

  // Assume token is in localStorage if auth was implemented.
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }
  const config = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}),
      ...headers
    },
    ...customConfig
  };
  if (data) {
    config.body = JSON.stringify(data);
  }
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('Fetching:', fullUrl, config.method);
    const response = await fetch(fullUrl, config);
    const contentType = response.headers.get('content-type') || '';
    let result = null;
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { message: text && text.length < 200 ? text : `Server returned status ${response.status} (${response.statusText || 'Error'})` };
    }

    if (!response.ok) {
      let errorMessage = result?.message || `Request failed with status ${response.status}`;
      if (result?.message === 'Validation Error' && Array.isArray(result.errors) && result.errors.length > 0) {
        const firstError = result.errors[0];
        errorMessage = typeof firstError === 'object' && firstError.message ? firstError.message : String(firstError);
      } else if (!result?.message && Array.isArray(result?.errors) && result.errors.length > 0) {
        const firstError = result.errors[0];
        errorMessage = typeof firstError === 'object' && firstError.message ? firstError.message : String(firstError);
      }
      throw new Error(errorMessage);
    }
    return result;
  } catch (error) {
    // Use warn instead of error to prevent Next.js dev overlay from popping up on caught errors
    console.warn('API Warning:', error);
    throw error;
  }
}
