/* eslint-disable @typescript-eslint/no-explicit-any */
import { map, Observable } from 'rxjs';
import { environment } from '@environment/environment';

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

import {
  IPagination,
  IResponseBase,
  IRequestParameters,
} from '@core/interfaces';

export class BaseService<T, DtoT> {
  protected endpoint: string;

  constructor(
    protected http: HttpClient,
    resourcePath: string
  ) {
    this.endpoint = environment.apiURL + resourcePath;
  }

  find(
    params?: IRequestParameters
  ): Observable<{ result: IResponseBase<T[]>; pagination: any }> {
    const queryParams = this.convertToParams(params);
    return this.http
      .get<
        IResponseBase<T[]>
      >(this.endpoint, { params: queryParams, observe: 'response' })
      .pipe(
        map((response: HttpResponse<IResponseBase<T[]>>) => {
          const paginationHeader = JSON.parse(
            response.headers.get('x-pagination')
          ) as IPagination;
          const result = response.body;
          return { result, pagination: paginationHeader };
        })
      );
  }

  findById(id: string): Observable<IResponseBase<T>> {
    return this.http.get<IResponseBase<T>>(`${this.endpoint}/${id}`);
  }

  findByIds(ids: string[]): Observable<T[]> {
    return this.http.get<T[]>(`${this.endpoint}/collection(${ids.join(',')})`);
  }

  create(dto: DtoT | Partial<T>): Observable<T> {
    return this.http.post<T>(this.endpoint, dto);
  }

  createCollection(dto: DtoT[] | Partial<T[]>): Observable<T> {
    return this.http.post<T>(`${this.endpoint}/collection`, dto);
  }

  update(id: string, body: DtoT | Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.endpoint}/${id}`, body);
  }

  delete(id: string): Observable<T> {
    return this.http.delete<T>(`${this.endpoint}/${id}`);
  }

  deleteByIds(ids: string[]): Observable<T[]> {
    return this.http.delete<T[]>(
      `${this.endpoint}/collection/(${ids.join(',')})`
    );
  }

  private convertToParams(params: IRequestParameters): HttpParams {
    let queryParams = new HttpParams();
    if (params) {
      if (params.searchTerm) {
        queryParams = queryParams.set('searchTerm', params.searchTerm);
      }
      if (params.pageNumber) {
        queryParams = queryParams.set(
          'pageNumber',
          params.pageNumber.toString()
        );
      }
      if (params.pageSize) {
        queryParams = queryParams.set('pageSize', params.pageSize.toString());
      }
      if (params.fields) {
        queryParams = queryParams.set('fields', params.fields);
      }
      if (params.orderBy) {
        queryParams = queryParams.set('orderBy', params.orderBy);
      }
    }
    return queryParams;
  }
}
