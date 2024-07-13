import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { LayoutMainComponent } from '@layouts/main/layout-main.component';
import { SplashScreenModule } from '@features/splash-screen/splash-screen.module';
import { SplashScreenService } from '@features/splash-screen/services/splash-screen.service';

import { RouterOutlet } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { CoreModule } from '@core/core.module';
import { AuthHeaderInterceptor } from '@core/interceptors/auth-header.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    LayoutMainComponent,
    ToastModule,
    ConfirmDialogModule,
    SplashScreenModule,
  ],
  templateUrl: './app.component.html',
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceptor,
      multi: true,
    },
    MessageService,
    ConfirmationService,
    BreadcrumbService,
    SplashScreenService,
  ],
})
export class AppComponent implements OnInit {
  title: string = 'SMSEdu App';

  horizontalMenu: boolean;

  darkMode: boolean = true;

  menuColorMode: string = 'blue';

  menuColor: string = 'layout-menu-light';

  themeColor: string = 'blue';

  layoutColor: string = 'blue';

  ripple: boolean = true;

  inputStyle: string = 'outlined';

  constructor(
    private primengConfig: PrimeNGConfig,
    private splashScreenService: SplashScreenService
  ) {}

  onShowSplashScreenService() {
    this.splashScreenService.show();
  }

  onHideSplashScreenService() {
    this.splashScreenService.hide();
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
  }
}
