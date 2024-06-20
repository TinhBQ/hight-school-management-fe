import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { LayoutMainComponent } from '@layouts/main/layout-main.component';

import { RouterOutlet } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    LayoutMainComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './app.component.html',
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    MessageService,
    ConfirmationService,
    BreadcrumbService,
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

  constructor(private primengConfig: PrimeNGConfig) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
  }
}
