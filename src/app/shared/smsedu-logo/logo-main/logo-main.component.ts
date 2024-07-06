import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-logo-main',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './logo-main.component.html',
})
export class LogoMainComponent {
  // LogoMainComponent
}
