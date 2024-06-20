import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IRequestParameters } from '@core/interfaces';
import { BaseService } from '@core/services/base.service';

import { IClass, IClassDto } from '../interfaces/i-class';

@Injectable({
  providedIn: 'root',
})
export class ClassService extends BaseService<
  IClass,
  IClassDto,
  IRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/classes');
  }
}
