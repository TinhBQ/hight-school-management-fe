/* eslint-disable @typescript-eslint/no-explicit-any */
import { IYear } from '@features/years/interfaces';
import { ITeacher } from '@features/teachers/interfaces';
import { ISemester } from '@features/timetables/interfaces';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { YearService } from '@features/years/services/year.service';
import { ClassService } from '@features/classes/services/class.service';
import { semesterData } from '@features/timetables/helpers/semester-data';
import { TeacherService } from '@features/teachers/services/teacher.service';
import { IClass, IClassRequestParameters } from '@features/classes/interfaces';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';
import { AssignmentsService } from '@features/assignments/services/assignments.service';
import {
  IAssignment,
  IAssignmentRequestParameters,
} from '@features/assignments/interfaces';

import {
  Input,
  OnInit,
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { MessageNotificationService } from '@core/services/message-notification.service';
import {
  IColumn,
  IPagination,
  IResponseBase,
  ICustomAction,
  IRequestParameters,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

import { AssignmentsTeachingDialogForCreateUpdateComponent } from '../assignments-teaching-dialog-for-create-update/assignments-teaching-dialog-for-create-update.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-assignments-teaching',
  standalone: true,
  imports: [
    CoreModule,
    SmseduCrudComponent,
    AssignmentsTeachingDialogForCreateUpdateComponent,
    DropdownModule,
    CheckboxModule,
  ],
  templateUrl: './assignments-teaching.component.html',
  providers: [
    AssignmentsService,
    ClassService,
    TeacherService,
    YearService,
    MessageNotificationService,
  ],
})
export class AssignmentsTeachingComponent implements OnInit, AfterViewInit {
  @Input() startYear?: number;

  @Input() endYear?: number;

  @Input() semester?: number;

  @Input() classId?: string;

  @Input() teacherId?: string;

  @Input() subjectId?: string;

  @Input() title?: string;

  assigned: boolean = true;

  data: any[] = [];

  requestParameters: IAssignmentRequestParameters = {};

  pagination: IPagination;

  schoolShifts: ISchoolShift[] = schoolShiftData;

  searchString = '';

  searchText$ = new Subject<string>();

  loading: boolean = false;

  isFirstLoad: boolean = true;

  columns: IColumn[] = [];

  result: IResponseBase<IAssignment[]>;

  customActions: ICustomAction[] = [];

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

  // * Classes
  classes: IClass[] = [];

  paginationForClasses: IPagination;

  loadingForClasses: boolean = false;

  requestParametersForClasses: IClassRequestParameters = {
    pageSize: 100,
  };

  // * Teachers
  teachers: ITeacher[] = [];

  paginationForTeachers: IPagination;

  loadingForTeachers: boolean = false;

  requestParametersForTeachers: IRequestParameters = {
    pageSize: 100,
  };

  @ViewChild(SmseduCrudComponent) smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(AssignmentsTeachingDialogForCreateUpdateComponent)
  assignmentsTeachingDialogForCreateUpdateComponent: AssignmentsTeachingDialogForCreateUpdateComponent;

  constructor(
    private assignmentsService: AssignmentsService,
    private classService: ClassService,
    private teacherService: TeacherService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent,
    private yearService: YearService,
    private messageNotificationService: MessageNotificationService
  ) {}

