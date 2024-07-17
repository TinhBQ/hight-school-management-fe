/* eslint-disable @typescript-eslint/no-unused-vars */
import { IClass } from '@features/classes/interfaces';
import { IAssignmentDtoForEdit } from '@features/assignments/interfaces/i-assignments';
import {
  IStartAtSession,
  ITimetableUnitForEditDto,
} from '@features/timetables/interfaces';
import { ConvertStartAtSessionPipe } from '@features/timetables/pipes/convert-start-at-session.pipe';

import { Input, OnInit, Output, Component, EventEmitter } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';

import { IColumn } from '@core/interfaces';
import { CoreModule } from '@core/core.module';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

import { TimetableForClassComponent } from '../timetable-for-class/timetable-for-class.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-create-class-private',
  standalone: true,
  imports: [
    CoreModule,
    ToolbarModule,
    DropdownModule,
    TimetableForClassComponent,
    SmseduCrudComponent,
    ConvertStartAtSessionPipe,
    ButtonModule,
    TagModule,
  ],
  templateUrl: './timetable-create-class-private.component.html',
  providers: [MessageNotificationService],
})
export class TimetableCreateClassPrivateComponent implements OnInit {
  @Input() timeTableUnits: ITimetableUnitForEditDto[] = [];

  @Input() classes: IClass[] = [];

  @Input() assignments: IAssignmentDtoForEdit[] = [];

  @Output() initiEmptyConstraints = new EventEmitter();

  columns: IColumn[] = [];

  selectedClass: IClass;

  timeTableUnits2Dimensional: ITimetableUnitForEditDto[][] = [];

  numWeekdays: number[] = Array.from({ length: 6 }, (v, k) => k + 2);

  selectAssignments: IAssignmentDtoForEdit[] = [];

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  startAtsAfternoon: IStartAtSession[] = [];

  startAtsMorning: IStartAtSession[] = [];

  constructor(private messageNotificationService: MessageNotificationService) {}

  ngOnInit(): void {
    this.selectedClass = this.classes[0];

    this.timeTableUnits2Dimensional = this.initEmptyTimeTableUnits2Dimensional(
      this.numWeekdays,
      this.onFilterByClass(this.timeTableUnits, this.selectedClass),
      this.selectedClass
    );

    this.selectAssignments = this.getAssignmentsWithClass(
      this.assignments,
      this.selectedClass
    );

    this.columns = [
      { field: 'subjectName', header: 'Môn học', isSort: false },
      { field: 'teacherName', header: 'Giáo viên', isSort: false },
      { field: 'periodCount', header: 'Số tiết/Tuần', isSort: false },
      {
        field:
          this.selectedClass.schoolShift === 0
            ? 'startAtsMorning'
            : 'startAtsAfternoon',
        header:
          this.selectedClass.schoolShift === 0 ? 'Buổi sáng' : 'Buổi chiều',
        isSort: false,
        pipe: new ConvertStartAtSessionPipe(),
        typeEidt: 'multiSelect',
        options: {
          data:
            this.selectedClass.schoolShift === 0
              ? this.startAtsMorning
              : this.startAtsAfternoon,
          onChange: this.onChangeMultiple.bind(this),
        },
      },
    ];

    this.startAts.forEach((startAt) => {
      const a = Math.ceil(startAt / 10) + 1;
      const b = startAt % 10 === 0 ? 10 : startAt % 10;
      if (b <= 5) {
        this.startAtsMorning.push({
          startAt,
          name: 'Thứ ' + a + ' - Tiết' + b,
        });
      } else {
        this.startAtsAfternoon.push({
          startAt,
          name: 'Thứ ' + a + ' - Tiết ' + b,
        });
      }
    });
  }

  onFilterByClass(
    timetableUnits: ITimetableUnitForEditDto[],
    klass: IClass
  ): ITimetableUnitForEditDto[] {
    return timetableUnits
      .filter((x) => x.className === klass.name)
      .sort((a, b) => {
        if (a.className > b.className) {
          return 1;
        } else if (a.className < b.className) {
          return -1;
        }
        return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
      });
  }

