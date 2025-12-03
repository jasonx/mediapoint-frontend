import { Component, Inject } from '@angular/core';
import { IButtonConfig } from '../../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../../core/enums/button-view-type.enum';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateOrderService } from '../../../../../core/services/create-order.service';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';

@Component({
  selector: 'app-edit-job-modal',
  templateUrl: './edit-job-modal.component.html',
  styleUrls: ['./edit-job-modal.component.less'],
})
export class EditJobModalComponent {
  get buttonAddToCartConfig(): IButtonConfig {
    return {
      text: 'Add to cart',
      viewType: ButtonViewType.Filled,
      minWidth: '280px',
      isDisabled: !this.dataValidToSave,
    };
  }
  get buttonCloseConfig(): IButtonConfig {
    return {
      text: 'Close',
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '280px',
      isDisabled: !this.data.productId && !this.dataValidToSave,
    };
  }
  get buttonSaveConfig(): IButtonConfig {
    return {
      text: 'Save',
      viewType: ButtonViewType.Filled,
      minWidth: '110px',
      isDisabled: !this.productName.length,
    };
  }
  buttonCancelConfig: IButtonConfig = {
    text: 'Cancel',
    viewType: ButtonViewType.TransparentBlue,
    minWidth: '110px',
  };
  isEditMode: boolean;
  productName: string = this.data.title;

  constructor(
    private orderService: CreateOrderService,
    private dialogRef: MatDialogRef<EditJobModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      jobId: string;
      productId: string;
      callbackFn: (p1: any, p2: any) => {};
    }
  ) {}

  get dataValidToSave(): boolean {
    return this.orderService.isCanAddToCart && !this.orderService.isGlobalError;
  }

  addToCart(): void {
    this.dialogRef.close(DialogActionEnum.Accept);
  }

  close(): void {
    this.dialogRef.close();
  }

  editName(name: string): void {
    this.data.callbackFn(this.data.productId, name);
    this.isEditMode = false;
  }

  cancelEddit(): void {
    this.productName = this.data.title;
    this.isEditMode = false;
  }
}
