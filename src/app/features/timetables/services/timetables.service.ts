import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseService } from '@core/services/base.service';

import {
  ITimetable,
  ITimetableDto,
  ITimetableRequestParameters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class TimetablesService extends BaseService<
  ITimetable,
  ITimetableDto,
  ITimetableRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/timetables');
  }

  createTimeTable(
    dto: ITimetableRequestParameters | Partial<ITimetableRequestParameters>
  ): Observable<ITimetable> {
    return this.http.post<ITimetable>(this.endpoint, dto);
  }
}
