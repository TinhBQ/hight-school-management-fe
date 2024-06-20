import { data } from '@features/timetables/helpers/data';
import { ITimetableUnit } from '@features/test/employee-list';

import { Input, OnInit, Component } from '@angular/core';

import { TableModule } from 'primeng/table';
import { DragDropModule } from 'primeng/dragdrop';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-edit',
  standalone: true,
  imports: [CoreModule, TableModule, DragDropModule],
  templateUrl: './timetable-edit.component.html',
})
export class TimetableEditComponent implements OnInit {
  @Input() data: ITimetableUnit[] = data;

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  classNames: string[] = [];

  timetableUnits: ITimetableUnit[][] = [];

  ngOnInit(): void {
    // * Sắp xếp mảng theo thứ tự lớp và startAt
    this.data = this.data.sort((a, b) => {
      if (a.className > b.className) {
        return 1;
      } else if (a.className < b.className) {
        return -1;
      }
      return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
    });

    // * Lấy danh sách lớp học
    this.classNames = [...new Set(this.data.map((x) => x.className))];

    // * Khới tạo mảng 2 chiều cho thời khóa biểu
    this.data.forEach((x) => {
      // Ensure the inner array/object exists before assignment
      if (!this.timetableUnits[x.className]) {
        this.timetableUnits[x.className] = [];
      }
      this.timetableUnits[x.className][x.startAt] = x;
    });

    // * Khởi tạo dữ liệu trống
    for (const className of this.classNames) {
      for (let i = 1; i <= 60; i++) {
        if (!this.timetableUnits[className][i]) {
          this.timetableUnits[className][i] = null;
        }
      }
    }
  }

  dragData: ITimetableUnit;

  dragClassName: string;

  dragStartAt: number;

  onDragStart(
    dataCell: ITimetableUnit,
    className: string,
    startAt: number
  ): void {
    this.dragData = dataCell;
    this.dragClassName = className;
    this.dragStartAt = startAt;
  }

  onDragEnd(): void {
    console.log('dragEnd', data);
  }

  onDrop(dropData: ITimetableUnit, className: string, startAt: number): void {
    if (dropData === null) {
      this.timetableUnits[className][startAt] = {
        ...this.dragData,
        startAt: startAt,
        className: className,
      };
      this.timetableUnits[this.dragClassName][this.dragStartAt] = null;
    } else {
      this.timetableUnits[className][startAt] = {
        ...this.dragData,
        startAt: startAt,
        className: className,
      };

      this.timetableUnits[this.dragClassName][this.dragStartAt] = {
        ...dropData,
        startAt: this.dragStartAt,
        className: this.dragClassName,
      };
    }
  }

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }
}
