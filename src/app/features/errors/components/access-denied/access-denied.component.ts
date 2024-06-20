import { Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { CoreModule } from '@core/core.module';

import { LogoMainComponent } from '@shared/smsedu-logo/logo-main/logo-main.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-access-denied',
  standalone: true,
  imports: [CoreModule, LogoMainComponent, ButtonModule],
  templateUrl: './access-denied.component.html',
})
export class AccessDeniedComponent {}
