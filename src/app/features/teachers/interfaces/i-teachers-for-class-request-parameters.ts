import { IRequestParameters } from '@core/interfaces';

export interface ITeachersForClassRequestParameters extends IRequestParameters {
  isAssignedHomeroom?: boolean;
  startYear?: number;
  endYear?: number;
}
