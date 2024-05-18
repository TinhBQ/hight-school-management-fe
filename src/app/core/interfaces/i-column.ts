import { PipeTransform } from '@angular/core';

export interface IColumn {
  field: string;
  header: string;
  style?: string;
  class?: string;
  pipe?: PipeTransform;
  isSort?: boolean;
}
