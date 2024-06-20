import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IRequestParameters } from '@core/interfaces';
import { BaseService } from '@core/services/base.service';

import { ISubjectClass, ISubjectClassDto } from '../interfaces/i-subject-class';

@Injectable({
  providedIn: 'root',
})
export class SubjectClassService extends BaseService<
  ISubjectClass,
  ISubjectClassDto,
  IRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/subjects-classes');
  }
}
