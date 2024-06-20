import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IRequestParameters } from '@core/interfaces';
import { BaseService } from '@core/services/base.service';

import {
  IHomeroomAssignment,
  IHomeroomAssignmentDto,
  IHomeroomAssignmentRequestParameters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class HomeroomAssignmentsService extends BaseService<
  IHomeroomAssignment,
  IHomeroomAssignmentDto,
  IRequestParameters | IHomeroomAssignmentRequestParameters
> {
  constructor(protected override http: HttpClient) {
    super(http, '/homeroom-assignments');
  }
}
