import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IStatusChangesData } from 'src/app/core/models/orders.model';
import { OrderService } from 'src/app/core/services/order.service';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';

@Component({
  selector: 'app-confirm-changes',
  templateUrl: './confirm-changes.component.html',
  styleUrls: ['./confirm-changes.component.less'],
})
export class ConfirmChangesComponent implements OnInit {
  toKebabCase = toKebabCase;
  data: IStatusChangesData;
  cancelButtonConfig: IButtonConfig = {
    text: 'Cancel',
    viewType: ButtonViewType.LightBlue,
    minWidth: '174px',
  };
  confirmButtonConfig: IButtonConfig = {
    text: 'Confirm',
    viewType: ButtonViewType.Filled,
    minWidth: '174px',
  };

  constructor(
    public orderService: OrderService,
    public dialogRef: MatDialogRef<ConfirmChangesComponent>
  ) {}

  ngOnInit(): void {
    this.data = {
      ...this.orderService.statusChangesData,
      jobs: this.orderService.statusChangesData.jobs?.filter(
        (j) => j.newStatus
      ),
    };
  }

  onConfirm(): void {
    this.dialogRef.close(DialogActionEnum.Accept);
  }

  get isShowJobs(): boolean {
    return !!this.orderService.statusChangesData.jobs?.find((j) => j.newStatus);
  }
}
