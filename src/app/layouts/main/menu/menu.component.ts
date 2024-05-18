import { CommonModule } from '@angular/common';
import { OnInit, Component } from '@angular/core';

import { LogoMainComponent } from '@shared/smsedu-logo/logo-main/logo-main.component';

import { LayoutMainComponent } from '../layout-main.component';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'layout-main-menu',
  standalone: true,
  imports: [CommonModule, MenuItemComponent, LogoMainComponent],
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any[];

  constructor(public appMain: LayoutMainComponent) {
    // constructor export MenuComponent {
  }

  ngOnInit(): void {
    this.model = [
      {
        label: 'Lớp học',
        icon: 'pi pi-fw pi-star-fill',
        routerLink: ['/smsedu/classes'],
        items: [
          {
            label: 'Danh sác lớp học',
            icon: 'pi pi-fw pi-id-card',
            routerLink: ['/smsedu/classes/list'],
          },
        ],
      },
      {
        label: 'Môn học',
        icon: 'pi pi-fw pi-star-fill',
        routerLink: ['/smsedu/subjects'],
        items: [
          {
            label: 'Danh sác lớp học',
            icon: 'pi pi-fw pi-id-card',
            routerLink: ['/smsedu/subjects/list'],
          },
        ],
      },
      {
        label: 'Phân công',
        icon: 'pi pi-fw pi-star-fill',
        routerLink: ['/assignment'],
        items: [
          {
            label: 'Phân công chủ nhiêm',
            icon: 'pi pi-fw pi-id-card',
            routerLink: ['/assignment/teacher-leader'],
          },
          {
            label: 'Phân công giảng dạy',
            icon: 'pi pi-fw pi-id-card',
            routerLink: ['/assignment/teaching'],
          },
        ],
      },
    ];
  }

  onMenuClick(): void {
    this.appMain.menuClick = true;
  }
}
