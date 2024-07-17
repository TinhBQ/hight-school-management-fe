/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IYear } from '@features/years/interfaces';
// #region -- Imports --
import { read, utils, WorkBook, WorkSheet } from 'xlsx';
import { ISemester } from '@features/timetables/interfaces';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { YearService } from '@features/years/services/year.service';
import { IClassRequestParameters } from '@features/classes/interfaces';
import { ClassService } from '@features/classes/services/class.service';
import { IClass, IClassDto } from '@features/classes/interfaces/i-class';
import { semesterData } from '@features/timetables/helpers/semester-data';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';
import { GetFullAndShortNameForTeacherPipe } from '@features/teachers/pipes/get-full-and-short-name-for-teacher.pipe';
import { SubjectsForClassComponent } from '@features/subject-class/components/subjects-for-class/subjects-for-class.component';
import { ClassWithHomeroomTeachersUpdateDialogComponent } from '@features/class-with-homeroom-teachers/components/class-with-homeroom-teachers-update-dialog/class-with-homeroom-teachers-update-dialog.component';

import {
  OnInit,
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { TableExportService } from '@core/services/table-export.service';
import { CoreDirectivesModule } from '@core/directives/core-directives.module';
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

import { ClassDialogForCreateUpdateComponent } from '../class-dialog-for-create-update/class-dialog-for-create-update.component';
import { ClassDiaglogForCreateCollectionComponent } from '../class-diaglog-for-create-collection/class-diaglog-for-create-collection.component';

// #endregion

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-list',
  standalone: true,
  imports: [
    CoreModule,
    DropdownModule,
    DynamicDialogModule,
    SmseduCrudComponent,
    CoreDirectivesModule,
    GetFullAndShortNameForTeacherPipe,
    ClassDialogForCreateUpdateComponent,
    ClassDiaglogForCreateCollectionComponent,
    ClassWithHomeroomTeachersUpdateDialogComponent,
  ],
  templateUrl: './class-list.component.html',
  providers: [
    YearService,
    ClassService,
    DialogService,
    TableExportService,
    ConfirmationDialogService,
    MessageNotificationService,
  ],
})
export class ClassListComponent implements OnInit, AfterViewInit {
  // * --------------------- Variables ---------------------
  // #region -- Variables --
  columns: IColumn[] = [];

  result: IResponseBase<IClass[]>;

  data: any[] = [];

  pagination: IPagination;

  requestParameters: IClassRequestParameters = {};

  requestParametersForExport: IClassRequestParameters = {};

  loading: boolean = false;

  searchString = '';

  searchText$ = new Subject<string>();

  klass: IClassDto;

  classDtos: IClassDto[] = [];

  selectedClasses: IClass[] = [];

  isFirstLoad: boolean = true;

  addClassCollectionDialog: boolean = false;

  excelData: any[] = [];

  customActions: ICustomAction[] = [];

  exportItem: MenuItem[] = [];

  semesterData: ISemester[] = semesterData;

  selectSemester: ISemester;

  // * Years
  selectYear: IYear;

  schoolYears: IYear[] = [];

  paginationSchoolYears: IPagination;

  loadingSchoolYears: boolean = false;

  requestParametersForSchoolYears: IRequestParameters = {
    orderBy: 'startYear desc',
    pageSize: 100,
  };

  // #endregion

  ref: DynamicDialogRef | undefined;

  // #region -- ViewChild --
  @ViewChild(SmseduCrudComponent) smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(ClassDialogForCreateUpdateComponent)
  classDialogForCreateUpdateComponent: ClassDialogForCreateUpdateComponent;

  @ViewChild(ClassDiaglogForCreateCollectionComponent)
  classDiaglogForCreateCollectionComponent: ClassDiaglogForCreateCollectionComponent;

  @ViewChild(ClassWithHomeroomTeachersUpdateDialogComponent)
  classWithHomeroomTeachersUpdateDialogComponent: ClassWithHomeroomTeachersUpdateDialogComponent;
  // #endregion

