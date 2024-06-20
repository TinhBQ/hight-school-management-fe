import { Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { CoreModule } from '@core/core.module';

import { LogoMainComponent } from '@shared/smsedu-logo/logo-main/logo-main.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-error',
  standalone: true,
  imports: [CoreModule, LogoMainComponent, ButtonModule],
  templateUrl: './error.component.html',
})
export class ErrorComponent {}
