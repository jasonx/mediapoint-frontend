import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IStatusGroup, Status } from 'src/app/core/enums/status.enum';
import { IJob } from 'src/app/core/models/job.model';
import { IOrderDetails } from 'src/app/core/models/orders.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { toKebabCase } from '../../utils/kebab-case';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.less'],
})
export class StatusComponent {
  @Input() set data(data: IJob | IOrderDetails) {
    this.savedStatus = data.status;
    this.selectedStatus = null;

    if (this.statusArr.length) {
      this.updateSelectedId();
    }
  }
  @Input() set statusArray(statusArr: IStatusGroup[]) {
    this.statusArr = statusArr;
    this.updateSelectedId();
  }
  @Input() set selectedMaxId(selectedId: number) {
    this.updateStatusList(selectedId);
  }
  @Input() isIcon: boolean;
  @Output() changeEvent = new EventEmitter<Status>();

  toKebabCase = toKebabCase;
  isOpenMenu: boolean;
  savedStatus: Status;
  selectedStatus: Status | null;
  statusList: Status[] = [];
  statusArr: IStatusGroup[] = [];

  constructor(private authorizationService: AuthorizationService) {}

  updateSelectedId(): void {
    const selectedId =
      this.statusArr.find((s) => s.status === this.savedStatus)?.groupIndex ||
      0;

    this.updateStatusList(selectedId);
  }

  updateStatusList(selectedId: number): void {
    this.statusList = this.statusArr
      .filter((s) => s.groupIndex >= selectedId)
      .map((s) => s.status);
  }

  onCloseMenu(): void {
    this.isOpenMenu = false;
  }

  onChangeStatus(status: Status): void {
    this.selectedStatus = status;
    this.changeEvent.emit(status);
    this.onCloseMenu();
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }
}
