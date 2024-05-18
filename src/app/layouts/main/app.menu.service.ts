import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable()
export class MenuService {
  private menuSource: Subject<string> = new Subject<string>();

  private resetSource: Subject<unknown> = new Subject();

  // eslint-disable-next-line @typescript-eslint/typedef
  menuSource$ = this.menuSource.asObservable();

  // eslint-disable-next-line @typescript-eslint/typedef
  resetSource$ = this.resetSource.asObservable();

  onMenuStateChange(key: string): void {
    this.menuSource.next(key);
  }

  reset(): void {
    this.resetSource.next(true);
  }
}
