import { NotFoundComponent } from '@features/errors/components/not-found/not-found.component';

import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CoreModule, NotFoundComponent],
  templateUrl: './not-found-page.component.html',
})
export class NotFoundPageComponent {}