  ngOnInit(): void {
    if (this.semester === 2) {
      this.selectSemester = this.semesterData[1];
    } else {
      this.selectSemester = this.semesterData[0];
    }

    this.requestParameters = {
      ...this.requestParameters,
      startYear: this.startYear,
      endYear: this.endYear,
      semester: this.selectSemester.id,
      classId: this.classId,
      teacherId: this.teacherId,
      subjectId: this.subjectId,
      isNotAssigned: !this.assigned,
    };

    this.requestParametersForClasses = {
      ...this.requestParametersForClasses,
      startYear: this.startYear,
      endYear: this.endYear,
    };

    this.columns = [
      { field: 'teacherName', header: 'Giáo viên', isSort: false },
      { field: 'className', header: 'Lớp học', isSort: false },
      { field: 'subjectName', header: 'Môn học', isSort: false },
      { field: 'periodCount', header: 'Số tiết/Tuần', isSort: false },
      { field: 'schoolShift', header: 'Buổi', isSort: false },
    ];

    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        console.log(packageName);
        this.requestParameters.searchTerm = packageName;
        this.getAssignments(this.requestParameters);
      });

    this.customActions = [
      {
        label: 'Chỉnh sửa',
        icon: 'pi pi-pencil',
        color: 'success',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (evnet: Event, data: any) => {
          this.onShowDialogForEdit(data);
        },
      },

      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        color: 'warning',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (evnet: Event, data: any) => {
          // this.onDeleteClass(evnet, data);
        },
      },
    ];

    this.getYears(this.requestParametersForSchoolYears);
    this.getAssignments(this.requestParameters);
    this.getClasses(this.requestParametersForClasses);
    this.getTeachers(this.requestParametersForTeachers);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onSplashScreenService(): void {
    if (
      this.loadingForTeachers ||
      this.loadingForClasses ||
      this.loadingSchoolYears
    ) {
      this.app.onShowSplashScreenService();
    } else {
      this.app.onHideSplashScreenService();
    }
  }

  // * --------------------- Handel Function ---------------------
  // #region -- Load Assignment --
  onLoadAssignments(event: any): void {
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

    this.getAssignments(this.requestParameters);
  }

  getAssignments(params?: IAssignmentRequestParameters): void {
    this.loading = true;
    this.assignmentsService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.data = this.result.data.map((x) => ({
          ...x,
          schoolShift: x.schoolShift === 0 ? 'Sáng' : 'Chiều',
        }));
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.log(error.toString());
      }
    );
  }
  // #endregion

  // * Get Data Classes
  private getClasses(params?: IClassRequestParameters): void {
    this.loadingForClasses = true;
    this.onSplashScreenService();
    this.classService.find(params).subscribe(
      (response) => {
        this.classes = response.result.data;

        this.paginationForClasses = response.pagination;

        if (this.paginationForClasses?.hasNext) {
          this.requestParametersForClasses.pageSize =
            this.paginationForClasses.totalCount;
          this.getClasses(this.requestParametersForClasses);
        } else {
          this.loadingForClasses = false;
          this.onSplashScreenService();
        }
      },
      (error) => {
        console.log(error.toString());
        this.loadingForClasses = false;
        this.onSplashScreenService();
      }
    );
  }

  // * Get Data Teachers
  private getTeachers(params?: IRequestParameters): void {
    this.loadingForTeachers = true;
    this.onSplashScreenService();
    this.teacherService.find(params).subscribe(
      (response) => {
        this.teachers = response.result.data;

        this.paginationForTeachers = response.pagination;

        if (this.paginationForTeachers?.hasNext) {
          this.requestParametersForTeachers.pageSize =
            this.paginationForTeachers.totalCount;
          this.getTeachers(this.requestParametersForTeachers);
        } else {
          this.loadingForTeachers = false;
          this.onSplashScreenService();
        }
      },
      (error) => {
        console.log(error.toString());
        this.loadingForTeachers = false;
        this.onSplashScreenService();
      }
    );
  }

  // * Get Data Years
  private getYears(params?: IRequestParameters): void {
    this.loadingSchoolYears = true;
    this.onSplashScreenService();
    this.yearService.getYears(params).subscribe(
      (response) => {
        this.schoolYears = response.result.data.map((y) => ({
          ...y,
          name: y.startYear + '-' + y.endYear,
        }));

        this.assignmentsTeachingDialogForCreateUpdateComponent.schoolYears =
          this.schoolYears;

        this.paginationSchoolYears = response.pagination;

        if (this.paginationSchoolYears?.hasNext) {
          this.requestParametersForSchoolYears.pageSize =
            this.paginationSchoolYears.totalCount;

          this.getYears(this.requestParametersForSchoolYears);
        } else {
          if (!this.startYear && !this.endYear) {
            this.selectYear = this.schoolYears[0];
            console.log(this.selectYear);
            this.assignmentsTeachingDialogForCreateUpdateComponent._form.controls[
              'year'
            ].setValue(this.selectYear);
          }

          console.log(this.selectYear);

          this.loadingSchoolYears = false;
          this.onSplashScreenService();
        }
      },
      (error) => {
        console.log(error.toString());
        this.loadingSchoolYears = false;
        this.onSplashScreenService();
      }
    );
  }

  // @ Acition: Show dialog for create
  onShowDialogForCreate(): void {
    this.assignmentsTeachingDialogForCreateUpdateComponent.isDialog = true;
  }

  onShowDialogForEdit(assignment: any): void {
    console.log('assignment', assignment);
    const semester = this.semesterData[assignment.semester];
    const year = {
      startYear: assignment.startYear,
      endYear: assignment.endYear,
      name: assignment.startYear + '-' + assignment.endYear,
    } as IYear;
    const klass = this.classes.find((c) => c.id === assignment.classId);
    const schoolShift = this.schoolShifts.find(
      (s) => s.name === assignment.schoolShift
    );
    const teacher = this.teachers.find((t) => t.id === assignment?.teacherId);

    console.log(teacher);

    this.assignmentsTeachingDialogForCreateUpdateComponent.teachers =
      this.teachers.filter(
        (t) =>
          t.subjectTeachers?.filter(
            (s) => s.subject.id === assignment.subjectId
          ).length > 0
      );

    console.log(
      this.assignmentsTeachingDialogForCreateUpdateComponent.teachers
    );

    this.assignmentsTeachingDialogForCreateUpdateComponent.subjects =
      klass.subjectClasses
        .filter((item) => item.subject.id === assignment.subjectId)
        .map((x) => x.subject);

    this.assignmentsTeachingDialogForCreateUpdateComponent._form.setValue({
      id: assignment.id,
      semester: semester,
      year: year,
      class: klass,
      schoolShift: schoolShift,
      teacher:
        teacher ??
        this.assignmentsTeachingDialogForCreateUpdateComponent.teachers[0],
      subject:
        this.assignmentsTeachingDialogForCreateUpdateComponent.subjects[0],
      periodCount: assignment.periodCount,
    });
    this.assignmentsTeachingDialogForCreateUpdateComponent.isDialog = true;
  }

  onChangeSemester(event: any): void {
    // this.selectYear = event.value;
    this.requestParameters = {
      ...this.requestParameters,
      semester: event.value.id,
    };

    this.getAssignments(this.requestParameters);

    this.assignmentsTeachingDialogForCreateUpdateComponent._form.controls[
      'semester'
    ].setValue(event.value);
  }

  onSave(): void {
    console.log('Bùi Quốc Tĩnh');

    if (!this.assignmentsTeachingDialogForCreateUpdateComponent.isDisabled()) {
      // ! Update class
      if (
        this.assignmentsTeachingDialogForCreateUpdateComponent._form.value.id
      ) {
        console.log('Update');
        this.assignmentsTeachingDialogForCreateUpdateComponent.onSetDTO();
        this.assignmentsService
          .update(
            this.assignmentsTeachingDialogForCreateUpdateComponent._form.value
              .id,
            this.assignmentsTeachingDialogForCreateUpdateComponent.assignmentDto
          )
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.assignmentsTeachingDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Cập nhật phân công thành công!`
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
        const index = this.data.findIndex(
          (x) =>
            x?.subjectId ===
              this.assignmentsTeachingDialogForCreateUpdateComponent._form.value
                .subject?.id &&
            x?.classId ===
              this.assignmentsTeachingDialogForCreateUpdateComponent._form.value
                .class?.id
        );

        console.log(
          'teacherId',
          this.assignmentsTeachingDialogForCreateUpdateComponent._form.value
            .teacher?.id
        );

        console.log(
          'classId',
          this.assignmentsTeachingDialogForCreateUpdateComponent._form.value
            .class?.id
        );
        console.log('index', index);

        if (index !== -1) {
          this.messageNotificationService.showError('Phân công đã tồn tại');
        } else {
          this.assignmentsTeachingDialogForCreateUpdateComponent.onSetDTO();
          this.assignmentsService
            .create(
              this.assignmentsTeachingDialogForCreateUpdateComponent
                .assignmentDto
            )
            .subscribe(
              () => {
                this.smseduCrudComponent.onclear();
                this.assignmentsTeachingDialogForCreateUpdateComponent.onHideDialog();
                this.messageNotificationService.showSuccess(
                  `Thêm phân công thành công!`
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
  }

  onChangeAssigned(event: any): void {
    this.requestParameters = {
      ...this.requestParameters,
      isNotAssigned: !event.checked,
    };

    this.getAssignments(this.requestParameters);
  }
}
