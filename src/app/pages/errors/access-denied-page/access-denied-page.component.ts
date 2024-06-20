import { AccessDeniedComponent } from '@features/errors/components/access-denied/access-denied.component';

import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-access-denied-page',
  standalone: true,
  imports: [CoreModule, AccessDeniedComponent],
  templateUrl: './access-denied-page.component.html',
})
export class AccessDeniedPageComponent {}
