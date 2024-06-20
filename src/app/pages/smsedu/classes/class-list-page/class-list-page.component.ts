import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { ClassListComponent } from '@features/classes/components/class-list/class-list.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-class-list-page',
  standalone: true,
  imports: [CoreModule, ClassListComponent],
  templateUrl: './class-list-page.component.html',
})
export class ClassListPageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Lớp học', routerLink: paths.smsedu.class.root },
      { label: 'Danh sách lớp học', routerLink: paths.smsedu.class.list },
    ]);
  }
}
