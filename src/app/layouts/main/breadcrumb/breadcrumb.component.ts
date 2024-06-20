import { Subscription } from 'rxjs';

import { Component, OnDestroy } from '@angular/core';

import { MenuItem } from 'primeng/api';

import { CoreModule } from '@core/core.module';

import { BreadcrumbService } from '../breadcrumb.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'layout-main-breadcrumb',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent implements OnDestroy {
  subscription: Subscription;

  items: MenuItem[] = []; // Initialize items array

  constructor(public breadcrumbService: BreadcrumbService) {
    this.subscription = breadcrumbService.itemsHandler.subscribe((response) => {
      this.items = response;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
