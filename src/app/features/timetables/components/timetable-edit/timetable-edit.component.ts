/* eslint-disable @typescript-eslint/no-explicit-any */
import { data } from '@features/timetables/helpers/data';
import { ITimetableUnit } from '@features/timetables/interfaces';

import { FormGroup, FormControl } from '@angular/forms';
import { Input, OnInit, Component } from '@angular/core';

import { TableModule } from 'primeng/table';
import { DragDropModule } from 'primeng/dragdrop';
import { RadioButtonModule } from 'primeng/radiobutton';

import { CoreModule } from '@core/core.module';

import { TestComponent } from '../test/test.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-edit',
  standalone: true,
  imports: [
    CoreModule,
    TableModule,
    DragDropModule,
    RadioButtonModule,
    TestComponent,
  ],
  templateUrl: './timetable-edit.component.html',
})
export class TimetableEditComponent implements OnInit {
  @Input() data: ITimetableUnit[] = data;

  formGroup!: FormGroup;

  viewMode: any[] = [
    { name: 'Tất cả', key: 'A' },
    { name: 'Lớp học', key: 'L' },
    { name: 'Buổi', key: 'B' },
  ];

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  classes: any[] = [];

  timetableUnits: ITimetableUnit[][] = [];

  ngOnInit(): void {
    // * Sắp xếp mảng theo thứ tự lớp và startAt
    this.data = this.onSortTimeTableUnits(this.data);

    console.log('data', this.data);

    console.log('startAts', this.startAts);

    // * Lấy danh sách lớp học
    this.classes = this.getClassNames(this.data);

    this.timetableUnits = this.initTimeTableUnits2Dimensional(
      this.data,
      this.classes
    );

    console.log('timetableUnits', this.timetableUnits);

    // this.data = this.convertTimeTableUnits2Dimensional(
    //   this.timetableUnits,
    //   this.classes
    // );

    console.log('data', this.data);

    this.formGroup = new FormGroup({
      selectedCategory: new FormControl(),
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

  getClassNames(timetableUnits: ITimetableUnit[]): any[] {
    const uniqueClasses = new Map<
      string,
      { className: string; classId: string }
    >();

    timetableUnits.forEach((unit) => {
      if (!uniqueClasses.has(unit.classId)) {
        uniqueClasses.set(unit.classId, {
          className: unit.className,
          classId: unit.classId,
        });
      }
    });

    return Array.from(uniqueClasses.values());
  }

  initTimeTableUnits2Dimensional(
    timetableUnits: ITimetableUnit[],
    classes: any[]
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
        if (!timeTableUnits2Dimensional[klass.className][i]) {
          timeTableUnits2Dimensional[klass.className][i] = {
            startAt: i,
            classId: klass.classId,
            className: klass.className,
          };
        }
      }
    }

    return timeTableUnits2Dimensional;
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

  onSwap(timetableUnit1: ITimetableUnit, timetableUnit2: ITimetableUnit): void {
    this.timetableUnits[timetableUnit1.className][timetableUnit1.startAt] = {
      ...timetableUnit2,
      startAt: timetableUnit1.startAt,
      className: timetableUnit1.className,
      classId: timetableUnit1.classId,
    };

    this.timetableUnits[timetableUnit2.className][timetableUnit2.startAt] = {
      ...timetableUnit1,
      startAt: timetableUnit2.startAt,
      className: timetableUnit2.className,
      classId: timetableUnit2.classId,
    };
  }

  dragData: ITimetableUnit;

  onDragStart(dataCell: ITimetableUnit): void {
    this.dragData = dataCell;
  }

  onDragEnd(): void {
    console.log('dragEnd', data);
  }

  onDrop(dropData: ITimetableUnit): void {
    console.log('dragData', this.dragData);
    console.log('dragData', dropData);
    this.onSwap(this.dragData, dropData);
    // this.timetableUnits = this.initTimeTableUnits2Dimensional(
    //   this.data,
    //   this.classes
    // );
  }

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }
}
