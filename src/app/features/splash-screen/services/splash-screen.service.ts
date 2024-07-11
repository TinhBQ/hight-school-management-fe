import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SplashScreenService {
  private isVisibleSubject = new BehaviorSubject<boolean>(false);

  isVisible$ = this.isVisibleSubject.asObservable();

  show() {
    this.isVisibleSubject.next(true);
  }

  hide() {
    this.isVisibleSubject.next(false);
  }
}
