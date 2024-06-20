import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { TeacherListComponent } from '@features/teachers/components/teacher-list/teacher-list.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-teacher-list-page',
  standalone: true,
  imports: [CoreModule, TeacherListComponent],
  templateUrl: './teacher-list-page.component.html',
})
export class TeacherListPageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Giáo viên', routerLink: paths.smsedu.teacher.root },
      { label: 'Danh sách Giáo viên', routerLink: paths.smsedu.teacher.list },
    ]);
  }
}
