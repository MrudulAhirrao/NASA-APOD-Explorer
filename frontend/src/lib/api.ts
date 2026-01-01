import axios from 'axios';


const api = axios.create({
  baseURL: 'https://upgraded-space-fortnight-499v7wgg7rv2qq9q-8080.app.github.dev/api/v1', 
});

export interface ApodResponse {
  date: string;
  explanation: string;
  hdurl?: string;
  hdUrl?: string; // Handle both cases
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