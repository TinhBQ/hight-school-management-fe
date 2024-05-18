/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { filter, Subscription } from 'rxjs';
import { MenuService } from '@layouts/main/app.menu.service';
import { LayoutMainComponent } from '@layouts/main/layout-main.component';

import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import {
  state,
  style,
  animate,
  trigger,
  transition,
} from '@angular/animations';
import {
  Input,
  OnInit,
  Component,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';

interface INavBar {
  label: string;
  icon: string;
  url?: string[];
  routerLink?: string[];
  items?: INavBar[];
  visible?: boolean;
  target?: string;
  class?: string;
  badgeClass?: string;
  disabled?: boolean;
  command?: (params: object) => void;
  preventExact: boolean;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[menu-item]',
  standalone: true,
  imports: [CommonModule, LayoutMainComponent, RouterModule],
  providers: [MenuService],
  templateUrl: './menu-item.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.active-menuitem]': 'active',
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  animations: [
    trigger('children', [
      state(
        'void',
        style({
          height: '0px',
        })
      ),
      state(
        'hiddenAnimated',
        style({
          height: '0px',
        })
      ),
      state(
        'visibleAnimated',
        style({
          height: '*',
        })
      ),
      state(
        'visible',
        style({
          height: '*',
          'z-index': 100,
        })
      ),
      state(
        'hidden',
        style({
          height: '0px',
          'z-index': '*',
        })
      ),
      transition(
        'visibleAnimated => hiddenAnimated',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'hiddenAnimated => visibleAnimated',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'void => visibleAnimated, visibleAnimated => void',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
    ]),
  ],
})
export class MenuItemComponent implements OnInit, OnDestroy {
  @Input() item: any;

  @Input() index: number;

  @Input() root: boolean;

  @Input() parentKey: string;

  active = false;

  menuSourceSubscription: Subscription;

  menuResetSubscription: Subscription;

  key: string;

  constructor(
    public appMain: LayoutMainComponent,
    public router: Router,
    private cd: ChangeDetectorRef,
    private menuService: MenuService
  ) {
    this.menuSourceSubscription = this.menuService.menuSource$.subscribe(
      (key) => {
        // deactivate current active menu
        if (this.active && this.key !== key && key.indexOf(this.key) !== 0) {
          this.active = false;
        }
      }
    );

    this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
      this.active = false;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((params) => {
        if (this.appMain.isHorizontal()) {
          this.active = false;
        } else {
          if (this.item.routerLink) {
            this.updateActiveStateFromRoute();
          } else {
            this.active = false;
          }
        }
      });
  }

  ngOnInit() {
    if (!this.appMain.isHorizontal() && this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }

    this.key = this.parentKey
      ? this.parentKey + '-' + this.index
      : String(this.index);
  }

  updateActiveStateFromRoute() {
    this.active = this.router.isActive(
      this.item.routerLink[0],
      !this.item.items && !this.item.preventExact
    );
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // navigate with hover in horizontal mode
    if (this.root) {
      this.appMain.menuHoverActive = !this.appMain.menuHoverActive;
    }

    // notify other items
    this.menuService.onMenuStateChange(this.key);

    // execute command
    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.items) {
      this.active = !this.active;
    } else {
      // activate item
      this.active = true;

      // hide overlay menus
      if (this.appMain.isMobile()) {
        this.appMain.sidebarActive = false;
        this.appMain.menuMobileActive = false;
      }

      // reset horizontal menu
      if (this.appMain.isHorizontal()) {
        this.menuService.reset();
      }
    }
  }

  onMouseEnter() {
    // activate item on hover
    if (
      this.root &&
      this.appMain.menuHoverActive &&
      this.appMain.isHorizontal() &&
      this.appMain.isDesktop()
    ) {
      this.menuService.onMenuStateChange(this.key);
      this.active = true;
    }
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
