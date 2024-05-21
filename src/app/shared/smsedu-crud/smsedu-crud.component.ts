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

import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';

import { CoreModule } from '@core/core.module';
import { IColumn, IPagination, ICustomAction } from '@core/interfaces';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-crud',
  standalone: true,
  imports: [
    CoreModule,
    ToolbarModule,
    ButtonModule,
    FileUploadModule,
    TableModule,
    InputTextModule,
  ],
  templateUrl: './smsedu-crud.component.html',
})
export class SmseduCrudComponent implements OnInit {
  styleWitdth: string = '';

  selected: any[] = [];

  @Input() customActions: ICustomAction[] = [];

  @Input() columns: IColumn[] = [];

  @Input() data: any[];

  @Input() pagination: IPagination;

  @Input() loading: boolean = false;

  @Input() title: string = '';

  @Input() searchString: string = '';

  @Input() searchText$ = new Subject<string>();

  @Input() onEdit: (dataRow: any) => void;

  @Input() onCreate: () => void;

  @Input() onDelete: (event: Event, dataRow: any) => void;

  @Input() onDeleteCollection: (event: Event, selected: any[]) => void;

  @Output() lazyLoad = new EventEmitter();

  @Output() selectFile = new EventEmitter();

  @Output() uploadFile = new EventEmitter();

  // * --------------------- View child --------------------
  @ViewChild('dt', {}) tableEL: Table;

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
  }

  getNestedValue(obj: any, field: string): any {
    const keys = field.split('.');
    return keys.reduce((acc, key) => acc?.[key], obj);
  }
}
