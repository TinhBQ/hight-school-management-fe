/* eslint-disable @typescript-eslint/no-explicit-any */
import { Output, Directive, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appSmseduScrollTracker]',
  standalone: true,
})
export class SmseduScrollTrackerDirective {
  @Output() scrollEnd = new EventEmitter<void>();

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    const tracker = event.target;
    const limit = tracker.scrollHeight - tracker.clientHeight;
    if (tracker.scrollTop === limit) {
      this.scrollEnd.emit();
    }
  }
}
