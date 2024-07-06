import { IRequestParameters } from '@core/interfaces';

export interface IClassRequestParameters extends IRequestParameters {
  startYear?: number;
  endYear?: number;
}
