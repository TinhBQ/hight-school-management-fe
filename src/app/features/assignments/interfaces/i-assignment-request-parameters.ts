import { IRequestParameters } from '@core/interfaces';

export interface IAssignmentRequestParameters extends IRequestParameters {
  startYear?: number;
  endYear?: number;
  semester?: number;
  classId?: string;
}
