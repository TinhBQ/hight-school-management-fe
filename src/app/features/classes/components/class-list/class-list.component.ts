/* eslint-disable @typescript-eslint/no-explicit-any */
import { read, utils, WorkBook, WorkSheet } from 'xlsx';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClassService } from '@features/classes/services/class.service';
import { IClass, IClassDto } from '@features/classes/interfaces/i-class';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OnInit, Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';
import {
  IColumn,
  IPagination,
  IResponseBase,
  IRequestParameters,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    DialogModule,
    DropdownModule,
    InputMaskModule,
    FormsModule,
    SmseduCrudComponent,
  ],
  templateUrl: './class-list.component.html',
  providers: [
    ClassService,
    MessageNotificationService,
    ConfirmationDialogService,
  ],
})
export class ClassListComponent implements OnInit {
  result: IResponseBase<IClass[]>;

  pagination: IPagination;

  columns: IColumn[] = [];

  data: any[] = [];

  requestParameters: IRequestParameters;

  grades: number[] = [10, 11, 12];

  schoolShifts: ISchoolShift[] = schoolShiftData;

  klass: IClassDto;

  classDtos: IClassDto[] = [];

  selectedClasses: IClass[] = [];

  loading: boolean = false;

  searchClass: string = '';

  searchText$ = new Subject<string>();

  isFirstLoad: boolean = true;

  classDialog: boolean = false;

  addClassCollectionDialog: boolean = false;

  excelData: any[] = [];

  // * Form Generator: Class
  classForm: FormGroup = this.fb.group(
    {
      id: [null],
      name: [null, Validators.compose([Validators.required])],
      grade: [null, Validators.compose([Validators.required])],
      schoolShift: [null, Validators.compose([Validators.required])],
      year: [null, Validators.compose([Validators.required])],
    },
    {
      validators: [this.onCheckClassName, this.onCheckClassYear],
      // Thêm validator tại đây
    }
  );

  @ViewChild(SmseduCrudComponent) smseduCrudComponent: SmseduCrudComponent;

  // * constructor
  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService
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
        }));
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }

  // * --------------------- Handle Search Item --------------------
  getSearchValue(event: Event): string {
    this.searchClass = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }

  onSearch(packageName: string) {
    this.searchText$.next(packageName);
  }

  // * --------------------- Clear Table --------------------

  onClear(): void {
    this.smseduCrudComponent.onclear();
  }

  // * --------------------- Handel action --------------------

  // @ Acition: Save Class
  onSaveClass(): void {
    if (this.classForm.valid) {
      // ! Update class
      if (this.classForm.value.id) {
        this.onSetClassDTO();
        this.classService.update(this.classForm.value.id, this.klass).subscribe(
          () => {
            this.onClear();
            this.onHideDialog();
            this.messageNotificationService.showSuccess(
              `Cập nhật lớp học ${this.classForm.value.name} thành công!`
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
        this.onSetClassDTO();
        this.classService.create(this.klass).subscribe(
          () => {
            this.onClear();
            this.onHideDialog();
            this.messageNotificationService.showSuccess(
              `Thêm lớp học ${this.classForm.value.name} thành công!`
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
      console.log(this.classDtos);
      this.confirmationDialogService.confirm(event, () => {
        this.classService.createCollection(this.classDtos).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách lớp tành công!'
            );
            this.addClassCollectionDialog = false;
            this.excelData = [];
            this.onClear();
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
          this.onClear();
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
              this.onClear();
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

  // @ Acition: Hide dialog
  onHideDialog(): void {
    this.classDialog = false;
  }

  // @ Acition: Show dialog for create
  onShowDialogForCreate(): void {
    this.classForm.setValue({
      id: null,
      name: null,
      grade: null,
      schoolShift: null,
      year: null,
    });
    this.classDialog = true;
  }

  // @ Acition: Show dialog for eidt class
  onShowDialogForEdit(klass: any): void {
    this.classForm.setValue({
      id: klass.id,
      name: klass.name,
      grade: klass.grade,
      schoolShift:
        klass.schoolShift.toString() === 'Sáng'
          ? schoolShiftData[0]
          : schoolShiftData[1],
      year: klass.year,
    });
    this.classDialog = true;
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
            schoolShift: this.schoolShifts.find((x) => {
              console.log(x.name.toString(), row['Buổi'].toString());
              return x.name.toString() === row['Buổi'].toString();
            }),
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
    this.addClassCollectionDialog = true;
  }

  // @ Acition: delete row data in table
  onRemoveRowData(event: Event, rowData: any): void {
    if (this.excelData.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.excelData = this.excelData.filter((x) => x !== rowData);
      });
    } else {
      this.addClassCollectionDialog = false;
    }
  }

  // * ---------------------  Custom validation function --------------------

  isCheckClassNameAndGrade(name?: string, grade?: string): boolean {
    return name == null ||
      grade == null ||
      name.slice(0, 2).toString() !== grade.toString()
      ? false
      : true;
  }

  isCheckClassNameAndGradeColection(): boolean {
    return this.excelData.every((x) =>
      this.isCheckClassNameAndGrade(x.name, x.grade)
    );
  }

  isCheckClassNotNull(): boolean {
    return this.excelData.every(
      (x) =>
        x.name != null &&
        x.grade != null &&
        x.schoolShift != null &&
        x.year != null &&
        x.name != '' &&
        x.grade != '' &&
        x.schoolShift != '' &&
        x.year != ''
    );
  }

  isCheckClassYear(year: string): boolean {
    return year == null ||
      !/^\d+$/.test(year.slice(0, 4)) ||
      !/^\d+$/.test(year.slice(5, 9)) ||
      parseInt(year.slice(0, 4)) + 1 != parseInt(year.slice(5, 9))
      ? false
      : true;
  }

  isCheckClassYearColection(): boolean {
    return this.excelData.every((x) => this.isCheckClassYear(x.year));
  }

  onCheckClassName(g: FormGroup) {
    if (g.get('name').value == null || g.get('grade').value == null) {
      return null;
    }

    return g.get('name').value.slice(0, 2) == g.get('grade').value
      ? null
      : { checkClassName: true };
  }

  onCheckClassYear(g: FormGroup) {
    if (g.get('year').value == null) {
      return null;
    }

    if (!/^\d+$/.test(g.get('year').value.slice(0, 4))) {
      return { checkClassYear: true };
    }

    if (!/^\d+$/.test(g.get('year').value.slice(5, 9))) {
      return { checkClassYear: true };
    }

    return parseInt(g.get('year').value.slice(0, 4)) + 1 ==
      parseInt(g.get('year').value.slice(5, 9))
      ? null
      : { checkClassYear: true };
  }

  // * --------------------- Function Helper --------------------
  onSetClassDTO(): void {
    this.klass = {
      name: this.classForm.value.name,
      grade: this.classForm.value.grade,
      schoolShift: this.classForm.value.schoolShift.id,
      startYear: parseInt(this.classForm.value.year.slice(0, 4)),
      endYear: parseInt(this.classForm.value.year.slice(5, 9)),
    };
  }
}
