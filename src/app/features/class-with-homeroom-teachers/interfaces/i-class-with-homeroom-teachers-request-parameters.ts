import { IRequestParameters } from '@core/interfaces';

export interface IClassWithHomeroomTeachersRequestParameters
  extends IRequestParameters {
  isAssignedHomeroom: boolean;
}
