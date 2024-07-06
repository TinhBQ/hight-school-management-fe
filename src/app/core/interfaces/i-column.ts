/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipeTransform } from '@angular/core';

export interface IColumn {
  field: string;
  header: string;
  style?: string;
  class?: string;
  pipe?: PipeTransform;
  isSort?: boolean;
  typeEidt?: string;
  isAction?: boolean;
  onAction?: (event: Event, data: any) => void;
  options?: any;
}

export interface ICusAutoCompleteColumn {
  suggestions: any[];
  loadData: (event: any) => void;
  onSearch: (event: any) => void;
  onSelect: (event: any, data: any) => void;
  onDropdownClick: (event: any) => void;
}
