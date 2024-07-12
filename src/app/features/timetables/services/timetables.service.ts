import { map, Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BaseService } from '@core/services/base.service';
import { convertToParams } from '@core/utils/convert-to-params';
import { IPagination, IRequestParameters } from '@core/interfaces';

import {
  ITimetable,
  IGetTimetable,
  ITimetableDto,
  ITimetableRequestParameters,
  ITimetableRequestParametersForGet,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class TimetablesService extends BaseService<
  ITimetable,
  ITimetableDto,
  | ITimetableRequestParameters
  | ITimetableRequestParametersForGet
  | IRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/timetables');
  }

  createTimeTable(
    dto: ITimetableRequestParameters | Partial<ITimetableRequestParameters>
  ): Observable<ITimetable> {
    return this.http.post<ITimetable>(this.endpoint, dto);
  }

  getAllTimetables(
    params?: ITimetableRequestParametersForGet
  ): Observable<{ result: ITimetable[]; pagination: IPagination }> {
    const queryParams = convertToParams(params);
    return this.http
      .get<ITimetable[]>(this.endpoint, {
        params: queryParams,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<ITimetable[]>) => {
          const paginationHeader = JSON.parse(
            response.headers.get('x-pagination')
          ) as IPagination;
          const result = response.body;
          return { result, pagination: paginationHeader };
        })
      );
  }

  getTimetableById(id: string): Observable<IGetTimetable> {
    return this.http.get<IGetTimetable>(`${this.endpoint}/${id}`);
  }

  updateTimeTable(
    body: IGetTimetable | Partial<IGetTimetable>
  ): Observable<IGetTimetable> {
    return this.http.patch<IGetTimetable>(`${this.endpoint}`, body);
  }
}
