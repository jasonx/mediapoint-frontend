import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IFilter } from 'src/app/core/models/filter.model';

@Component({
  selector: 'app-filter-labels',
  templateUrl: './filter-labels.component.html',
  styleUrls: ['./filter-labels.component.less'],
})
export class FilterLabelsComponent {
  @Input() set setFilterLabels(value: IFilter) {
    this.filterLabels = value;
  }
  @Output() clearLabelsEvent = new EventEmitter<{
    data: IFilter;
    isReload?: boolean;
  }>();

  filterLabels: IFilter = {};

  clearLabel(keys: (keyof IFilter)[]): void {
    keys.forEach((k) => delete this.filterLabels[k]);
    this.clearLabelsEvent.emit({ data: this.filterLabels, isReload: true });
  }

  clearAll(): void {
    this.filterLabels = {};
    this.clearLabelsEvent.emit({ data: this.filterLabels, isReload: true });
  }
}
