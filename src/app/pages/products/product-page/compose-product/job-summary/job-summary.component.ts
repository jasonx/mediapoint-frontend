import { Component, Input } from '@angular/core';
import { ISummary } from 'src/app/core/models/compose-product.model';

@Component({
  selector: 'app-job-summary',
  templateUrl: './job-summary.component.html',
  styleUrls: ['./job-summary.component.less'],
})
export class JobSummaryComponent {
  @Input() summary: ISummary;
}
