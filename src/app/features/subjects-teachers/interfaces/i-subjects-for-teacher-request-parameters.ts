import { IRequestParameters } from '@core/interfaces';

export interface ISubjectsForTeacherRequestParameters
  extends IRequestParameters {
  teacherId: string;
}
