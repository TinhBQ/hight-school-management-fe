import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { TimetableListComponent } from '@features/timetables/components/timetable-list/timetable-list.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-timetable-list-page',
  standalone: true,
  imports: [CoreModule, TimetableListComponent],
  templateUrl: './timetable-list-page.component.html',
})
export class TimetableListPageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Thời khóa biểu', routerLink: paths.smsedu.timetable.root },
      { label: 'Danh sách', routerLink: paths.smsedu.timetable.list },
    ]);
  }
}
