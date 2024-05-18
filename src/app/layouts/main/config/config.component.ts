import { Component, ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Sidebar, SidebarModule } from 'primeng/sidebar';

import { LayoutMainComponent } from '../layout-main.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'layout-main-config',
  standalone: true,
  imports: [SidebarModule, ButtonModule, DividerModule],
  templateUrl: './config.component.html',
})
export class ConfigComponent {
  constructor(public appMain: LayoutMainComponent) {}

  sidebarActive: boolean = true;

  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  closeCallback(event: Event): void {
    this.sidebarRef.close(event);
  }

  sidebarVisible: boolean = false;

  onConfigButtonClick(event: Event): void {
    this.appMain.configActive = true;
    event.preventDefault();
  }

  onConfigCloseClick(event: Event): void {
    this.appMain.configActive = false;
    event.preventDefault();
  }
}
