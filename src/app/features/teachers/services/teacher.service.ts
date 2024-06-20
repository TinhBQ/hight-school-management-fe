import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IRequestParameters } from '@core/interfaces';
import { BaseService } from '@core/services/base.service';

import {
  ITeacher,
  ITeacherDto,
  ITeachersForClassRequestParameters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class TeacherService extends BaseService<
  ITeacher,
  ITeacherDto,
  IRequestParameters | ITeachersForClassRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/teachers');
  }
}
