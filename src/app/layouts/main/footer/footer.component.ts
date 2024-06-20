import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'layout-main-footer',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {}
