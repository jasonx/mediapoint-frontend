import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-results',
  templateUrl: './no-results.component.html',
  styleUrls: ['./no-results.component.less'],
})
export class NoResultsComponent {
  @Input() isSearch: boolean;
  @Input() noResultsText: string;
}
