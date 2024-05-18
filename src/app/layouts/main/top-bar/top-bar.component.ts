import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutMainComponent } from '../layout-main.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'layout-main-top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.component.html',
})
export class TopBarComponent {
  activeItem: number;

  constructor(public appMain: LayoutMainComponent) {}

  mobileMegaMenuItemClick(index: number): void {
    this.activeItem = this.activeItem === index ? null : index;
  }
}
