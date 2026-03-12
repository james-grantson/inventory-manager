import { useOrganization } from '@/contexts/OrganizationContext';
import { getAuthToken } from './auth';

export const useApi = () => {
  const { currentOrganization } = useOrganization();

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (currentOrganization) {
      headers.set('X-Organization-ID', currentOrganization.id);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, { 
      ...options, 
      headers 
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login or refresh token
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      if (response.status === 403) {
        // User not allowed – maybe show a message
        throw new Error('Access denied');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Request failed');
    }
    return response;
  };

  return { apiFetch };
};