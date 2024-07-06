/* eslint-disable @typescript-eslint/no-explicit-any */
import { map, Observable } from 'rxjs';
import { environment } from '@environment/environment';

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { convertToParams } from '@core/utils/convert-to-params';
import {
  IPagination,
  IResponseBase,
  IRequestParameters,
} from '@core/interfaces';

import { IYear } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class YearService {
  private apiURL = environment.apiURL;

  private endpoint: string;

  constructor(private http: HttpClient) {
    this.endpoint = this.apiURL + '/years';
  }

  getYears(
    params?: IRequestParameters
  ): Observable<{ result: IResponseBase<IYear[]>; pagination: any }> {
    const queryParams = convertToParams(params);
    return this.http
      .get<
        IResponseBase<IYear[]>
      >(this.endpoint, { params: queryParams, observe: 'response' })
      .pipe(
        map((response: HttpResponse<IResponseBase<IYear[]>>) => {
          const paginationHeader = JSON.parse(
            response.headers.get('x-pagination')
          ) as IPagination;
          const result = response.body;
          return { result, pagination: paginationHeader };
        })
      );
  }
}
