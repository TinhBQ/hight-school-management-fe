import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { TimetableViewComponent } from '@features/timetables/components/timetable-view/timetable-view.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-timetable-view-page',
  standalone: true,
  imports: [CoreModule, TimetableViewComponent],
  templateUrl: './timetable-view-page.component.html',
})
export class TimetableViewPageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Giáo viên', routerLink: paths.smsedu.teacher.root },
      { label: 'Danh sách Giáo viên', routerLink: paths.smsedu.teacher.list },
    ]);
  }
}
