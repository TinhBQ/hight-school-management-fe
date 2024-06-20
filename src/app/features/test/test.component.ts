/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnInit, Component } from '@angular/core';

import { TableModule } from 'primeng/table';
import { DragDropModule } from 'primeng/dragdrop';

import { CoreModule } from '@core/core.module';

import { data } from './employee-list';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CoreModule, TableModule, DragDropModule],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  data = data;

  classes: any[];

  data1: any[][] = [];

  array = [];

  ngOnInit(): void {
    console.log(
      'Get Classes',
      this.data.sort((a, b) => {
        if (a.className > b.className) {
          return 1;
        } else if (a.className < b.className) {
          return -1;
        }
        return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
      })
    );

    console.log('Get Timetables', [
      ...new Set(this.data.map((x) => x.className)),
    ]);

    this.classes = [...new Set(this.data.map((x) => x.className))];

    // Initialize data1 as an empty object to avoid undefined errors

    this.data.forEach((x) => {
      // Ensure the inner array/object exists before assignment
      if (!this.data1[x.className]) {
        this.data1[x.className] = [];
      }
      this.data1[x.className][x.startAt] = x;
    });

    for (const className of this.classes) {
      for (let i = 1; i <= 60; i++) {
        if (!this.data1[className][i]) {
          this.data1[className][i] = null;
        }
      }
    }

    this.array = Array.from({ length: 60 }, (v, k) => k + 1);
  }

  generate2DArray(total: number, columns: number): number[][] {
    const rows = Math.ceil(total / columns);
    const array: number[][] = [];
    let currentNumber = 1;

    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < columns; j++) {
        if (currentNumber <= total) {
          row.push(currentNumber);
          currentNumber++;
        } else {
          row.push(null); // or leave it empty
        }
      }
      array.push(row);
    }
    return array;
  }

  dradData: any;

  dropClassName: string;

  dragStartAt: any;

  dragStart(data: any, className: string, startAt: number): void {
    this.dradData = data;
    this.dropClassName = className;
    this.dragStartAt = startAt;

    console.log('dropClassName', this.dropClassName);

    console.log('dradData', this.dradData);

    console.log('dragStartAt', this.dragStartAt);
  }

  dragEnd(): void {
    console.log('dragEnd', data);
  }

  drop(dropData: any, className: string, startAt: number): void {
    if (dropData === null) {
      this.data1[className][startAt] = {
        ...this.dradData,
        startAt: startAt,
        className: className,
      };
      this.data1[this.dropClassName][this.dragStartAt] = null;
    } else {
      console.log('dropData', dropData);
      console.log('className', className);
      console.log('startAt', startAt);
      this.data1[className][startAt] = {
        ...this.dradData,
        startAt: startAt,
        className: className,
      };

      console.log('BQT');

      this.data1[this.dropClassName][this.dragStartAt] = {
        ...dropData,
        startAt: this.dragStartAt,
        className: this.dropClassName,
      };
    }
  }
}
