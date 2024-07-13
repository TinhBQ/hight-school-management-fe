/* eslint-disable @typescript-eslint/no-explicit-any */
import { read, utils, WorkBook, WorkSheet } from 'xlsx';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ITeacher } from '@features/teachers/interfaces/i-teacher';
import { TeacherService } from '@features/teachers/services/teacher.service';
import { GetSubjectNamesForTeachersPipe } from '@features/subjects-teachers/pipes/get-subject-names-for-teachers.pipe';
import { SubjectsForTeacherComponent } from '@features/subjects-teachers/components/subjects-for-teacher/subjects-for-teacher.component';

import {
  OnInit,
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
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

import { TeacherDialogForCreateUpdateComponent } from '../teacher-dialog-for-create-update/teacher-dialog-for-create-update.component';
import { TeacherDiaglogForCreateCollectionComponent } from '../teacher-diaglog-for-create-collection/teacher-diaglog-for-create-collection.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-teacher-list',
  standalone: true,
  imports: [
    CoreModule,
    SmseduCrudComponent,
    DynamicDialogModule,
    GetSubjectNamesForTeachersPipe,
    TeacherDialogForCreateUpdateComponent,
    TeacherDiaglogForCreateCollectionComponent,
  ],
  templateUrl: './teacher-list.component.html',
  providers: [
    MessageNotificationService,
    ConfirmationDialogService,
    TeacherService,
    DialogService,
    TableExportService,
  ],
})
export class TeacherListComponent implements OnInit, AfterViewInit {
  columns: IColumn[] = [];

  excelData: any[] = [];

  result: IResponseBase<ITeacher[]>;

  pagination: IPagination;

  requestParameters: IRequestParameters;

  requestParametersForExport: IRequestParameters;

  loading = false;

  searchClass = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  exportItem: MenuItem[] = [];

  ref: DynamicDialogRef | undefined;

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(TeacherDialogForCreateUpdateComponent)
  teacherDialogForCreateUpdateComponent: TeacherDialogForCreateUpdateComponent;

  @ViewChild(TeacherDiaglogForCreateCollectionComponent)
  teacherDiaglogForCreateCollectionComponent: TeacherDiaglogForCreateCollectionComponent;

