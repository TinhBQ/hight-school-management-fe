/* eslint-disable @typescript-eslint/no-explicit-any */

import { IYear } from '@features/years/interfaces';
import { YearService } from '@features/years/services/year.service';
import { IClass, IClassRequestParameters } from '@features/classes/interfaces';
import { IAssignmentRequestParameters } from '@features/assignments/interfaces';
import { IAssignmentDtoForEdit } from '@features/assignments/interfaces/i-assignments';
import { AssignmentsService } from '@features/assignments/services/assignments.service';
import { ISubjectForCreateTimeTableWithGeneral } from '@features/subjects/interfaces/i-subject';
import {
  ITimetableUnitForEditDto,
  ITimetableRequestParameters,
} from '@features/timetables/interfaces';
import {
  ISubject,
  ISubjectForCreateTimeTableWithDoublePeriod,
  ISubjectForCreateTimeTableWithPracticeRoom,
} from '@features/subjects/interfaces';

import {
  OnInit,
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { StepsModule } from 'primeng/steps';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { IPagination, IRequestParameters } from '@core/interfaces';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';

import { TimetableForClassComponent } from '../timetable-for-class/timetable-for-class.component';
import { TimetableCreateConfirmComponent } from '../timetable-create-confirm/timetable-create-confirm.component';
import { TimetableCreateGeneralComponent } from '../timetable-create-general/timetable-create-general.component';
import { TimetableCreateClassPrivateComponent } from '../timetable-create-class-private/timetable-create-class-private.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-create',
  standalone: true,
  imports: [
    CoreModule,
    TimetableCreateGeneralComponent,
    TimetableCreateClassPrivateComponent,
    TimetableForClassComponent,
    TimetableCreateConfirmComponent,
    TableModule,
    StepperModule,
    ButtonModule,
    StepsModule,
  ],
  templateUrl: './timetable-create.component.html',
  providers: [YearService, AssignmentsService, ConfirmationDialogService],
})
export class TimetableCreateComponent implements OnInit, AfterViewInit {
  items: MenuItem[] | undefined;

  timetableRequestParameters: ITimetableRequestParameters;

  @ViewChild(TimetableCreateGeneralComponent)
  timetableCreateGeneralComponent: TimetableCreateGeneralComponent;

  timeTableUnits2Dimensional?: ITimetableUnitForEditDto[][] = [];

  timeTableUnits: ITimetableUnitForEditDto[] = [];

  // * Years
  schoolYears: IYear[] = [];

  paginationSchoolYears: IPagination;

  requestParametersForSchoolYears: IRequestParameters = {
    orderBy: 'startYear desc',
  };

  loadingSchoolYears: boolean = false;

  // * Classes
  classes: IClass[] = [];

  paginationForClasses: IPagination;

  loadingForClasses: boolean = false;

  requestParametersForClasses: IAssignmentRequestParameters;

  // * Subject
  subjects: ISubject[] = [];

  subjectForCreateTimeTableWithPracticeRoom: ISubjectForCreateTimeTableWithPracticeRoom[] =
    [];

  subjectForCreateTimeTableWithDoublePeriod: ISubjectForCreateTimeTableWithDoublePeriod[] =
    [];

  subjectForCreateTimeTableWithGeneral: ISubjectForCreateTimeTableWithGeneral[];

  paginationForSubjects: IPagination;

  loadingForSubjects: boolean = false;

  loadingForSubjectsNotSameTeacher: boolean = false;

  requestParametersForSubjects: IClassRequestParameters = {
    pageSize: 50,
  };

  // * Assignments
  assignments: IAssignmentDtoForEdit[] = [];

  loadingForAssignments: boolean = false;

  requestParametersForAssignments: IAssignmentRequestParameters = {
    pageSize: 50,
  };

