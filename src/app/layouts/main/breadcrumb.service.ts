import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private itemsSource = new Subject<MenuItem[]>();

  itemsHandler = this.itemsSource.asObservable();

  setItems(items: MenuItem[]) {
    this.itemsSource.next(items);
  }
}
