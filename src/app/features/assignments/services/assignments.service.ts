import { Observable } from 'rxjs';
import { IClass } from '@features/classes/interfaces';
import { ITeacher } from '@features/teachers/interfaces';
import { ISubject } from '@features/subjects/interfaces';
import { ISubjectForCreateTimeTableWithGeneral } from '@features/subjects/interfaces/i-subject';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseService } from '@core/services/base.service';
import { convertToParams } from '@core/utils/convert-to-params';
import { IResponseBase, IRequestParameters } from '@core/interfaces';

import {
  IAssignment,
  IAssignmentDto,
  IAssignmentRequestParameters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AssignmentsService extends BaseService<
  IAssignment,
  IAssignmentDto,
  IRequestParameters | IAssignmentRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/assignments');
  }

  getAllAssignments(
    params?: IAssignmentRequestParameters
  ): Observable<IResponseBase<IAssignment[]>> {
    const queryParams = convertToParams(params);
    return this.http.get<IResponseBase<IAssignment[]>>(`${this.endpoint}/all`, {
      params: queryParams,
    });
  }

  getTeachers(
    params?: IAssignmentRequestParameters
  ): Observable<IResponseBase<ITeacher[]>> {
    const queryParams = convertToParams(params);
    return this.http.get<IResponseBase<ITeacher[]>>(
      `${this.endpoint}/teacher`,
      {
        params: queryParams,
      }
    );
  }

  getClasses(
    params?: IAssignmentRequestParameters
  ): Observable<IResponseBase<IClass[]>> {
    const queryParams = convertToParams(params);
    return this.http.get<IResponseBase<IClass[]>>(`${this.endpoint}/class`, {
      params: queryParams,
    });
  }

  getSubjects(
    params?: IAssignmentRequestParameters
  ): Observable<IResponseBase<ISubject[]>> {
    const queryParams = convertToParams(params);
    return this.http.get<IResponseBase<ISubject[]>>(
      `${this.endpoint}/subject`,
      {
        params: queryParams,
      }
    );
  }

  getSubjectsNotSameTeacher(
    params?: IAssignmentRequestParameters
  ): Observable<IResponseBase<ISubjectForCreateTimeTableWithGeneral[]>> {
    const queryParams = convertToParams(params);
    return this.http.get<
      IResponseBase<ISubjectForCreateTimeTableWithGeneral[]>
    >(`${this.endpoint}/subject-not-same-teacher`, {
      params: queryParams,
    });
  }
}
