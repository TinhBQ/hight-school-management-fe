import { map, Observable } from 'rxjs';
import { environment } from '@environment/environment';

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

import { IPagination, IResponseBase } from '@core/interfaces';

import {
  ISubjectClass,
  ISubjectsForClassRequestParameters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SubjectsForClassService {
  private endpoint: string = environment.apiURL + '/subjects-for-class';

  constructor(private http: HttpClient) {}

  findByClassId(params: ISubjectsForClassRequestParameters): Observable<{
    result: IResponseBase<ISubjectClass[]>;
    pagination: IPagination;
  }> {
    const queryParams = this.convertToParams(params);
    return this.http
      .get<
        IResponseBase<ISubjectClass[]>
      >(this.endpoint, { params: queryParams, observe: 'response' })
      .pipe(
        map((response: HttpResponse<IResponseBase<ISubjectClass[]>>) => {
          const paginationHeader = JSON.parse(
            response.headers.get('x-pagination')
          ) as IPagination;
          const result = response.body;
          return { result, pagination: paginationHeader };
        })
      );
  }

  private convertToParams(
    params: ISubjectsForClassRequestParameters
  ): HttpParams {
    let queryParams = new HttpParams();
    if (params) {
      if (params.classId) {
        queryParams = queryParams.set('classId', params.classId);
      }
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