  constructor(
    private yearService: YearService,
    private assignmentsService: AssignmentsService,
    private cdr: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    public app: AppComponent
  ) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Chỉnh sửa chung',
      },
      {
        label: 'Chỉnh sửa riêng',
      },
      {
        label: 'Tổng thể',
      },
    ];

    // *  Init Empty Constraints
    this.getYears(this.requestParametersForSchoolYears);
  }

  onSplashScreenService(): void {
    if (
      this.loadingForAssignments ||
      this.loadingForClasses ||
      this.loadingForSubjects ||
      this.loadingSchoolYears ||
      this.loadingForSubjectsNotSameTeacher
    ) {
      this.app.onShowSplashScreenService();
    } else {
      this.app.onHideSplashScreenService();
    }
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

        this.paginationSchoolYears = response.pagination;

        this.timetableCreateGeneralComponent._form.controls[
          'schoolYear'
        ].setValue(this.schoolYears[0]);

        if (this.paginationSchoolYears?.hasNext) {
          this.requestParametersForSchoolYears.pageSize =
            this.paginationSchoolYears.totalCount;
          this.getYears(this.requestParametersForSchoolYears);
        } else {
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

  // * Get Data Classes
  private getAllClasses(params?: IAssignmentRequestParameters): void {
    this.loadingForClasses = true;
    this.onSplashScreenService();
    this.assignmentsService.getClasses(params).subscribe(
      (response) => {
        this.classes = response.data.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          } else {
            return -1;
          }
        });

        this.timeTableUnits2Dimensional =
          this.initEmptyTimeTableUnits2Dimensional(this.classes);

        this.timetableRequestParameters = {
          ...this.timetableRequestParameters,
          classIds: this.classes.map((c) => c.id),
        };

        this.loadingForClasses = false;

        this.onSplashScreenService();
      },
      (error) => {
        console.log(error.toString());
        this.loadingForClasses = false;
        this.onSplashScreenService();
      }
    );
  }

  // * init Empty TimeTable Units 2D imensional
  private initEmptyTimeTableUnits2Dimensional(
    classes: IClass[]
  ): ITimetableUnitForEditDto[][] {
    const timeTableUnits2Dimensional: ITimetableUnitForEditDto[][] = [];

    for (const klass of classes) {
      if (!timeTableUnits2Dimensional[klass.name]) {
        timeTableUnits2Dimensional[klass.name] = [];
      }

      for (let i = 1; i <= 60; i++) {
        if (!timeTableUnits2Dimensional[klass.name][i]) {
          timeTableUnits2Dimensional[klass.name][i] = {
            startAt: i,
            classId: klass.id,
            className: klass.name,
          };
        }
      }
    }

    return timeTableUnits2Dimensional;
  }

  // * Get Data Subjects
  private getAllSubjects(params?: IClassRequestParameters): void {
    this.loadingForSubjects = true;
    this.onSplashScreenService();
    this.assignmentsService.getSubjects(params).subscribe(
      (response) => {
        this.subjects = response.data;

        this.subjectForCreateTimeTableWithPracticeRoom = this
          .subjects as ISubjectForCreateTimeTableWithPracticeRoom[];
        this.subjectForCreateTimeTableWithDoublePeriod = this
          .subjects as ISubjectForCreateTimeTableWithDoublePeriod[];

        this.loadingForSubjects = false;
        this.onSplashScreenService();
      },
      (error) => {
        console.log(error.toString());
        this.loadingForSubjects = false;
        this.onSplashScreenService();
      }
    );
  }

  // * Get Data Subjects
  private getSubjectsNotSameTeacher(params?: IRequestParameters): void {
    this.loadingForSubjectsNotSameTeacher = true;
    this.assignmentsService.getSubjectsNotSameTeacher(params).subscribe(
      (response) => {
        this.subjectForCreateTimeTableWithGeneral = response.data;

        this.loadingForSubjectsNotSameTeacher = false;
        this.onSplashScreenService();
      },
      (error) => {
        console.log(error.toString());
        this.loadingForSubjectsNotSameTeacher = true;
        this.onSplashScreenService();
      }
    );
  }

  onInitiEmptyConstraints(): void {
    this.requestParametersForClasses = {
      ...this.requestParametersForClasses,
      startYear:
        this.timetableCreateGeneralComponent._form.value.schoolYear.startYear,
      endYear:
        this.timetableCreateGeneralComponent._form.value.schoolYear.endYear,
      // semester: this.timetableCreateGeneralComponent._form.value.semester.id,
    };

    this.timetableRequestParameters = {
      ...this.timetableRequestParameters,
      startYear:
        this.timetableCreateGeneralComponent._form.value.schoolYear.startYear,
      endYear:
        this.timetableCreateGeneralComponent._form.value.schoolYear.endYear,
      semester: this.timetableCreateGeneralComponent._form.value.semester.id,
      minPeriodPerDay:
        this.timetableCreateGeneralComponent._form.value.minPeriodPerDay,
      maxPeriodPerDay:
        this.timetableCreateGeneralComponent._form.value.maxPeriodPerDay,
    };

    this.getAllClasses(this.requestParametersForClasses);

    this.getAllSubjects(this.requestParametersForClasses);

    this.getSubjectsNotSameTeacher(this.requestParametersForClasses);
  }

  isDisabled(): boolean {
    if (this.timetableCreateGeneralComponent) {
      return this.timetableCreateGeneralComponent?.isDisabled();
    }
    return true;
  }

  onNext(actionNext: any): void {
    this.loadingForAssignments = true;
    this.onSplashScreenService();

    const handelTimeTableUnits2Dimensional = this.timeTableUnits2Dimensional;

    this.requestParametersForAssignments = {
      ...this.requestParametersForAssignments,
      startYear:
        this.timetableCreateGeneralComponent._form.value.schoolYear?.startYear,
      endYear:
        this.timetableCreateGeneralComponent._form.value.schoolYear?.endYear,
      // semester: this.timetableCreateGeneralComponent._form.value.semester.id,
    };

    this.assignmentsService
      .getAllAssignments(this.requestParametersForAssignments)
      .subscribe(
        (response) => {
          this.assignments = response.data as IAssignmentDtoForEdit[];

          if (
            !this.isDisabled() &&
            this.subjectForCreateTimeTableWithGeneral?.length > 0
          ) {
            this.subjectForCreateTimeTableWithGeneral.forEach((item) => {
              for (const classTeacher of item.classTeachers) {
                if (
                  item?.startAtsMorning?.length > 0 &&
                  classTeacher.class.schoolShift === 0
                ) {
                  for (const startAtSession of item.startAtsMorning) {
                    if (
                      !handelTimeTableUnits2Dimensional[
                        classTeacher.class.name
                      ][startAtSession.startAt]?.isNoAssignTimetableUnits
                    ) {
                      const index = this.assignments.findIndex(
                        (assignment) =>
                          assignment.subjectId === item?.subject?.id &&
                          assignment.classId === classTeacher.class?.id &&
                          assignment.teacherId === classTeacher?.teacher?.id
                      );

                      handelTimeTableUnits2Dimensional[classTeacher.class.name][
                        startAtSession.startAt
                      ] = {
                        priority: 0,
                        classId: classTeacher.class?.id,
                        className: classTeacher.class?.name,
                        teacherId: classTeacher?.teacher?.id,
                        teacherName: classTeacher?.teacher?.shortName,
                        subjectId: item?.subject?.id,
                        subjectName: item?.subject?.name,
                        startAt: startAtSession?.startAt,
                        assignmentId: this.assignments[index].id,
                      };

                      this.assignments[index].startAtsMorning =
                        item.startAtsMorning;
                      this.assignments[index].periodCount -= 1;
                    }
                  }
                }

                if (
                  item?.startAtsAfternoon?.length > 0 &&
                  classTeacher.class.schoolShift === 1
                ) {
                  for (const startAtSession of item.startAtsAfternoon) {
                    if (
                      !handelTimeTableUnits2Dimensional[
                        classTeacher.class.name
                      ][startAtSession.startAt]?.isNoAssignTimetableUnits
                    ) {
                      const index = this.assignments.findIndex(
                        (assignment) =>
                          assignment.subjectId === item?.subject?.id &&
                          assignment.classId === classTeacher.class?.id &&
                          assignment.teacherId === classTeacher?.teacher?.id
                      );

                      handelTimeTableUnits2Dimensional[classTeacher.class.name][
                        startAtSession.startAt
                      ] = {
                        priority: 0,
                        classId: classTeacher.class?.id,
                        className: classTeacher.class?.name,
                        teacherId: classTeacher?.teacher?.id,
                        teacherName: classTeacher?.teacher?.shortName,
                        subjectId: item?.subject?.id,
                        subjectName: item?.subject?.name,
                        startAt: startAtSession?.startAt,
                        assignmentId: this.assignments[index].id,
                      };

                      this.assignments[index].startAtsMorning =
                        item.startAtsMorning;
                      this.assignments[index].periodCount -= 1;
                    }
                  }
                }
              }
            });
          }

          const result: ITimetableUnitForEditDto[] = [];

          for (const klass of this.classes) {
            for (let startAt = 1; startAt <= 60; startAt++) {
              result.push(
                handelTimeTableUnits2Dimensional[klass.name][startAt]
              );
            }
          }

          this.timeTableUnits = result;

          this.loadingForAssignments = false;
          this.onSplashScreenService();

          actionNext.emit();
        },
        (error) => {
          console.log(error.toString());
          this.loadingForAssignments = false;
          this.onSplashScreenService();
        }
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPrev(event: any, prevCallback: any) {
    this.confirmationDialogService.confirm(event, () => {
      this.getAllClasses(this.requestParametersForClasses);

      this.getAllSubjects(this.requestParametersForClasses);

      this.getSubjectsNotSameTeacher(this.requestParametersForClasses);

      prevCallback.emit();
    });
  }
}
