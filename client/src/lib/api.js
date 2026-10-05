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
    const result = await response.json();
    if (!response.ok) {
      let errorMessage = result.message || 'API Request failed';
      if (result.errors) {
        if (Array.isArray(result.errors)) {
          const detailedErrors = result.errors
            .map((e) => {
              if (typeof e === 'object' && e.message) {
                return e.path ? `${e.path}: ${e.message}` : e.message;
              }
              return String(e);
            })
            .join(', ');
          if (detailedErrors) {
            errorMessage += ': ' + detailedErrors;
          }
        } else {
          errorMessage += ': ' + JSON.stringify(result.errors);
        }
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
