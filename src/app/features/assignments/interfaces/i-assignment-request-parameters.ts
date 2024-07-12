import { IRequestParameters } from '@core/interfaces';

export interface IAssignmentRequestParameters extends IRequestParameters {
  startYear?: number;
  endYear?: number;
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  isNotAssigned?: boolean;
}
