/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from 'rxjs';
import { SplashScreenService } from '@features/splash-screen/services/splash-screen.service';

import {
  OnInit,
  Directive,
  OnDestroy,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[appSplashScreen]',
})
export class SplashScreenDirective implements OnInit, OnDestroy {
  private subscription: Subscription;

  prevIsVisible: boolean = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private splashScreenService: SplashScreenService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.subscription = this.splashScreenService.isVisible$.subscribe(
      (isVisible) => {
        console.log('isVisible', isVisible);
        console.log('prevIsVisible', this.prevIsVisible);
        if (isVisible === true && this.prevIsVisible === false) {
          this.prevIsVisible = true;
          this.renderer.setStyle(document.body, 'overflow', 'hidden');
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (isVisible === false && this.prevIsVisible === true) {
          this.prevIsVisible = false;
          this.renderer.removeStyle(document.body, 'overflow');
          this.viewContainer.clear();
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
