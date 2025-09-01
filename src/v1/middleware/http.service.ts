import { AnyObject } from '@/v1/models/any.types';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpService {
  async request<T = any>(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await axios(config);
      return response;
    } catch (error: any) {
      const message =
        error?.response?.data || error.message || 'HTTP request failed';
      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(message, status);
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>({ method: 'GET', url, ...config });
    return response.data;
  }

  async post<T = AnyObject>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
    return response.data;
  }

  async put<T = any>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
    return response.data;
  }
}
