import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseService } from '@core/services/base.service';

import {
  IClassWithHomeroomTeachers,
  IClassWithHomeroomTeachersDto,
  IClassWithHomeroomTeachersRequestParameters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ClassWithHomeroomTeachersService extends BaseService<
  IClassWithHomeroomTeachers,
  IClassWithHomeroomTeachersDto,
  IClassWithHomeroomTeachersRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/class-with-homeroom-teachers');
  }
}
