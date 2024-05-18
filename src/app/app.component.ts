import { LayoutMainComponent } from '@layouts/main/layout-main.component';

import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { OnInit, Component } from '@angular/core';

import { PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LayoutMainComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './app.component.html',
  providers: [MessageService, ConfirmationService],
})
export class AppComponent implements OnInit {
  title: string = 'hight-school-management-fe';

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
