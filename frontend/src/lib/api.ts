import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://upgraded-space-fortnight-499v7wgg7rv2qq9q-8080.app.github.dev/api/v1';

const api = axios.create({
  baseURL: BACKEND_URL,
});

export interface ApodResponse {
  date: string;
  explanation: string;
  hdurl?: string;
  hdUrl?: string; 
  title: string;
  url: string;
  media_type: string;
  copyright?: string;
}

export const getApod = async (date?: string) => {
  const params = date ? { date } : {};
  const response = await api.get<ApodResponse>('/apod', { params });
  return response.data;
};

export const getRecentApods = async () => {
  const response = await api.get<ApodResponse[]>('/apod/range');
  return response.data;
};

export const getApodRange = async (startDate: string, endDate: string) => {
  const params = { 
    start_date: startDate, 
    end_date: endDate 
  };
  const response = await api.get<ApodResponse[]>('/apod/range', { params });
  return response.data;
};
export const getProxyDownloadUrl = (originalUrl: string) => {
  const baseUrl = BACKEND_URL.endsWith('/api/v1') 
    ? BACKEND_URL 
    : `${BACKEND_URL}/api/v1`;
    
  return `${baseUrl}/apod/download?url=${encodeURIComponent(originalUrl)}`;
};