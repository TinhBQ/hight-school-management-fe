import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseService } from '@core/services/base.service';
import { IResponseBase, IRequestParameters } from '@core/interfaces';

import { ISubject, ISubjectDto } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SubjectService extends BaseService<
  ISubject,
  ISubjectDto,
  IRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/subjects');
  }

  getUnassignedSubjectsByClassId(
    classId: string
  ): Observable<IResponseBase<ISubject[]>> {
    return this.http.get<IResponseBase<ISubject[]>>(
      `${this.endpoint}/unassigned-by-class`,
      { params: { classId } }
    );
  }

  getAssignedSubjectsByClassId(
    classId: string
  ): Observable<IResponseBase<ISubject[]>> {
    return this.http.get<IResponseBase<ISubject[]>>(
      `${this.endpoint}/assigned-by-class`,
      { params: { classId } }
    );
  }

  getUnassignedSubjectsByTeacherId(
    teacherId: string
  ): Observable<IResponseBase<ISubject[]>> {
    return this.http.get<IResponseBase<ISubject[]>>(
      `${this.endpoint}/unassigned-by-teacher`,
      { params: { teacherId } }
    );
  }

  getAssignedSubjectsByTeacherId(
    teacherId: string
  ): Observable<IResponseBase<ISubject[]>> {
    return this.http.get<IResponseBase<ISubject[]>>(
      `${this.endpoint}/assigned-by-teacher`,
      { params: { teacherId } }
    );
  }
}