  constructor(
    private teacherService: TeacherService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    public dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent,
    private tableExportService: TableExportService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getTeachers(this.requestParameters);
      });
    this.getTeachers();

    this.columns = [
      { field: 'fullName', header: 'Họ và tên', isSort: true },
      { field: 'shortName', header: 'Ký hiệu', isSort: true },
      { field: 'periodCount', header: 'Số tiết/Tuần', isSort: true },
      {
        field: 'subjectTeachers',
        header: 'Môn Giảng dạy',
        pipe: new GetSubjectNamesForTeachersPipe(),
        isSort: false,
      },
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
        label: 'Chỉnh sửa phân công môn học',
        icon: 'pi pi-file-edit',
        color: 'blue',
        onClick: (evnet: Event, data: any) => {
          this.ref = this.dialogService.open(SubjectsForTeacherComponent, {
            header: `Phân công môn giảng dạy - Giáo viên ${data.fullName}`,
            width: '90%',
            maximizable: true,
            data: {
              teacherId: data.id,
              handleAction: this.onClear(),
            },
            contentStyle: { overflow: 'auto' },
          });
        },
      },
      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        color: 'warning',
        onClick: (evnet: Event, data: any) => {
          this.onDelete(evnet, data);
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

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onLoadTeachers(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    this.requestParameters = {
      ...this.requestParameters,
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.getTeachers(this.requestParameters);
  }

  private getTeachers(params?: IRequestParameters): void {
    this.loading = true;
    this.teacherService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.loading = false;
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }

  onShowDialogForCreate(): void {
    this.teacherDialogForCreateUpdateComponent.formGroup.setValue({
      id: null,
      fullName: null,
      shortName: null,
    });
    this.teacherDialogForCreateUpdateComponent.dialog = true;
  }

  onShowDialogForEdit(teacher: ITeacher): void {
    this.teacherDialogForCreateUpdateComponent.formGroup.setValue({
      id: teacher.id,
      fullName: teacher.fullName,
      shortName: teacher.shortName,
    });

    this.teacherDialogForCreateUpdateComponent.dialog = true;
  }

  onSave(): void {
    if (this.teacherDialogForCreateUpdateComponent.formGroup.valid) {
      // ! Update class
      if (this.teacherDialogForCreateUpdateComponent.formGroup.value.id) {
        this.teacherDialogForCreateUpdateComponent.onSetDTO();
        this.teacherService
          .update(
            this.teacherDialogForCreateUpdateComponent.formGroup.value.id,
            this.teacherDialogForCreateUpdateComponent.teacherDto
          )
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.teacherDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Cập nhật giáo viên ${this.teacherDialogForCreateUpdateComponent.formGroup.value.fullName} thành công!`
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
        this.teacherDialogForCreateUpdateComponent.onSetDTO();
        this.teacherService
          .create(this.teacherDialogForCreateUpdateComponent.teacherDto)
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.teacherDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Thêm  giáo viên ${this.teacherDialogForCreateUpdateComponent.formGroup.value.fullName} thành công!`
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

  onDelete(event: Event, teacher: ITeacher): void {
    this.confirmationDialogService.confirm(event, () => {
      this.teacherService.delete(teacher.id).subscribe(
        () => {
          this.smseduCrudComponent.onclear();
          this.messageNotificationService.showSuccess(
            `Xóa môn học  ${teacher.fullName} thành công!`
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

  onDeleteColection(event: Event, teachers: ITeacher[]): void {
    if (teachers.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.teacherService.deleteByIds(teachers.map((x) => x.id)).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              `Xóa ${teachers.length} môn học: ${teachers.map((x) => x.firstName).join(', ')} thành công!`
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

    this.teacherService.find(this.requestParametersForExport).subscribe(
      (response) => {
        const dataExport = response.result.data.map((x) => ({
          id: x.id,
          fullName: x.fullName,
          shortName: x.shortName,
          periodCount: x.periodCount,
          subjectTeacherNames:
            x.subjectTeachers.length > 0
              ? x.subjectTeachers.map((item) => item?.subject?.name).join(', ')
              : 'Chưa phân công',
        }));

        this.tableExportService.exportExcel(
          dataExport.map((item: any) => {
            return {
              'Họ và tên': item.fullName,
              'Ký hiệu': item.shortName,
              'Số tiết/tuần': item.periodCount,
              'Môn giảng dạy': item.subjectTeacherNames,
            };
          }),
          'classes'
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

    this.teacherService.find(this.requestParametersForExport).subscribe(
      (response) => {
        const headers = this.columns.map((col) => col.header);

        const rows = response.result.data
          .map((x) => ({
            id: x.id,
            fullName: x.fullName,
            shortName: x.shortName,
            periodCount: x.periodCount,
            subjectTeacherNames:
              x.subjectTeachers.length > 0
                ? x.subjectTeachers
                    .map((item) => item?.subject?.name)
                    .join(', ')
                : 'Chưa phân công',
          }))
          .map((row) =>
            this.columns.map((col) =>
              col.field === 'subjectTeachers'
                ? row.subjectTeacherNames
                : row[col.field]
            )
          );

        console.log('rows', rows);

        this.tableExportService.exportPdf(
          headers,
          rows,
          'teacher',
          'Danh sách giáo viên'
        );
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }
  // #endregion

  // @ Acition: Select file excel for add to classes
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
            (row: any) => row['Họ và tên'] != null && row['Ký hiệu'] != null
          )
          .map((row: any) => ({
            fullName: row['Họ và tên'],
            shortName: row['Ký hiệu'],
          }));
      };

      reader.readAsBinaryString(file);
    }

    event = null;
  }

  // @ Acition: Upload file excel for add to classes
  onUpload(event: any): void {
    console.log(event);
    this.teacherDiaglogForCreateCollectionComponent.dialog = true;
  }

  onClear(): void {
    this.smseduCrudComponent.onclear();
  }
}
