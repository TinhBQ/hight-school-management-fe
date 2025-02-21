import { ITeacher } from '@features/teachers/interfaces';
import { teachingTimeData } from '@features/timetables/helpers/teaching-time-data';
import {
  ITeachingTime,
  ITimetableUnit,
  IConstraintError,
} from '@features/timetables/interfaces';

import { Input, OnInit, Component } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { CoreModule } from '@core/core.module';
import { TableExportService } from '@core/services/table-export.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-view-for-teacher',
  standalone: true,
  imports: [
    CoreModule,
    ToolbarModule,
    ButtonModule,
    DropdownModule,
    SplitButtonModule,
    OverlayPanelModule,
  ],
  templateUrl: './timetable-view-for-teacher.component.html',
  providers: [TableExportService],
})
export class TimetableViewForTeacherComponent implements OnInit {
  @Input() data: ITimetableUnit[];

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  numWeekdays: number[] = Array.from({ length: 6 }, (v, k) => k + 2);

  startAtsInDay: number[] = Array.from({ length: 10 }, (v, k) => k + 1);

  teachers: ITeacher[] = [];

  selectTeacher: ITeacher;

  timetableUnits: ITimetableUnit[][] = [];

  teachingTimes: ITeachingTime[] = teachingTimeData;

  exportItem: MenuItem[] = [];

  constructor(private tableExportService: TableExportService) {}

  ngOnInit(): void {
    this.data = this.data.sort((a, b) => {
      if (a.className > b.className) {
        return 1;
      } else if (a.className < b.className) {
        return -1;
      }
      return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
    });

    // * Lấy danh sách lớp học
    this.teachers = this.getUniqueTeacher(this.data);

    this.selectTeacher = this.teachers[0];

    this.timetableUnits = this.initEmptyTimeTableUnits2Dimensional(
      this.numWeekdays,
      this.onFilterByTeacher(this.data, this.selectTeacher),
      this.selectTeacher
    );

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

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }

  getUniqueTeacher(timetableUnits: ITimetableUnit[]): ITeacher[] {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTeacherChange(event: any): void {
    this.timetableUnits = this.initEmptyTimeTableUnits2Dimensional(
      this.numWeekdays,
      this.onFilterByTeacher(this.data, event.value),
      event.value
    );
  }

  private initEmptyTimeTableUnits2Dimensional(
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

  getNameAssignment(timetableUnit: ITimetableUnit): string {
    if (!timetableUnit || !timetableUnit?.subjectName) {
      return '';
    }
    return timetableUnit?.subjectName + ' - ' + timetableUnit?.className;
  }

  getTeachingTimeName(num: number): string {
    return this.teachingTimes.find((x) => x.id === num)?.name;
  }

  // #region -- Handel Export Data --
  // @ Acition: Export Excel
  onExportExcel(): void {
    const result = [];
    for (let startAt = 1; startAt <= 10; startAt++) {
      const obj: object = {};
      for (const num of this.numWeekdays) {
        obj['Thứ ' + num] = this.getNameAssignment(
          this.timetableUnits[num][startAt]
        );
      }

      result.push({
        Tiết: this.onHandelStartAt(startAt),
        'Thời gian': this.getTeachingTimeName(this.onHandelStartAt(startAt)),
        ...obj,
      });
    }

    this.tableExportService.exportExcel(
      result,
      'timetable-view-for-school-shift'
    );
  }

  // @ Acition: Export PDf
  onExportPDF(): void {
    const result = [];
    for (let startAt = 1; startAt <= 10; startAt++) {
      const obj: object = {};
      for (const num of this.numWeekdays) {
        obj['Thứ ' + num] = this.getNameAssignment(
          this.timetableUnits[num][startAt]
        );
      }

      result.push({
        Tiết: this.onHandelStartAt(startAt),
        'Thời gian': this.getTeachingTimeName(this.onHandelStartAt(startAt)),
        ...obj,
      });
    }
    const headers = [
      'Tiết',
      'Thời gian',
      ...this.numWeekdays.map((x) => 'Thứ ' + x),
    ];
    const rows = result.map((row) => headers.map((col) => row[col]));
    this.tableExportService.exportPdf(
      headers,
      rows,
      'timetable-view-for-teacher',
      'Thời khóa biểu Giáo viên ' + this.selectTeacher?.fullName
    );
  }
  // #endregion

  getStringConstraintError(item: IConstraintError): string {
    const code = item?.code;
    const hardConstraint = item?.isHardConstraint
      ? 'Ràng buộc cứng'
      : 'Ràng buộc mềm';
    const description = item?.description;

    return `[${code}] ${hardConstraint}: ${description}`;
  }

  isHardConstraint(item: IConstraintError[]): boolean {
    return item.some((x) => x.isHardConstraint === true);
  }
}
