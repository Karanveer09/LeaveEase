const API_BASE_URL = 'http://localhost:3001/api';

export const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (method === 'GET') {
    config.cache = 'no-store';
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return await response.json();
};
