import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { map } from 'rxjs/operators';
import {
  fromCamel,
  fromCamelObj,
  toCamelObj,
} from 'src/app/shared/utils/camel';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  public get(path: string, params?: any, headers?: any): Observable<any> {
    return this.http
      .get<ApiResponse>(`${environment.api_url}${path}`, {
        params,
        headers,
      })
      .pipe(map((data) => toCamelObj(data)));
  }

  public getBlob(
    path: string,
    fileType: string = 'application/pdf'
  ): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', fileType);

    return this.http.get<ApiResponse>(`${environment.api_url}${path}`, {
      headers,
      responseType: 'blob' as 'json',
    });
  }

  public post(path: string, params?: any): Observable<any> {
    const requestParams = { ...fromCamelObj(params) };

    return this.http
      .post<ApiResponse>(`${environment.api_url}${path}`, requestParams)
      .pipe(map((data) => toCamelObj(data)));
  }

  public postFormData(path: string, data: any): Observable<any> {
    const formData = new FormData();

    this.buildFormData(formData, data);

    return this.http
      .post<ApiResponse>(`${environment.api_url}${path}`, formData)
      .pipe(map((d) => toCamelObj(d)));
  }

  public postBlob(
    path: string,
    params: any,
    fileType: string = 'application/pdf'
  ): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', fileType);

    return this.http.post<ApiResponse>(
      `${environment.api_url}${path}`,
      params,
      {
        headers,
        responseType: 'blob' as 'json',
      }
    );
  }

  protected buildFormData(formData: FormData, data: any, parentKey?: any) {
    Object.keys(data).forEach((key: any) => {
      if (data[key] && Array.isArray(data[key])) {
        data[key].forEach((obj: any, index: number) => {
          this.buildFormData(formData, obj, `${key}[${index}]`);
        });
      } else {
        formData.append(
          fromCamel(parentKey ? `${parentKey}[${key}]` : key),
          data[key]
        );
      }
    });
  }

  public put(path: string, params?: any): Observable<any> {
    const requestParams = { ...fromCamelObj(params) };

    return this.http
      .put<ApiResponse>(`${environment.api_url}${path}`, requestParams)
      .pipe(map((data) => toCamelObj(data)));
  }

  public patch(path: string, params?: any): Observable<any> {
    const requestParams = { ...fromCamelObj(params) };

    return this.http
      .patch<ApiResponse>(`${environment.api_url}${path}`, requestParams)
      .pipe(map((data) => toCamelObj(data)));
  }

  public delete(path: string, params?: any): Observable<any> {
    const requestParams = { ...fromCamelObj(params) };

    return this.http.delete<ApiResponse>(`${environment.api_url}${path}`, {
      body: requestParams,
    }).pipe(map((data) => toCamelObj(data)));;
  }

  public getSocket(
    orderId: string,
    params?: any,
    headers?: any
  ): Observable<any> {
    return this.http
      .get<ApiResponse>(
        `https://api.mediapoint.tallium.com/socket?order_id=${orderId}`,
        {
          params,
          headers,
        }
      )
      .pipe(map((data) => toCamelObj(data)));
  }
}
