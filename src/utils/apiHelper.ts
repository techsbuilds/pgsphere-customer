import { API_BASE_URL } from '../config/api';

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  const pgcode = localStorage.getItem('pgcode');
  
  return { token, userId, userType, pgcode };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Make an authenticated API request
 * Automatically adds token as cookie
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  // Set token as cookie
  document.cookie = `pgtoken=${token}; path=/`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies in the request
  });
};

/**
 * Make an authenticated GET request
 */
export const authenticatedGet = async (endpoint: string): Promise<any> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'GET',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

/**
 * Make an authenticated POST request
 */
export const authenticatedPost = async (
  endpoint: string,
  body: any
): Promise<any> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

/**
 * Make an authenticated PUT request
 */
export const authenticatedPut = async (
  endpoint: string,
  body: any
): Promise<any> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

/**
 * Make an authenticated DELETE request
 */
export const authenticatedDelete = async (endpoint: string): Promise<any> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

/**
 * Make an authenticated request with FormData (for file uploads)
 */
export const authenticatedFormData = async (
  endpoint: string,
  formData: FormData
): Promise<any> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  // Set token as cookie
  document.cookie = `pgtoken=${token}; path=/`;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      // Don't set Content-Type for FormData - browser will set it automatically with boundary
    },
    body: formData,
    credentials: 'include', // Include cookies in the request
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};
