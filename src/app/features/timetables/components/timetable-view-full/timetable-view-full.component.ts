/* eslint-disable @typescript-eslint/no-explicit-any */
import { IClass } from '@features/classes/interfaces/i-class';
import { ITimetableUnitForEditDto } from '@features/timetables/interfaces';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';

import { Input, OnInit, Component } from '@angular/core';

import { ToolbarModule } from 'primeng/toolbar';

import { debounce } from '@core/utils';
import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-view-full',
  standalone: true,
  imports: [CoreModule, ToolbarModule],
  templateUrl: './timetable-view-full.component.html',
  styleUrl: './timetable-view-full.component.scss',
})
export class TimetableViewFullComponent implements OnInit {
  @Input() classes: IClass[];

  @Input() startAts: number[];

  @Input() timeTableUnits2Dimensional: ITimetableUnitForEditDto[][];

  // * -1: tất cả, 0: sáng, 1 chiều
  @Input() numSchoolShifts: number = -1;

  @Input() viewEdit = true;

  classesForFilter: IClass[] = [];

  schoolShifts: ISchoolShift[] = schoolShiftData;

  ngOnInit(): void {
    console.log('classesForFilter', this.classesForFilter);
  }

  getClassForShift(): IClass[] {
    if (this.numSchoolShifts === 1) {
      return (this.classesForFilter = this.classes.filter(
        (x) => x.schoolShift === 1
      ));
    } else if (this.numSchoolShifts === 0) {
      return (this.classesForFilter = this.classes.filter(
        (x) => x.schoolShift === 0
      ));
    } else {
      return (this.classesForFilter = this.classes);
    }
  }

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }

  getClasses(className1: string, className2: string): IClass[] {
    if (className1 > className2) return [];
    return this.classesForFilter.filter(
      (x) => x.name >= className1 && x.name <= className2
    );
  }

  isDragging = false;

  cellMouseDown?: ITimetableUnitForEditDto = null;

  prevCellMouseDown?: ITimetableUnitForEditDto = null;

  cellMouseEnter?: ITimetableUnitForEditDto = null;

  prevCellMouseEnter?: ITimetableUnitForEditDto = null;

  toggleSelection(cell: ITimetableUnitForEditDto): void {
    cell.isNoAssignTimetableUnits = !cell.isNoAssignTimetableUnits;
  }

  onMouseDown(cell: ITimetableUnitForEditDto): void {
    if (!this.isDragging && this.viewEdit) {
      this.isDragging = true;
      this.cellMouseDown = cell;
      this.toggleHover(cell);
    }
  }

  toggleHover = debounce(
    (cell0: ITimetableUnitForEditDto, cell1: ITimetableUnitForEditDto) => {
      if (!cell0) cell0 = cell1;
      if (!cell1) cell1 = cell0;

      if (this.prevCellMouseEnter) {
        const y = this.handelCellDatForSelect(this.prevCellMouseEnter, cell1);

        for (let j = y.minStartAt; j <= y.maxStartAt; j++) {
          this.getClasses(y.minClassName, y.maxClassName).forEach((k) => {
            this.timeTableUnits2Dimensional[k.name][j].isHover = false;
          });
        }
      }

      const x = this.handelCellDatForSelect(cell0, cell1);

      for (let j = x.minStartAt; j <= x.maxStartAt; j++) {
        this.getClasses(x.minClassName, x.maxClassName).forEach((k) => {
          this.timeTableUnits2Dimensional[k.name][j].isHover = true;
        });
      }

      this.prevCellMouseEnter = cell0;
    },
    100
  );

  onMouseEnter(cell: ITimetableUnitForEditDto): void {
    if (this.isDragging && this.viewEdit) {
      this.cellMouseEnter = cell;
      this.toggleHover(cell, this.cellMouseDown);
    }
  }

  onMouseUp(): void {
    if (!this.cellMouseEnter || !this.cellMouseDown) return;
    if (this.isDragging && this.viewEdit) {
      const x = this.handelCellDatForSelect(
        this.cellMouseEnter,
        this.cellMouseDown
      );

      for (let j = x.minStartAt; j <= x.maxStartAt; j++) {
        if (this.numSchoolShifts === 0 && this.onHandelStartAt(j) > 5) {
          continue;
        }

        if (this.numSchoolShifts === 1 && this.onHandelStartAt(j) <= 5) {
          continue;
        }
        this.getClasses(x.minClassName, x.maxClassName).forEach((k) => {
          if (
            this.timeTableUnits2Dimensional[k.name][j]
              .isNoAssignTimetableUnits !== true
          ) {
            this.timeTableUnits2Dimensional[k.name][
              j
            ].isNoAssignTimetableUnits = true;

            const index = this.classes.findIndex(
              (item) => item.name === k.name
            );

            if (this.classes[index].noAssignTimetableUnits) {
              this.classes[index].noAssignTimetableUnits += 1;
            } else {
              this.classes[index].noAssignTimetableUnits = 1;
            }
          } else if (
            this.timeTableUnits2Dimensional[k.name][j]
              .isNoAssignTimetableUnits === true
          ) {
            this.timeTableUnits2Dimensional[k.name][
              j
            ].isNoAssignTimetableUnits = false;
            const index = this.classes.findIndex(
              (item) => item.name === k.name
            );
            this.classes[index].noAssignTimetableUnits -= 1;
          }

          this.timeTableUnits2Dimensional[k.name][j].isHover = false;
        });
      }

      this.isDragging = false;
      this.cellMouseDown = null;
      this.cellMouseEnter = null;
    }
  }

  handelCellDatForSelect(
    cell1: ITimetableUnitForEditDto,
    cell2: ITimetableUnitForEditDto
  ): any {
    return {
      minStartAt:
        cell1.startAt <= cell2.startAt ? cell1.startAt : cell2.startAt,
      maxStartAt:
        cell1.startAt >= cell2.startAt ? cell1.startAt : cell2.startAt,
      minClassName:
        cell1.className <= cell2.className ? cell1.className : cell2.className,
      maxClassName:
        cell1.className >= cell2.className ? cell1.className : cell2.className,
    };
  }

  numberOfClassesSessions(schoolShift: number): number {
    return this.classes.filter((x) => x.schoolShift === schoolShift).length;
  }

  numNoAssignTimetableUnits(klass: IClass): number {
    const num = !klass.noAssignTimetableUnits
      ? 0
      : klass.noAssignTimetableUnits;
    return 30 - (klass.periodCount + num);
  }

  convertNumFloor(num: number): number {
    return Math.floor(num);
  }
}
