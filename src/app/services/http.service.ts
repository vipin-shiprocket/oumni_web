import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

type Tparam = string | number | boolean;
type Theader = string | number | (string | number)[];

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) {}

  getQueryParam(paramsObj: Record<string, Tparam>): HttpParams {
    let params = new HttpParams();
    for (const key in paramsObj) {
      params = params.set(key, paramsObj[key]);
    }
    return params;
  }

  getHeaders(newHeaders?: Record<string, Theader>): HttpHeaders {
    let headers;
    if (newHeaders) {
      headers = new HttpHeaders(newHeaders);
    } else {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });
    }

    return headers;
  }

  requestToEndpoint<T>(endpoint: string, params = {}) {
    params = this.getQueryParam(params);
    const url = `${window.location.origin}/api/auth${endpoint}`;
    return this.httpClient.get(url, { params }) as Observable<T>;
  }

  postToEndpint<T>(
    endpoint: string,
    body: unknown,
    params = {},
    headers?: HttpHeaders,
  ) {
    const url = `${window.location.origin}/api/auth${endpoint}`;
    params = this.getQueryParam(params);
    return this.httpClient.post(url, body, {
      params,
      headers,
    }) as Observable<T>;
  }

  deleteRequest<T>(endpoint: string) {
    const url = `${window.location.origin}/api/auth${endpoint}`;
    return this.httpClient.delete(url) as Observable<T>;
  }

  requestByUrl<T>(url: string, params = {}) {
    params = this.getQueryParam(params);
    return this.httpClient.get(url, { params }) as Observable<T>;
  }

  postByUrl<T>(url: string, body: unknown, params = {}, headers?: HttpHeaders) {
    params = this.getQueryParam(params);
    return this.httpClient.post(url, body, {
      params,
      headers,
    }) as Observable<T>;
  }
}
