import { IRequestParameters } from '@core/interfaces';

export interface IHomeroomAssignmentRequestParameters
  extends IRequestParameters {
  isAssignedHomeroom?: boolean;
}
