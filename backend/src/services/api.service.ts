import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import ApiTokenService from './api-token.service';
import { HttpException } from '@/exceptions/HttpException';
import { apiURL } from '@/utils/util';

class ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

function getSuccessStatusMessage(status: number) {
  switch (status) {
    case 200:
      return 'success';
    case 204:
      return 'success_nocontent';
    default:
      return 'unknown';
  }
}

class ApiService {
  private apiTokenService = new ApiTokenService();
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const token = await this.apiTokenService.getToken();

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const defaultParams = {};

    const preparedConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...defaultHeaders, ...config.headers },
      params: { ...defaultParams, ...config.params },
      url: apiURL(config.url),
    };

    try {
      const res = await axios(preparedConfig);
      return { data: res.data, status: res.status, message: getSuccessStatusMessage(res.status) };
    } catch (error: unknown | AxiosError) {
      if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 404) {
        throw new HttpException(404, 'Not found from API');
      }
      // NOTE: did you subscribe to the API called?
      throw new HttpException(500, 'Internal server error from gateway');
    }
  }

  public async get<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET' });
  }

  public async post<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST' });
  }

  public async patch<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH' });
  }

  public async put<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT' });
  }

  public async delete<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' });
  }
}

export default ApiService;
