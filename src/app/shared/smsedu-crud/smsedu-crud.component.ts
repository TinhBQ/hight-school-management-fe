/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';

import {
  Input,
  Output,
  OnInit,
  Component,
  ViewChild,
  EventEmitter,
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MultiSelectModule } from 'primeng/multiselect';

import { CoreModule } from '@core/core.module';
import { ICusAutoCompleteColumn } from '@core/interfaces/i-column';
import { IColumn, IPagination, ICustomAction } from '@core/interfaces';
import { SmseduConvertHtmlDirective } from '@core/directives/smsedu-convert-html.directive';

import { SmseduAutoCompleteComponent } from '@shared/smsedu-auto-complete/smsedu-auto-complete.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-crud',
  standalone: true,
  imports: [
    CoreModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    DropdownModule,
    CheckboxModule,
    InputTextModule,
    FileUploadModule,
    SplitButtonModule,
    MultiSelectModule,
    InputNumberModule,
    SmseduAutoCompleteComponent,
    SmseduConvertHtmlDirective,
  ],
  templateUrl: './smsedu-crud.component.html',
})
export class SmseduCrudComponent implements OnInit {
  styleWitdth: string = '';

  @Input() selected: any[] = [];

  @Input() isPaginator: boolean = true;

  @Output() selectedChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  @Input() customActions: ICustomAction[] = [];

  @Input() columns: IColumn[] = [];

  @Input() exportItem: MenuItem[];

  @Input() data: any[];

  @Input() pagination: IPagination;

  @Input() loading: boolean = false;

  @Input() title: string = '';

  @Input() searchString: string = '';

  @Input() searchText$ = new Subject<string>();

  @Input() isToolBar: boolean = false;

  @Input() isSelected: boolean = false;

  @Input() isUploadFile: boolean = false;

  @Input() isCreate: boolean = false;

  @Input() isBgFloat: boolean = false;

  @Input() cusAutoCompleteColumn: ICusAutoCompleteColumn;

  @Input() onCreate: () => void;

  @Input() onDeleteCollection: (event: Event, selected: any[]) => void;

  @Output() lazyLoad = new EventEmitter();

  @Output() selectFile = new EventEmitter();

  @Output() uploadFile = new EventEmitter();

  // * --------------------- View child --------------------
  @ViewChild('dt', {}) tableEL: Table;

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface

  ngOnInit(): void {
    this.styleWitdth = `width: ${98 / (this.columns.length + 1) || 12.5}%; min-width: 10rem;`;
  }

  onLazyLoad(event: any) {
    this.lazyLoad.emit(event);
  }

  onSelectFile(event: any) {
    this.selectFile.emit(event);
  }

  onUploadFile(event: any) {
    this.uploadFile.emit(event);
  }

  // * --------------------- Handle Search Item --------------------
  getSearchValue(event: Event): string {
    this.searchString = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }

  onSearch(packageName: string) {
    this.searchText$.next(packageName);
  }

  // * --------------------- Clear Table --------------------
  onclear() {
    this.selected = [];
    this.tableEL.clear();
    this.searchString = '';
    this.selectedChange.emit(this.selected);
  }

  getNestedValue(obj: any, field: string): any {
    const keys = field.split('.');
    return keys.reduce((acc, key) => acc?.[key], obj);
  }

  getDataCell(rowData: any, col: IColumn): string {
    return !col.field.includes('.')
      ? col.pipe
        ? col.pipe.transform(rowData[col.field]) || 'Chưa xác định'
        : rowData[col.field] || 'Chưa xác định'
      : col.pipe
        ? col.pipe.transform(this.getNestedValue(rowData, col.field)) ||
          'Chưa xác định'
        : this.getNestedValue(rowData, col.field) || 'Chưa xác định';
  }
}
