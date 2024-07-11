/* eslint-disable @typescript-eslint/no-explicit-any */
import { read, utils, WorkBook, WorkSheet } from 'xlsx';
import { ISubject } from '@features/subjects/interfaces';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SubjectService } from '@features/subjects/services/subject.service';

import { CommonModule } from '@angular/common';
import { OnInit, Component, ViewChild } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';

import { TableExportService } from '@core/services/table-export.service';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';
import {
  IColumn,
  IPagination,
  IResponseBase,
  ICustomAction,
  IRequestParameters,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

import { SubjectDialogForCreateUpdateComponent } from '../subject-dialog-for-create-update/subject-dialog-for-create-update.component';
import { SubjectDiaglogForCreateCollectionComponent } from '../subject-diaglog-for-create-collection/subject-diaglog-for-create-collection.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subject-list',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    SubjectDialogForCreateUpdateComponent,
    SmseduCrudComponent,
    SubjectDiaglogForCreateCollectionComponent,
  ],
  templateUrl: './subject-list.component.html',
  providers: [
    SubjectService,
    MessageNotificationService,
    ConfirmationDialogService,
    TableExportService,
  ],
})
export class SubjectListComponent implements OnInit {
  columns: IColumn[] = [];

  result: IResponseBase<ISubject[]>;

  pagination: IPagination;

  requestParameters: IRequestParameters;

  loading = false;

  searchClass = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  requestParametersForExport: IRequestParameters;

  exportItem: MenuItem[] = [];

  excelData: any[] = [];

  @ViewChild(SubjectDialogForCreateUpdateComponent)
  subjectDialogForCreateUpdateComponent: SubjectDialogForCreateUpdateComponent;

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(SubjectDiaglogForCreateCollectionComponent)
  subjectDiaglogForCreateCollectionComponent: SubjectDiaglogForCreateCollectionComponent;

