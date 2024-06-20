import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { SubjectListComponent } from '@features/subjects/components/subject-list/subject-list.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-subject-list-page',
  standalone: true,
  imports: [CoreModule, SubjectListComponent],
  templateUrl: './subject-list-page.component.html',
})
export class SubjectListPageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Môn học', routerLink: paths.smsedu.subject.root },
      { label: 'Danh sách môn học', routerLink: paths.smsedu.subject.list },
    ]);
  }
}
