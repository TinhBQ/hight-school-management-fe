import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

interface Cell {
  value: number;
  selected: boolean;
  hovered: boolean; // Track if cell is hovered over during selection
}

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent {
  gridData: Cell[][] = [
    [
      { value: 1, selected: false, hovered: false },
      { value: 2, selected: false, hovered: false },
      { value: 3, selected: false, hovered: false },
      { value: 4, selected: false, hovered: false },
      { value: 5, selected: false, hovered: false },
    ],
    [
      { value: 6, selected: false, hovered: false },
      { value: 7, selected: false, hovered: false },
      { value: 8, selected: false, hovered: false },
      { value: 9, selected: false, hovered: false },
      { value: 10, selected: false, hovered: false },
    ],
    [
      { value: 11, selected: false, hovered: false },
      { value: 12, selected: false, hovered: false },
      { value: 13, selected: false, hovered: false },
      { value: 14, selected: false, hovered: false },
      { value: 15, selected: false, hovered: false },
    ],
    [
      { value: 16, selected: false, hovered: false },
      { value: 17, selected: false, hovered: false },
      { value: 18, selected: false, hovered: false },
      { value: 19, selected: false, hovered: false },
      { value: 20, selected: false, hovered: false },
    ],
  ];

  isDragging = false;

  toggleSelection(cell: Cell): void {
    cell.selected = !cell.selected;
  }

  onMouseDown(cell: Cell): void {
    console.log('onMouseDown', cell);
    this.isDragging = true;
    this.toggleSelection(cell);
  }

  onMouseEnter(cell: Cell): void {
    console.log('onMouseEnter', cell);
    if (this.isDragging) {
      cell.hovered = true;
      this.toggleSelection(cell);
    }
  }

  onMouseUp(): void {
    console.log('onMouseUp');
    this.isDragging = false;
    this.gridData.forEach((row) => {
      row.forEach((cell) => {
        cell.hovered = false;
      });
    });
  }
}
