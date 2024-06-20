/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, OnInit, Output, Component, EventEmitter } from '@angular/core';

import { ScrollerOptions } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'smsedu-auto-complete',
  standalone: true,
  imports: [CoreModule, AutoCompleteModule],
  templateUrl: './smsedu-auto-complete.component.html',
})
export class SmseduAutoCompleteComponent implements OnInit {
  @Input() selectedItem: any;

  @Output() selectedItemChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() currentItem: any;

  @Input() suggestions: any[];

  @Input() loading: boolean = false;

  @Input() loadData: (event: any) => void;

  @Input() onSearch: (event: any) => void;

  @Input() onDropdownClick: (event: any) => void;

  @Input() onSelect: (event: any, data: any) => void;

  options: ScrollerOptions;

  ngOnInit(): void {
    this.options = {
      showLoader: true,
      disabled: this.loading,
      lazy: true,
      itemSize: 35,
      onLazyLoad: this.loadData.bind(this),
    };
  }

  onSelectedChange(event: any): void {
    this.selectedItem = event;
    this.selectedItemChange.emit(this.selectedItem);
  }
}