  constructor(
    private subjectService: SubjectService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    private tableExportService: TableExportService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getClasses(this.requestParameters);
      });

    this.getClasses();

    this.columns = [
      { field: 'name', header: 'Môn học', isSort: true },
      { field: 'shortName', header: 'Ký hiệu', isSort: true },
    ];

    this.customActions = [
      {
        label: 'Chỉnh sửa',
        icon: 'pi pi-pencil',
        color: 'success',
        onClick: (evnet: Event, data: any) => {
          this.onShowDialogForEdit(data);
        },
      },
      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        color: 'warning',
        onClick: (evnet: Event, data: any) => {
          this.onDeleteClass(evnet, data);
        },
      },
    ];

    this.exportItem = [
      {
        label: 'XLS',
        icon: 'pi pi-fw pi-file-excel',
        command: () => {
          this.onExportExcel();
        },
      },
      {
        label: 'PDF',
        icon: 'pi pi-fw pi-file-pdf',
        command: () => {
          this.onExportPDF();
        },
      },
    ];
  }

  @ViewChild('dt', {}) tableEL: Table;

  // * --------------------- Load Data Classes for Table --------------------
  onLoadClasses(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    this.requestParameters = {
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.getClasses(this.requestParameters);
  }

  // * --------------------- Get List Classes for Services --------------------
  private getClasses(params?: IRequestParameters): void {
    this.loading = true;
    this.subjectService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.log(error.toString());
      }
    );
  }

  onShowDialogForCreate(): void {
    this.subjectDialogForCreateUpdateComponent.subjectForm.setValue({
      id: null,
      name: null,
      shortName: null,
    });
    this.subjectDialogForCreateUpdateComponent.subjectDialog = true;
  }

  onShowDialogForEdit(subject: ISubject): void {
    this.subjectDialogForCreateUpdateComponent.subjectForm.setValue({
      id: subject.id,
      name: subject.name,
      shortName: subject.shortName,
    });

    this.subjectDialogForCreateUpdateComponent.subjectDialog = true;
  }

  onClear(): void {
    this.smseduCrudComponent.onclear();
  }

  onSave(): void {
    if (this.subjectDialogForCreateUpdateComponent.subjectForm.valid) {
      // ! Update class
      if (this.subjectDialogForCreateUpdateComponent.subjectForm.value.id) {
        this.subjectDialogForCreateUpdateComponent.onSetSubjectDTO();
        this.subjectService
          .update(
            this.subjectDialogForCreateUpdateComponent.subjectForm.value.id,
            this.subjectDialogForCreateUpdateComponent.subjectDto
          )
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.subjectDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Cập nhật môn học ${this.subjectDialogForCreateUpdateComponent.subjectForm.value.name} thành công!`
              );
            },
            (error) => {
              console.log(error.toString());
              this.messageNotificationService.showError(
                error.message ?? 'Đã xảy ra lỗi.'
              );
            }
          );
      } else {
        // ! Create class
        this.subjectDialogForCreateUpdateComponent.onSetSubjectDTO();
        this.subjectService
          .create(this.subjectDialogForCreateUpdateComponent.subjectDto)
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.subjectDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Thêm  môn học ${this.subjectDialogForCreateUpdateComponent.subjectForm.value.name} thành công!`
              );
            },
            (error) => {
              console.log(error.toString());
              this.messageNotificationService.showError(
                error.message ?? 'Đã xảy ra lỗi.'
              );
            }
          );
      }
    }
  }

  onDeleteClass(event: Event, subject: ISubject): void {
    this.confirmationDialogService.confirm(event, () => {
      this.subjectService.delete(subject.id).subscribe(
        () => {
          this.smseduCrudComponent.onclear();
          this.messageNotificationService.showSuccess(
            `Xóa môn học  ${subject.name} thành công!`
          );
        },
        (error) => {
          console.log(error.toString());
          this.messageNotificationService.showError(
            error.message ?? 'Đã xảy ra lỗi.'
          );
        }
      );
    });
  }

  onDeleteClasses(event: Event, selectedSubjects: ISubject[]): void {
    if (selectedSubjects.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.subjectService
          .deleteByIds(selectedSubjects.map((x) => x.id))
          .subscribe(
            () => {
              this.messageNotificationService.showSuccess(
                `Xóa ${selectedSubjects.length} môn học: ${selectedSubjects.map((x) => x.name).join(', ')} thành công!`
              );
              this.smseduCrudComponent.onclear();
            },
            (error) => {
              console.log(error.toString());
              this.messageNotificationService.showError(
                error.message ?? 'Đã xảy ra lỗi.'
              );
            }
          );
      });
    }
  }

  // #region -- Handel Export Data --
  // @ Acition: Export Excel
  onExportExcel(): void {
    this.requestParametersForExport = {
      ...this.requestParameters,
      pageNumber: 1,
      pageSize: this.pagination.totalCount,
    };
    this.subjectService.find(this.requestParametersForExport).subscribe(
      (response) => {
        const dataExport = response.result.data;

        this.tableExportService.exportExcel(
          dataExport.map((item: any) => {
            return {
              'Môn học': item.name,
              'Ký hiệu': item.shortName,
            };
          }),
          'subjects'
        );
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }

  // @ Acition: Export PDf
  onExportPDF(): void {
    this.requestParametersForExport = {
      ...this.requestParameters,
      pageNumber: 1,
      pageSize: this.pagination.totalCount,
    };
    this.subjectService.find(this.requestParametersForExport).subscribe(
      (response) => {
        const headers = this.columns.map((col) => col.header);
        console.log('headers', headers);
        const rows = response.result.data.map((row) =>
          this.columns.map((col) => row[col.field])
        );
        console.log('rows', rows);
        this.tableExportService.exportPdf(
          headers,
          rows,
          'subjects',
          'Danh sách môn học'
        );
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }
  // #endregion

  onSelect(event: any): void {
    this.excelData = [];

    for (const file of event.files) {
      const reader: FileReader = new FileReader();

      // eslint-disable-next-line @typescript-eslint/no-loop-func
      reader.onload = (e: any) => {
        const binaryString = e.target.result;
        const workbook: WorkBook = read(binaryString, {
          type: 'binary',
        });
        const worksheetName: string = workbook.SheetNames[0];
        const worksheet: WorkSheet = workbook.Sheets[worksheetName];

        this.excelData = utils
          .sheet_to_json(worksheet, {
            raw: true,
          })
          .filter(
            (row: any) => row['Môn học'] != null && row['Ký hiệu'] != null
          )
          .map((row: any) => ({
            name: row['Môn học'],
            shortName: row['Ký hiệu'],
          }));
      };

      reader.readAsBinaryString(file);
    }

    event = null;
    console.log(this.excelData);
  }

  // @ Acition: Upload file excel for add to classes
  onUpload(event: any): void {
    console.log(event);
    console.log(this.excelData);
    this.subjectDiaglogForCreateCollectionComponent.dialog = true;
  }
}