  private initEmptyTimeTableUnits2Dimensional(
    numWeekdays: number[],
    timetableUnits: ITimetableUnitForEditDto[],
    klass: IClass
  ): ITimetableUnitForEditDto[][] {
    const timeTableUnits2Dimensional: ITimetableUnitForEditDto[][] = [];

    timetableUnits.forEach((x) => {
      if (!timeTableUnits2Dimensional[x.className]) {
        timeTableUnits2Dimensional[x.className] = [];
      }
    });

    for (const num of numWeekdays) {
      if (!timeTableUnits2Dimensional[num]) {
        timeTableUnits2Dimensional[num] = [];
      }

      for (let i = 1; i <= 10; i++) {
        if (!timeTableUnits2Dimensional[num][i]) {
          const numIndex = timetableUnits.findIndex(
            (x) => x.startAt === i + (num - 2) * 10
          );

          if (numIndex === -1) {
            timeTableUnits2Dimensional[num][i] = {
              startAt: i + (num - 2) * 10,
              classId: klass.id,
              className: klass.name,
            };
          } else {
            timeTableUnits2Dimensional[num][i] = {
              ...timetableUnits[numIndex],
            };
          }
        }
      }
    }

    return timeTableUnits2Dimensional;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange(event: any): void {
    this.selectedClass = event.value;
    this.timeTableUnits2Dimensional = this.initEmptyTimeTableUnits2Dimensional(
      this.numWeekdays,
      this.onFilterByClass(this.timeTableUnits, event.value),
      event.value
    );

    this.selectAssignments = this.getAssignmentsWithClass(
      this.assignments,
      event.value
    );

    this.columns = [
      { field: 'subjectName', header: 'Môn học', isSort: false },
      { field: 'teacherName', header: 'Giáo viên', isSort: false },
      { field: 'periodCount', header: 'Số tiết/Tuần', isSort: false },
      {
        field:
          this.selectedClass.schoolShift === 0
            ? 'startAtsMorning'
            : 'startAtsAfternoon',
        header:
          this.selectedClass.schoolShift === 0 ? 'Buổi sáng' : 'Buổi chiều',
        isSort: false,
        pipe: new ConvertStartAtSessionPipe(),
        typeEidt: 'multiSelect',
        options: {
          data:
            this.selectedClass.schoolShift === 0
              ? this.startAtsMorning
              : this.startAtsAfternoon,
          onChange: this.onChangeMultiple.bind(this),
        },
      },
    ];
  }

  getAssignmentsWithClass(
    assignments: IAssignmentDtoForEdit[],
    klass: IClass
  ): IAssignmentDtoForEdit[] {
    return assignments.filter((x) => x.className === klass.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeMultiple(event: any, data: any): void {
    console.log(event, data);
    const { originalEvent } = event;

    const index = this.timeTableUnits.findIndex(
      (a) =>
        a.classId === data.classId && a.startAt === originalEvent.option.startAt
    );

    if (data.periodCount <= 0) {
      this.messageNotificationService.showWarn(
        `Số tiết/Tuần đã phân công hết.`
      );
      if (data.schoolShift === 0) {
        data.startAtsMorning.pop();
      } else {
        data.startAtsAfternoon.pop();
      }
    } else {
      if (originalEvent.selected == true) {
        if (
          !!this.timeTableUnits[index].teacherName ||
          !!this.timeTableUnits[index].subjectName ||
          !!this.timeTableUnits[index].priority ||
          !!this.timeTableUnits[index].teacherId ||
          !!this.timeTableUnits[index].subjectId
        ) {
          this.messageNotificationService.showWarn(`Đã có môn học tồn tại`);
          if (data.schoolShift === 0) {
            data.startAtsMorning.pop();
          } else {
            data.startAtsAfternoon.pop();
          }
        } else if (this.timeTableUnits[index].isNoAssignTimetableUnits) {
          this.messageNotificationService.showWarn(`Đã phân công môn trống`);
          if (data.schoolShift === 0) {
            data.startAtsMorning.pop();
          } else {
            data.startAtsAfternoon.pop();
          }
        } else {
          data.periodCount = data.periodCount - 1;

          this.timeTableUnits[index] = {
            ...this.timeTableUnits[index],
            priority: 0,
            teacherId: data?.teacherId,
            teacherName: data?.shortName,
            subjectId: data?.subjectId,
            subjectName: data?.subjectName,
            assignmentId: data?.id,
          };
        }
      } else {
        data.periodCount = data.periodCount + 1;

        this.timeTableUnits[index] = {
          ...this.timeTableUnits[index],
          priority: null,
          teacherId: null,
          teacherName: null,
          subjectId: null,
          subjectName: null,
          assignmentId: null,
        };
      }
    }
  }

  onSave(): void {
    this.timeTableUnits2Dimensional = this.initEmptyTimeTableUnits2Dimensional(
      this.numWeekdays,
      this.onFilterByClass(this.timeTableUnits, this.selectedClass),
      this.selectedClass
    );

    this.selectAssignments = this.getAssignmentsWithClass(
      this.assignments,
      this.selectedClass
    );
  }
}
