import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseService } from '@core/services/base.service';

import { ITeacher, ITeacherDto } from '../interfaces/i-teacher';

@Injectable({
  providedIn: 'root',
})
export class TeacherService extends BaseService<ITeacher, ITeacherDto> {
  constructor(protected override http: HttpClient) {
    super(http, '/teachers');
  }
}
