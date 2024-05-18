import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IResponseBase } from '@core/interfaces';
import { BaseService } from '@core/services/base.service';

import { ISubject, ISubjectDto } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SubjectService extends BaseService<ISubject, ISubjectDto> {
  constructor(protected override http: HttpClient) {
    super(http, '/subjects');
  }

  getUnassignedSubjectsByClassId(
    id: string
  ): Observable<IResponseBase<ISubject[]>> {
    return this.http.get<IResponseBase<ISubject[]>>(
      `${this.endpoint}/unassigned-by-class`,
      { params: { classId: id } }
    );
  }

  getAssignedSubjectsByClassId(
    id: string
  ): Observable<IResponseBase<ISubject[]>> {
    return this.http.get<IResponseBase<ISubject[]>>(
      `${this.endpoint}/assigned-by-class`,
      { params: { classId: id } }
    );
  }
}
