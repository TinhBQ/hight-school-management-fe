/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';

import { MenuComponent } from './menu/menu.component';
import { BreadcrumbService } from './breadcrumb.service';
import { ConfigComponent } from './config/config.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-layout-main',
  standalone: true,
  imports: [
    CoreModule,
    MenuComponent,
    TopBarComponent,
    ConfigComponent,
    BreadcrumbComponent,
  ],
  templateUrl: 'layout-main.component.html',
  providers: [BreadcrumbService],
})
export class LayoutMainComponent {
  sidebarActive: boolean;

  staticMenuActive: boolean;

  rightPanelClick: boolean;

  rightPanelActive: boolean;

  menuClick: boolean;

  menuHoverActive: boolean;

  menuMobileActive: boolean;

  configActive: boolean = true;

  topbarItemClick: boolean;

  topbarMenuActive: boolean;

  topbarMobileMenuClick: boolean;

  topbarMobileMenuActive: boolean;

  activeTopbarItem: any;

  constructor(public app: AppComponent) {}

  onLayoutClick(): void {
    if (!this.topbarItemClick) {
      this.activeTopbarItem = null;
      this.topbarMenuActive = false;
    }

    if (!this.rightPanelClick) {
      this.rightPanelActive = false;
    }

    this.menuClick = false;
    this.topbarItemClick = false;
    this.rightPanelClick = false;
  }

  onRightPanelButtonClick(event: Event): void {
    this.rightPanelClick = true;
    this.rightPanelActive = !this.rightPanelActive;

    event.preventDefault();
  }

  onRightPanelClose(event: Event): void {
    this.rightPanelActive = false;
    this.rightPanelClick = false;

    event.preventDefault();
  }

  onRightPanelClick(event: Event): void {
    this.rightPanelClick = true;

    event.preventDefault();
  }

  onMenuButtonClick(event: Event): void {
    this.menuClick = true;
    this.topbarMenuActive = false;

    if (this.isMobile()) {
      this.menuMobileActive = !this.menuMobileActive;
    }

    event.preventDefault();
  }

  onTopbarMobileMenuButtonClick(event: Event): void {
    this.topbarMobileMenuClick = true;
    this.topbarMobileMenuActive = !this.topbarMobileMenuActive;

    event.preventDefault();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  onTopbarItemClick(event: Event, item: any): void {
    this.topbarItemClick = true;

    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSidebarClick(event: Event): void {
    this.menuClick = true;
  }

  onToggleMenuClick(event: Event): void {
    this.staticMenuActive = !this.staticMenuActive;
    event.preventDefault();
  }

  isDesktop(): boolean {
    return window.innerWidth > 991;
  }

  isMobile(): boolean {
    return window.innerWidth <= 991;
  }

  isHorizontal() {
    return this.app.horizontalMenu === true;
  }
}
