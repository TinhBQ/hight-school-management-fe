import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IRequestParameters } from '@core/interfaces';
import { BaseService } from '@core/services/base.service';

import {
  ISubjectsTeachers,
  ISubjectsTeachersDto,
  ISubjectsForTeacherRequestParameters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SubjectsTeachersService extends BaseService<
  ISubjectsTeachers,
  ISubjectsTeachersDto,
  IRequestParameters | ISubjectsForTeacherRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/subjects-teachers');
  }
}
