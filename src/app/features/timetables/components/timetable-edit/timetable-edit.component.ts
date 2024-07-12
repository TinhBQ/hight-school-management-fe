/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IClass } from '@features/classes/interfaces';
import { ITeacher } from '@features/teachers/interfaces';
import { IGetTimetable, ITimetableUnit } from '@features/timetables/interfaces';
import { TimetablesService } from '@features/timetables/services/timetables.service';

import { Input, OnInit, Component } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule } from 'primeng/dragdrop';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

interface IChoose {
  numWeekday: number;
  startAt: number;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-edit',
  standalone: true,
  imports: [
    CoreModule,
    TableModule,
    DragDropModule,
    DropdownModule,
    MessagesModule,
    ButtonModule,
    DynamicDialogModule,
  ],
  templateUrl: './timetable-edit.component.html',
  styleUrls: ['./timetable-edit.component.scss'],
  providers: [
    DialogService,
    MessageNotificationService,
    ConfirmationDialogService,
    TimetablesService,
  ],
})
export class TimetableEditComponent implements OnInit {
  @Input() data: ITimetableUnit[];

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  selectedClass: IClass;

  classes: IClass[] = [];

  teachers: ITeacher[] = [];

  selectedTeacher1: ITeacher;

  selectedTeacher2: ITeacher;

  choose1: IChoose;

  choose2: IChoose;

  isCheck: boolean = false;

  timetableUnits: ITimetableUnit[][] = [];

  timetableUnitsForClass: ITimetableUnit[][] = [];

  timetableUnitsForTeacher1: ITimetableUnit[][] = [];

  timetableUnitsForTeacher2: ITimetableUnit[][] = [];

  numWeekdays: number[] = Array.from({ length: 6 }, (v, k) => k + 2);

  startAtsInDay: number[] = Array.from({ length: 10 }, (v, k) => k + 1);

  dataGetTimetable?: IGetTimetable;

  constructor(
    private config: DynamicDialogConfig,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    private timetableService: TimetablesService
  ) {}

  ngOnInit(): void {
    if (this.config.data && this.config.data.timetable) {
      console.log('classId', this.config.data);
      this.dataGetTimetable = this.config.data.timetable as IGetTimetable;
      this.data = this.config.data?.timetable
        ?.timetableUnits as ITimetableUnit[];
      this.data = this.onSortTimeTableUnits(this.data);
      console.log('data', this.data);
    }

    // * Sắp xếp mảng theo thứ tự lớp và startAt

    // * Lấy danh sách lớp học
    this.classes = this.getUniqueClasses(this.data);

    this.selectedClass = this.classes[0];

    this.timetableUnitsForClass =
      this.initEmptyTimeTableUnits2DimensionalForClass(
        this.numWeekdays,
        this.onFilterByClass(this.data, this.selectedClass),
        this.selectedClass
      );

    this.teachers = this.getUniqueTeachers(this.data);

    // this.selectedTeacher1 = this.teachers[0];

    // this.selectedTeacher2 = this.teachers[2];

    // this.timetableUnitsForTeacher1 =
    //   this.initEmptyTimeTableUnits2DimensionalForTeacher(
    //     this.numWeekdays,
    //     this.onFilterByTeacher(this.data, this.selectedTeacher1),
    //     this.selectedTeacher1
    //   );

    // this.timetableUnitsForTeacher2 =
    //   this.initEmptyTimeTableUnits2DimensionalForTeacher(
    //     this.numWeekdays,
    //     this.onFilterByTeacher(this.data, this.selectedTeacher2),
    //     this.selectedTeacher2
    //   );

    this.timetableUnits = this.initTimeTableUnits2Dimensional(
      this.data,
      this.classes
    );
  }

