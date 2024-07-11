import { SplashScreenService } from '@features/splash-screen/services/splash-screen.service';
import { SplashScreenComponent } from '@features/splash-screen/components/splash-screen/splash-screen.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SplashScreenDirective } from '@core/directives/splash-screen.directive';

@NgModule({
  declarations: [SplashScreenComponent, SplashScreenDirective],
  imports: [CommonModule],
  providers: [SplashScreenService],
  exports: [SplashScreenComponent, SplashScreenDirective],
})
export class SplashScreenModule {}
