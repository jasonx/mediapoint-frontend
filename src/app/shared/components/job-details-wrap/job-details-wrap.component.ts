import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import {
  JobStatus,
  jobStatusArray,
  Status,
} from 'src/app/core/enums/status.enum';
import { IJob } from 'src/app/core/models/job.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { OrderService } from 'src/app/core/services/order.service';
import { toKebabCase } from '../../utils/kebab-case';

@Component({
  selector: 'app-job-details-wrap',
  templateUrl: './job-details-wrap.component.html',
  styleUrls: ['./job-details-wrap.component.less'],
})
export class JobDetailsWrapComponent implements AfterContentInit {
  @Input() job: IJob;
  @Input() price: number;
  @Input() isShowMenu: boolean;
  @Input() isShowDeleteBtn: boolean;
  @Input() isDeliveryType: boolean;
  @Input() listOfOptions: OptionsMenuItem[] = [OptionsMenuItem.Duplicate];

  @Output() editEvent = new EventEmitter<string>();
  @Output() deleteEvent = new EventEmitter<string>();
  @Output() duplicateEvent = new EventEmitter<string>();

  toKebabCase = toKebabCase;
  jobStatusArray = jobStatusArray;

  constructor(
    private orderService: OrderService,
    private authorizationService: AuthorizationService
  ) {}

  ngAfterContentInit(): void {
    this.initOptions();
    this.setStatusesData();
    this.updateStatusList();
  }

  initOptions(): void {
    if (this.isAdmin) {
      this.listOfOptions.push(OptionsMenuItem.Delete);
    }
  }

  setStatusesData(): void {
    const jobs = this.orderService.statusChangesData.jobs || [];

    this.orderService.statusChangesData.jobs = [
      ...jobs,
      {
        id: this.job.id,
        oldStatus: this.job?.status as JobStatus,
      },
    ];
  }

  updateStatusList(): void {
    this.jobStatusArray = this.jobStatusArray.filter(
      (o) =>
        o.status !==
        (this.isDeliveryType ? JobStatus.readyForPickup : JobStatus.dispatched)
    );
  }

  onEdit(): void {
    this.editEvent.emit(this.job.id);
  }

  onDelete(): void {
    this.deleteEvent.emit(this.job.id);
  }

  onDuplicate(): void {
    this.duplicateEvent.emit(this.job.id);
  }

  changeJobStatus(status: Status): void {
    const jobData = this.orderService.statusChangesData.jobs?.find(
      (j) => j.id === this.job.id
    );
    const isOldJob = this.job.status === status;

    if (jobData) {
      jobData.newStatus = (isOldJob ? '' : status) as JobStatus;
    }
  }

  get isArtworks(): boolean {
    return !!this.job.artworks?.find((a) => a.url);
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }
}
