/* eslint-disable @typescript-eslint/no-explicit-any */
import { IYear } from '@features/years/interfaces';
import { IClass } from '@features/classes/interfaces/i-class';
import { YearService } from '@features/years/services/year.service';
import { ClassService } from '@features/classes/services/class.service';
import { semesterData } from '@features/timetables/helpers/semester-data';
import { SubjectService } from '@features/subjects/services/subject.service';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';
import { AssignmentsService } from '@features/assignments/services/assignments.service';
import { ISubjectForCreateTimeTableWithGeneral } from '@features/subjects/interfaces/i-subject';
import {
  ISemester,
  ITimetableUnitForEditDto,
  ITimetableRequestParameters,
} from '@features/timetables/interfaces';
import {
  ISubject,
  ISubjectForCreateTimeTableWithDoublePeriod,
  ISubjectForCreateTimeTableWithPracticeRoom,
} from '@features/subjects/interfaces';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Input, OnInit, Output, Component, EventEmitter } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';

import { TimetableViewFullComponent } from '../timetable-view-full/timetable-view-full.component';
import { TimetableCreateGeneralFromSubjectsComponent } from '../timetable-create-general-from-subjects/timetable-create-general-from-subjects.component';
import { TimetableCreateGeneralFromSubjectsWithDoublePeriodComponent } from '../timetable-create-general-from-subjects-with-double-period/timetable-create-general-from-subjects-with-double-period.component';
import { TimetableCreateGeneralFromSubjectsWithPracticeRoomComponent } from '../timetable-create-general-from-subjects-with-practice-room/timetable-create-general-from-subjects-with-practice-room.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-create-general',
  standalone: true,
  imports: [
    CoreModule,
    ButtonModule,
    ToolbarModule,
    TabMenuModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    TimetableViewFullComponent,
    TimetableCreateGeneralFromSubjectsComponent,
    TimetableCreateGeneralFromSubjectsWithPracticeRoomComponent,
    TimetableCreateGeneralFromSubjectsWithDoublePeriodComponent,
  ],
  templateUrl: './timetable-create-general.component.html',
  providers: [SubjectService, YearService, ClassService, AssignmentsService],
  styleUrl: './timetable-create-general.component.scss',
})
export class TimetableCreateGeneralComponent implements OnInit {
  @Input() timetableRequestParameters: ITimetableRequestParameters;

  @Input() classes: IClass[] = [];

  @Input() timeTableUnits2Dimensional: ITimetableUnitForEditDto[][] = [];

  @Input() subjects: ISubject[] = [];

  @Input() schoolYears: IYear[] = [];

  @Input()
  subjectForCreateTimeTableWithPracticeRoom: ISubjectForCreateTimeTableWithPracticeRoom[] =
    [];

  @Input()
  subjectForCreateTimeTableWithDoublePeriod: ISubjectForCreateTimeTableWithDoublePeriod[] =
    [];

  @Input()
  subjectForCreateTimeTableWithGeneral: ISubjectForCreateTimeTableWithGeneral[];

  @Output() initiEmptyConstraints = new EventEmitter();

  // * Tab Menu
  items: MenuItem[] | undefined;

  activeItem: MenuItem | undefined;

  semesterData: ISemester[] = semesterData;

  // * Form Generator
  _form: FormGroup = this.fb.group(
    {
      schoolYear: [null, Validators.compose([Validators.required])],
      semester: [null, Validators.compose([Validators.required])],
      minPeriodPerDay: [null, Validators.compose([Validators.required])],
      maxPeriodPerDay: [null, Validators.compose([Validators.required])],
    },
    { validators: [this.onCheckPeriodPerDay] }
  );

  // * init ITimetableUnitForEditDto

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  numWeekdays: number[] = Array.from({ length: 6 }, (v, k) => k + 2);

  startAtsInDay: number[] = Array.from({ length: 10 }, (v, k) => k + 1);

  schoolShifts: ISchoolShift[] = schoolShiftData;

  selectedSchoolShift: ISchoolShift = this.schoolShifts[0];

  constructor(
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    // *  Init Empty Constraints

    this._form.controls['semester'].setValue(this.semesterData[0]);

    this._form.controls['minPeriodPerDay'].setValue(0);

    this._form.controls['maxPeriodPerDay'].setValue(5);

    this._form.controls['schoolYear'].setValue(this.schoolYears[0]);

    this.items = [
      { label: 'Tiết trống', icon: 'pi pi-home' },
      { label: 'Tiết đôi', icon: 'pi pi-chart-line' },
      { label: 'Phòng thực hành', icon: 'pi pi-chart-line' },
      { label: 'Môn học chung', icon: 'pi pi-chart-line' },
    ];

    this.activeItem = this.items[0];
  }