  onSave(event: any): void {
    this.dataGetTimetable = {
      ...this.dataGetTimetable,
      timetableUnits: this.data,
    };
    this.confirmationDialogService.confirm(event, () => {
      this.timetableService.updateTimeTable(this.dataGetTimetable).subscribe(
        () => {
          this.messageNotificationService.showSuccess(`cập nhật thàn công!`);
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

  onSortTimeTableUnits(timetableUnits: ITimetableUnit[]): ITimetableUnit[] {
    return timetableUnits.sort((a, b) => {
      if (a.className > b.className) {
        return 1;
      } else if (a.className < b.className) {
        return -1;
      }
      return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
    });
  }

  getUniqueTeachers(timetableUnits: ITimetableUnit[]): ITeacher[] {
    const teacherMap: Map<string, string> = new Map();

    timetableUnits.forEach((item) => {
      if (!teacherMap.has(item.teacherId)) {
        teacherMap.set(item.teacherId, item.teacherName);
      }
    });

    return Array.from(teacherMap, ([teacherId, teacherName]) => ({
      id: teacherId,
      shortName: teacherName,
    })) as ITeacher[];
  }

  getUniqueClasses(timetableUnits: ITimetableUnit[]): IClass[] {
    const classMap: Map<string, string> = new Map();

    timetableUnits.forEach((item) => {
      if (!classMap.has(item.classId)) {
        classMap.set(item.classId, item.className);
      }
    });

    return Array.from(classMap, ([classId, className]) => ({
      id: classId,
      name: className,
    })) as IClass[];
  }

  initTimeTableUnits2Dimensional(
    timetableUnits: ITimetableUnit[],
    classes: IClass[]
  ): ITimetableUnit[][] {
    const timeTableUnits2Dimensional: ITimetableUnit[][] = [];

    const dataSort = this.onSortTimeTableUnits(timetableUnits);

    dataSort.forEach((x) => {
      if (!timeTableUnits2Dimensional[x?.className]) {
        timeTableUnits2Dimensional[x?.className] = [];
      }
      timeTableUnits2Dimensional[x.className][x.startAt] = x;
    });

    for (const klass of classes) {
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

  private initEmptyTimeTableUnits2DimensionalForClass(
    numWeekdays: number[],
    timetableUnits: ITimetableUnit[],
    klass: IClass
  ): ITimetableUnit[][] {
    const timeTableUnits2Dimensional: ITimetableUnit[][] = [];

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
            // timeTableUnits2Dimensional[num][i] = {
            //   startAt: i + (num - 2) * 10,
            //   classId: this.klass.id,
            //   className: this.klass.name,
            // };
            timeTableUnits2Dimensional[num][i] = {
              ...timetableUnits[numIndex],
            };
          }
        }
      }
    }

    return timeTableUnits2Dimensional;
  }

  onFilterByClass(
    timetableUnits: ITimetableUnit[],
    klass: IClass
  ): ITimetableUnit[] {
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

  private initEmptyTimeTableUnits2DimensionalForTeacher(
    numWeekdays: number[],
    timetableUnits: ITimetableUnit[],
    teacher: ITeacher
  ): ITimetableUnit[][] {
    const timeTableUnits2Dimensional: ITimetableUnit[][] = [];

    timetableUnits.forEach((x) => {
      if (!timeTableUnits2Dimensional[x.teacherName]) {
        timeTableUnits2Dimensional[x.teacherName] = [];
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
              teacherId: teacher.id,
              teacherName: teacher.shortName,
            };
          } else {
            // timeTableUnits2Dimensional[num][i] = {
            //   startAt: i + (num - 2) * 10,
            //   classId: this.klass.id,
            //   className: this.klass.name,
            // };
            timeTableUnits2Dimensional[num][i] = {
              ...timetableUnits[numIndex],
            };
          }
        }
      }
    }

    return timeTableUnits2Dimensional;
  }

  onFilterByTeacher(
    timetableUnits: ITimetableUnit[],
    teacher: ITeacher
  ): ITimetableUnit[] {
    return timetableUnits
      .filter((x) => x.teacherName === teacher.shortName)
      .sort((a, b) => {
        if (a.teacherName > b.teacherName) {
          return 1;
        } else if (a.teacherName < b.teacherName) {
          return -1;
        }
        return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
      });
  }

  convertTimeTableUnits2Dimensional(
    timetableUnits: ITimetableUnit[][],
    classes: any[]
  ): ITimetableUnit[] {
    const result = [];
    for (const klass of classes) {
      result.push(...timetableUnits[klass.className]);
    }
    return result;
  }

  getTimeTableUnitsByClassName(
    timetableUnits: ITimetableUnit[],
    className: string
  ): ITimetableUnit[] {
    return timetableUnits.filter((x) => x.className === className);
  }

  // onSwap(timetableUnit1: ITimetableUnit, timetableUnit2: ITimetableUnit): void {
  //   this.timetableUnits[timetableUnit1.className][timetableUnit1.startAt] = {
  //     ...timetableUnit2,
  //     startAt: timetableUnit1.startAt,
  //     className: timetableUnit1.className,
  //     classId: timetableUnit1.classId,
  //   };

  //   this.timetableUnits[timetableUnit2.className][timetableUnit2.startAt] = {
  //     ...timetableUnit1,
  //     startAt: timetableUnit2.startAt,
  //     className: timetableUnit2.className,
  //     classId: timetableUnit2.classId,
  //   };
  // }

  // dragData: ITimetableUnit;

  // onDragStart(dataCell: ITimetableUnit): void {
  //   this.dragData = dataCell;
  // }

  // onDragEnd(): void {
  //   console.log('dragEnd', data);
  // }

  // onDrop(dropData: ITimetableUnit): void {
  //   console.log('dragData', this.dragData);
  //   console.log('dragData', dropData);
  //   this.onSwap(this.dragData, dropData);
  //   // this.timetableUnits = this.initTimeTableUnits2Dimensional(
  //   //   this.data,
  //   //   this.classes
  //   // );
  // }

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }

  getNameAssignment(timetableUnit: ITimetableUnit): string {
    if (!timetableUnit || !timetableUnit?.subjectName) {
      return '';
    }
    return timetableUnit?.subjectName + ' - ' + timetableUnit?.teacherName;
  }

  getNameAssignmentTeacher(timetableUnit: ITimetableUnit): string {
    if (!timetableUnit || !timetableUnit?.subjectName) {
      return '';
    }
    return timetableUnit?.subjectName + ' - ' + timetableUnit?.className;
  }

  onCellClickClass1(event: any, data1: any, num: any, startAt: any): void {
    this.choose1 = {
      numWeekday: num,
      startAt: startAt,
    };
    console.log('onCellClick', event, data1, num, startAt);
    this.selectedTeacher1 = {
      id: data1.teacherId,
      shortName: data1.teacherName,
    };

    this.timetableUnitsForTeacher1 =
      this.initEmptyTimeTableUnits2DimensionalForTeacher(
        this.numWeekdays,
        this.onFilterByTeacher(this.data, this.selectedTeacher1),
        this.selectedTeacher1
      );

    this.isCheck = this.isChecked();
  }

  onCellClickClass2(event: any, data1: any, num: any, startAt: any): void {
    this.choose2 = {
      numWeekday: num,
      startAt: startAt,
    };
    console.log('onCellClick', event, data1, num, startAt);
    this.selectedTeacher2 = {
      id: data1.teacherId,
      shortName: data1.teacherName,
    };

    this.timetableUnitsForTeacher2 =
      this.initEmptyTimeTableUnits2DimensionalForTeacher(
        this.numWeekdays,
        this.onFilterByTeacher(this.data, this.selectedTeacher2),
        this.selectedTeacher2
      );

    this.isCheck = this.isChecked();
  }

  isChecked(): boolean {
    const teacher1Choose1 =
      this.timetableUnitsForTeacher1[this.choose1?.numWeekday][
        this.choose1?.startAt
      ];

    const teacher1Choose2 =
      this.timetableUnitsForTeacher1[this.choose2?.numWeekday][
        this.choose2?.startAt
      ];

    const teacher2Choose1 =
      this.timetableUnitsForTeacher2[this.choose1?.numWeekday][
        this.choose1?.startAt
      ];

    const teacher2Choose2 =
      this.timetableUnitsForTeacher2[this.choose2?.numWeekday][
        this.choose2?.startAt
      ];

    if (
      !!teacher1Choose1 &&
      (!teacher1Choose2.className ||
        teacher1Choose1.className === teacher1Choose2.className) &&
      !!teacher2Choose2 &&
      (!teacher2Choose1.className ||
        teacher2Choose2.className === teacher2Choose1.className)
    )
      return true;

    return false;
  }

  onClassChange(event: any): void {
    this.timetableUnitsForClass =
      this.initEmptyTimeTableUnits2DimensionalForClass(
        this.numWeekdays,
        this.onFilterByClass(this.data, event.value),
        event.value
      );

    this.timetableUnitsForTeacher1 = [];
    this.timetableUnitsForTeacher2 = [];
    this.selectedTeacher1 = null;
    this.selectedTeacher2 = null;
    this.choose1 = null;
    this.choose2 = null;
    this.isCheck = false;
  }

  onSwap(): void {
    const index1 = this.data.findIndex(
      (x) =>
        x.id ===
        this.timetableUnitsForClass[this.choose1?.numWeekday][
          this.choose1?.startAt
        ].id
    );

    const index2 = this.data.findIndex(
      (x) =>
        x.id ===
        this.timetableUnitsForClass[this.choose2?.numWeekday][
          this.choose2?.startAt
        ].id
    );

    const temp = this.data[index1];
    this.data[index1] = {
      ...this.data[index1],
      startAt: this.data[index2].startAt,
    };

    this.data[index2] = {
      ...this.data[index2],
      startAt: temp.startAt,
    };

    this.data = this.onSortTimeTableUnits(this.data);

    this.timetableUnitsForClass =
      this.initEmptyTimeTableUnits2DimensionalForClass(
        this.numWeekdays,
        this.onFilterByClass(this.data, this.selectedClass),
        this.selectedClass
      );

    this.timetableUnitsForTeacher1 = [];
    this.timetableUnitsForTeacher2 = [];
    this.selectedTeacher1 = null;
    this.selectedTeacher2 = null;
    this.choose1 = null;
    this.choose2 = null;
    this.isCheck = false;
  }
}
