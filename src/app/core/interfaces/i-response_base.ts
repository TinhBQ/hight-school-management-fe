export interface IResponseBase<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}