  constructor(
    private classService: ClassService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    public dialogService: DialogService,
    private tableExportService: TableExportService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent,
    private yearService: YearService
  ) {}

  // * --------------------- OnInit ---------------------
  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getClasses(this.requestParameters);
      });

    this.columns = [
      { field: 'name', header: 'Lớp', isSort: true },
      { field: 'grade', header: 'Khối', isSort: true },
      { field: 'periodCount', header: 'Số tiết/Tuần', isSort: true },
      { field: 'schoolShift', header: 'Buổi', isSort: true },
      { field: 'year', header: 'Năm học', isSort: false },
      {
        field: 'homeroomTeacher',
        header: 'Giáo viên Chủ nhiệm',
        pipe: new GetFullAndShortNameForTeacherPipe(),
        isSort: false,
        isAction: true,
        onAction: (evnet: Event, data: any) => {
          this.classWithHomeroomTeachersUpdateDialogComponent._form.setValue({
            classId: data.id,
            homeroomTeacher: data.homeroomTeacher,
          });
          this.classWithHomeroomTeachersUpdateDialogComponent.dialog = true;
        },
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
          this.ref = this.dialogService.open(SubjectsForClassComponent, {
            header: `Danh sách môn học lớp ${data.name}`,
            width: '90%',
            maximizable: true,
            data: {
              classId: data.id,
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

    this.getYears(this.requestParametersForSchoolYears);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  // * --------------------- Handel Function ---------------------
  // #region -- Load Classes --
  onLoadClasses(event: any): void {
    if (this.isFirstLoad) {
      this.isFirstLoad = false;
      return;
    }

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

    this.getClasses(this.requestParameters);
  }

  getClasses(params?: IRequestParameters): void {
    this.loading = true;
    this.classService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.loading = false;
        this.data = this.result.data.map((x) => ({
          id: x.id,
          name: x.name,
          grade: x.grade,
          periodCount: x.periodCount,
          schoolShift: x.schoolShift === 0 ? 'Sáng' : 'Chiều',
          year: x.startYear + '-' + x.endYear,
          homeroomTeacher: x.homeroomTeacher,
        }));
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (error) => {
        this.loading = false;
        this.messageNotificationService.showError('Xảy ra lỗi');
      }
    );
  }

  // #endregion

  // * Get Data Years
  private getYears(params?: IRequestParameters): void {
    this.loadingSchoolYears = true;
    this.app.onShowSplashScreenService();
    this.yearService.getYears(params).subscribe(
      (response) => {
        this.schoolYears = response.result.data.map((y) => ({
          ...y,
          name: y.startYear + '-' + y.endYear,
        }));

        this.paginationSchoolYears = response.pagination;

        if (this.paginationSchoolYears?.hasNext) {
          this.requestParametersForSchoolYears.pageSize =
            this.paginationSchoolYears.totalCount;

          this.getYears(this.requestParametersForSchoolYears);
        } else {
          this.selectYear = this.schoolYears[0];
          this.classWithHomeroomTeachersUpdateDialogComponent.startYear =
            this.selectYear.startYear;
          this.classWithHomeroomTeachersUpdateDialogComponent.endYear =
            this.selectYear.endYear;
          this.requestParameters = {
            ...this.requestParameters,
            startYear: this.selectYear.startYear,
            endYear: this.selectYear.endYear,
          };
          this.getClasses(this.requestParameters);
          this.loadingSchoolYears = false;
          this.app.onHideSplashScreenService();
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (error) => {
        this.loadingSchoolYears = false;
        this.app.onHideSplashScreenService();
      }
    );
  }

  onChangeYear(event: any): void {
    this.requestParameters = {
      ...this.requestParameters,
      startYear: event.value.startYear,
      endYear: event.value.endYear,
    };
    this.classWithHomeroomTeachersUpdateDialogComponent.startYear =
      event.value.startYear;
    this.classWithHomeroomTeachersUpdateDialogComponent.endYear =
      event.value.endYear;
    this.getClasses(this.requestParameters);
  }

  // #region -- Handel Action
  // @ Acition: Create and Update Class
  onSave(): void {
    if (this.classDialogForCreateUpdateComponent.classForm.valid) {
      this.app.onShowSplashScreenService();
      // ! Update class
      if (this.classDialogForCreateUpdateComponent.classForm.value.id) {
        this.classDialogForCreateUpdateComponent.onSetClassDTO();
        this.classService
          .update(
            this.classDialogForCreateUpdateComponent.classForm.value.id,
            this.classDialogForCreateUpdateComponent.classDto
          )
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.classDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Cập nhật lớp học ${this.classDialogForCreateUpdateComponent.classForm.value.name} thành công!`
              );
              this.app.onHideSplashScreenService();
              this.getYears(this.requestParametersForSchoolYears);
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (error) => {
              this.app.onHideSplashScreenService();
              this.messageNotificationService.showError('Xảy ra lỗi');
            }
          );
      } else {
        // ! Create class
        this.classDialogForCreateUpdateComponent.onSetClassDTO();
        this.classService
          .create(this.classDialogForCreateUpdateComponent.classDto)
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.classDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Thêm lớp học ${this.classDialogForCreateUpdateComponent.classForm.value.name} thành công!`
              );
              this.app.onHideSplashScreenService();
              this.getYears(this.requestParametersForSchoolYears);
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (error) => {
              this.app.onHideSplashScreenService();
              this.messageNotificationService.showError('Xảy ra lỗi');
            }
          );
      }
    }
  }

  onClear(): void {
    this.smseduCrudComponent.onclear();
    this.getYears(this.requestParametersForSchoolYears);
  }

  // @ Acition: Save Classes
  onSaveClasses(event: Event): void {
    this.classDtos = [];
    if (this.excelData.length > 0) {
      this.classDtos = this.excelData.map((item) => {
        return {
          grade: parseInt(item.grade),
          name: item.name.toString(),
          schoolShift: parseInt(item.schoolShift.id),
          startYear: parseInt(item.year.slice(0, 4)),
          endYear: parseInt(item.year.slice(5, 9)),
        };
      }) as IClassDto[];
      this.confirmationDialogService.confirm(event, () => {
        this.app.onShowSplashScreenService();
        this.classService.createCollection(this.classDtos).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách lớp tành công!'
            );
            this.addClassCollectionDialog = false;
            this.excelData = [];
            this.smseduCrudComponent.onclear();
            this.app.onHideSplashScreenService();
            this.getYears(this.requestParametersForSchoolYears);
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (error) => {
            this.messageNotificationService.showError('Xảy ra lỗi');
            this.app.onHideSplashScreenService();
          }
        );
      });
    }
  }

  // @ Acition: delete Class
  onDeleteClass(event: Event, klass: IClass): void {
    this.confirmationDialogService.confirm(event, () => {
      this.app.onShowSplashScreenService();
      this.classService.delete(klass.id).subscribe(
        () => {
          this.smseduCrudComponent.onclear();
          this.messageNotificationService.showSuccess(
            `Xóa lớp  ${klass.name} thành công!`
          );
          this.app.onHideSplashScreenService();
          this.getYears(this.requestParametersForSchoolYears);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (error) => {
          this.messageNotificationService.showError('Xảy ra lỗi');
          this.app.onHideSplashScreenService();
        }
      );
    });
  }

  // @ Acition: delete Classes
  onDeleteClasses(event: Event, selectedClasses: any[]): void {
    if (selectedClasses.length > 0) {
      this.app.onShowSplashScreenService();
      this.confirmationDialogService.confirm(event, () => {
        this.classService
          .deleteByIds(selectedClasses.map((x) => x.id))
          .subscribe(
            () => {
              this.messageNotificationService.showSuccess(
                `Xóa ${selectedClasses.length} lớp: ${selectedClasses.map((x) => x.name).join(', ')} thành công!`
              );
              this.smseduCrudComponent.onclear();
              this.app.onHideSplashScreenService();
              this.getYears(this.requestParametersForSchoolYears);
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (error) => {
              this.messageNotificationService.showError('Xảy ra lỗi');
              this.app.onHideSplashScreenService();
            }
          );
      });
    }
  }

  // @ Acition: Show dialog for create
  onShowDialogForCreate(): void {
    this.classDialogForCreateUpdateComponent.classForm.setValue({
      id: null,
      name: null,
      grade: null,
      schoolShift: null,
      year: null,
    });
    this.classDialogForCreateUpdateComponent.dialog = true;
  }

  // @ Acition: Show dialog for eidt class
  onShowDialogForEdit(klass: any): void {
    this.classDialogForCreateUpdateComponent.classForm.setValue({
      id: klass.id,
      name: klass.name,
      grade: klass.grade,
      schoolShift:
        klass.schoolShift.toString() === 'Sáng'
          ? schoolShiftData[0]
          : schoolShiftData[1],
      year: klass.year,
    });
    this.classDialogForCreateUpdateComponent.dialog = true;
  }

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
            (row: any) =>
              row['Lớp'] != null &&
              row['Buổi'] != null &&
              row['Khối'] != null &&
              row['Năm học'] != null
          )
          .map((row: any) => ({
            grade: row['Khối'],
            schoolShift:
              this.classDialogForCreateUpdateComponent.schoolShifts.find(
                (x) => {
                  return x.name.toString() === row['Buổi'].toString();
                }
              ),
            name: row['Lớp'],
            year: row['Năm học'],
          }));
      };

      reader.readAsBinaryString(file);
    }

    event = null;
  }

  // @ Acition: Upload file excel for add to classes
  onUpload(event: any): void {
    this.classDiaglogForCreateCollectionComponent.dialog = true;
    this.addClassCollectionDialog = true;
  }

  // #endregion

  // #region -- Handel Export Data --
  // @ Acition: Export Excel
  onExportExcel(): void {
    this.requestParametersForExport = {
      ...this.requestParameters,
      pageNumber: 1,
      pageSize: this.pagination.totalCount,
    };
    this.app.onShowSplashScreenService();
    this.classService.find(this.requestParametersForExport).subscribe(
      (response) => {
        const dataExport = response.result.data.map((x) => ({
          id: x.id,
          name: x.name,
          grade: x.grade,
          schoolShift: x.schoolShift === 0 ? 'Sáng' : 'Chiều',
          year: x.startYear + '-' + x.endYear,
          homeroomTeacher: x.homeroomTeacher,
        }));

        this.tableExportService.exportExcel(
          dataExport.map((item: any) => {
            return {
              Lớp: item.name,
              Khối: item.grade,
              Buổi: item.schoolShift,
              'Năm học': item.year,
              'Giáo viên Chủ nhiệm':
                item.homeroomTeacher?.fullName ?? 'Chưa phân công',
            };
          }),
          'classes'
        );

        this.app.onHideSplashScreenService();
      },
      (error) => {
        this.messageNotificationService.showError('Xảy ra lỗi');
        this.app.onHideSplashScreenService();
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

    this.app.onShowSplashScreenService();
    this.classService.find(this.requestParametersForExport).subscribe(
      (response) => {
        const headers = this.columns.map((col) => col.header);

        const rows = response.result.data
          .map((x) => ({
            id: x.id,
            name: x.name,
            grade: x.grade,
            schoolShift: x.schoolShift === 0 ? 'Sáng' : 'Chiều',
            year: x.startYear + '-' + x.endYear,
            fullName: x.homeroomTeacher?.fullName ?? 'Chưa phân công',
          }))
          .map((row) =>
            this.columns.map((col) =>
              col.field === 'homeroomTeacher' ? row.fullName : row[col.field]
            )
          );

        this.tableExportService.exportPdf(
          headers,
          rows,
          'classes',
          'Danh sách lớp học'
        );

        this.app.onHideSplashScreenService();
      },
      (error) => {
        this.app.onHideSplashScreenService();
        this.messageNotificationService.showError('Xảy ra lỗi');
      }
    );
  }
  // #endregion
}
