import { TimetableViewComponent } from '@features/timetables/components/timetable-view/timetable-view.component';

import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-timetable-view-page',
  standalone: true,
  imports: [CoreModule, TimetableViewComponent],
  templateUrl: './timetable-view-page.component.html',
})
export class TimetableViewPageComponent {}
