/* eslint-disable @typescript-eslint/no-explicit-any */
import { read, utils, WorkBook, WorkSheet } from 'xlsx';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClassService } from '@features/classes/services/class.service';
import { IClass, IClassDto } from '@features/classes/interfaces/i-class';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';
import { GetFullAndShortNameForTeacherPipe } from '@features/teachers/pipes/get-full-and-short-name-for-teacher.pipe';
import { SubjectsForClassComponent } from '@features/subject-class/components/subjects-for-class/subjects-for-class.component';

import { OnInit, Component, ViewChild } from '@angular/core';

import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { CoreModule } from '@core/core.module';
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

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-list',
  standalone: true,
  imports: [
    CoreModule,
    SmseduCrudComponent,
    DynamicDialogModule,
    GetFullAndShortNameForTeacherPipe,
    ClassDialogForCreateUpdateComponent,
    ClassDiaglogForCreateCollectionComponent,
  ],
  templateUrl: './class-list.component.html',
  providers: [
    ClassService,
    MessageNotificationService,
    ConfirmationDialogService,
    DialogService,
  ],
})
export class ClassListComponent implements OnInit {
  // * -----------------------------------
  columns: IColumn[] = [];

  result: IResponseBase<IClass[]>;

  data: any[] = [];

  pagination: IPagination;

  requestParameters: IRequestParameters;

  loading: boolean = false;

  searchClass = '';

  searchText$ = new Subject<string>();

  // * -----------------------------------

  klass: IClassDto;

  classDtos: IClassDto[] = [];

  selectedClasses: IClass[] = [];

  isFirstLoad: boolean = true;

  addClassCollectionDialog: boolean = false;

  excelData: any[] = [];

  customActions: ICustomAction[] = [];

  ref: DynamicDialogRef | undefined;

  @ViewChild(SmseduCrudComponent) smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(ClassDialogForCreateUpdateComponent)
  classDialogForCreateUpdateComponent: ClassDialogForCreateUpdateComponent;

  @ViewChild(ClassDiaglogForCreateCollectionComponent)
  classDiaglogForCreateCollectionComponent: ClassDiaglogForCreateCollectionComponent;

  // * constructor
  constructor(
    private classService: ClassService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    public dialogService: DialogService
  ) {}

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
      { field: 'schoolShift', header: 'Buổi', isSort: true },
      { field: 'year', header: 'Năm học', isSort: false },
      {
        field: 'homeroomTeacher',
        header: 'Giáo viên Chủ nhiệm',
        pipe: new GetFullAndShortNameForTeacherPipe(),
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

    this.getClasses();
  }

  // * --------------------- Load Data Classes for Table --------------------
  onLoadClasses(event: any): void {
    if (this.isFirstLoad) {
      this.isFirstLoad = false;
      return;
    }

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
          schoolShift: x.schoolShift === 0 ? 'Sáng' : 'Chiều',
          year: x.startYear + '-' + x.endYear,
          homeroomTeacher: x.homeroomTeacher,
        }));
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }

  // * --------------------- Handel action --------------------
  // @ Acition: Create and Update Class
  onSave(): void {
    if (this.classDialogForCreateUpdateComponent.classForm.valid) {
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

  onClear(): void {
    this.smseduCrudComponent.onclear();
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
        this.classService.createCollection(this.classDtos).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách lớp tành công!'
            );
            this.addClassCollectionDialog = false;
            this.excelData = [];
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

  // @ Acition: delete Class
  onDeleteClass(event: Event, klass: IClass): void {
    this.confirmationDialogService.confirm(event, () => {
      this.classService.delete(klass.id).subscribe(
        () => {
          this.smseduCrudComponent.onclear();
          this.messageNotificationService.showSuccess(
            `Xóa lớp  ${klass.name} thành công!`
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

  // @ Acition: delete Classes
  onDeleteClasses(event: Event, selectedClasses: any[]): void {
    console.log(selectedClasses);
    if (selectedClasses.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.classService
          .deleteByIds(selectedClasses.map((x) => x.id))
          .subscribe(
            () => {
              this.messageNotificationService.showSuccess(
                `Xóa ${selectedClasses.length} lớp: ${selectedClasses.map((x) => x.name).join(', ')} thành công!`
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

  // @ Acition: Upload file excel for add to classes
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
                  console.log(x.name.toString(), row['Buổi'].toString());
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

  onUpload(event: any): void {
    console.log(event);
    this.classDiaglogForCreateCollectionComponent.dialog = true;
    this.addClassCollectionDialog = true;
  }
}
