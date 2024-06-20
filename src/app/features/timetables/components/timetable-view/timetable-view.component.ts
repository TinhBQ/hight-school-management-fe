import { OnInit, Component } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';

import { CoreModule } from '@core/core.module';

import { TableViewForGradeComponent } from '../table-view-for-grade/table-view-for-grade.component';
import { TimetableViewForClassComponent } from '../timetable-view-for-class/timetable-view-for-class.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-view',
  standalone: true,
  imports: [
    CoreModule,
    TabMenuModule,
    TimetableViewForClassComponent,
    TableViewForGradeComponent,
  ],
  templateUrl: './timetable-view.component.html',
})
export class TimetableViewComponent implements OnInit {
  items: MenuItem[] | undefined;

  activeItem: MenuItem | undefined;

  ngOnInit() {
    this.items = [
      { label: 'Buổi', icon: 'pi pi-home' },
      { label: 'Khối', icon: 'pi pi-chart-line' },
    ];

    this.activeItem = this.items[0];
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
