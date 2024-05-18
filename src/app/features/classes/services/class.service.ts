import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseService } from '@core/services/base.service';

import { IClass, IClassDto } from '../interfaces/i-class';

@Injectable({
  providedIn: 'root',
})
export class ClassService extends BaseService<IClass, IClassDto> {
  constructor(protected override http: HttpClient) {
    super(http, '/classes');
  }
}