  onInitiEmptyConstraints(): void {
    if (
      this.classes.length > 0 &&
      this.subjects.length > 0 &&
      this.schoolYears.length > 0
    ) {
      this.confirmationDialogService.confirm(event, () => {
        this.initiEmptyConstraints.emit();
      });
    } else {
      this.initiEmptyConstraints.emit();
    }
  }

  numNoAssignTimetableUnits(klass: IClass): number {
    const num = !klass.noAssignTimetableUnits
      ? -1
      : klass.noAssignTimetableUnits;
    return 30 - (klass.periodCount + num);
  }

  onCheckSubjectForCreateTimeTableWithGeneral(
    subject: ISubjectForCreateTimeTableWithGeneral
  ): number {
    return subject.periodCount < subject?.startAtsMorning?.length ||
      subject.periodCount < subject?.startAtsAfternoon?.length
      ? 0
      : 1;
  }

  onCheckTimeTableWithGeneral(
    subjects: ISubjectForCreateTimeTableWithGeneral[]
  ): string[] {
    const result = [];
    subjects?.forEach((item) => {
      for (const classTeacher of item.classTeachers) {
        if (item?.startAtsMorning?.length > 0) {
          for (const startAtSession of item.startAtsMorning) {
            if (
              this.timeTableUnits2Dimensional[classTeacher.class.name][
                startAtSession.startAt
              ]?.isNoAssignTimetableUnits
            ) {
              result.push(
                'Lớp' +
                  classTeacher.class.name +
                  ': ' +
                  startAtSession.name +
                  ', đã được phân công để trống'
              );
            }
          }
        }

        if (item?.startAtsAfternoon?.length > 0) {
          for (const startAtSession of item.startAtsAfternoon) {
            if (
              this.timeTableUnits2Dimensional[classTeacher.class.name][
                startAtSession.startAt
              ]?.isNoAssignTimetableUnits
            ) {
              result.push(
                'Lớp' +
                  classTeacher.class.name +
                  ': ' +
                  startAtSession.name +
                  ', đã được phân công để trống'
              );
            }
          }
        }
      }
    });
    return result;
  }

  onCheckTimeTableUnits2Dimensional(
    timeTableUnits2Dimensional: ITimetableUnitForEditDto[][]
  ): string[] {
    const result = [];
    this.subjectForCreateTimeTableWithGeneral?.forEach((item) => {
      for (const classTeacher of item.classTeachers) {
        if (item?.startAtsMorning?.length > 0) {
          for (const startAtSession of item.startAtsMorning) {
            if (
              timeTableUnits2Dimensional[classTeacher.class.name][
                startAtSession.startAt
              ]?.isNoAssignTimetableUnits
            ) {
              result.push(
                'Lớp' +
                  classTeacher.class.name +
                  ': ' +
                  startAtSession.name +
                  ', đã được phân công môn học'
              );
            }
          }
        }

        if (item?.startAtsAfternoon?.length > 0) {
          for (const startAtSession of item.startAtsAfternoon) {
            if (
              timeTableUnits2Dimensional[classTeacher.class.name][
                startAtSession.startAt
              ]?.isNoAssignTimetableUnits
            ) {
              result.push(
                'Lớp' +
                  classTeacher.class.name +
                  ': ' +
                  startAtSession.name +
                  ', đã được phân công môn học'
              );
            }
          }
        }
      }
    });
    return result;
  }

  onCheckNumNoAssignTimetableUnits(classes: IClass[]): string[] {
    const result = [];
    for (const klass of classes) {
      if (this.numNoAssignTimetableUnits(klass) !== 0) {
        result.push(
          'Lớp ' +
            klass.name +
            ': Tiết trống không hợp lệ - ' +
            -this.numNoAssignTimetableUnits(klass)
        );
      }
    }
    return result;
  }

  isDisabled(): boolean {
    if (
      this.onCheckTimeTableUnits2Dimensional(this.timeTableUnits2Dimensional)
        .length > 0 ||
      this.onCheckTimeTableWithGeneral(
        this.subjectForCreateTimeTableWithGeneral
      ).length > 0 ||
      this.onCheckNumNoAssignTimetableUnits(this.classes).length > 0 ||
      this._form.invalid ||
      this.classes.length <= 0 ||
      this.subjects.length <= 0 ||
      this.schoolYears.length <= 0
    ) {
      return true;
    }

    return false;
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  private onCheckPeriodPerDay(g: FormGroup) {
    if (
      g.get('minPeriodPerDay').value == null ||
      g.get('maxPeriodPerDay').value == null
    ) {
      return null;
    }

    return g.get('minPeriodPerDay').value < g.get('maxPeriodPerDay').value
      ? null
      : { periodPerDay: true };
  }
}
