import { Component, Inject, OnInit } from '@angular/core';
import { IButtonConfig } from '../../../core/models/button-config.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  DialogButtonType,
  IDialogConfig,
} from '../../../core/models/dialog-config.model';
import { DialogActionEnum } from '../../../core/enums/dialog-action.enum';
import { ButtonViewType } from '../../../core/enums/button-view-type.enum';
import { delay, of } from 'rxjs';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.less'],
})
export class DialogComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  DialogButtonType = DialogButtonType;
  Action = DialogActionEnum;
  dialogConfig: IDialogConfig;
  isChecked: boolean;
  get acceptButtonConfig(): IButtonConfig {
    return {
      text: this.dialogConfig.acceptButtonText || '',
      viewType: this.dialogConfig.isBtnRed ? ButtonViewType.FilledRed : ButtonViewType.LightRed,
      minWidth: '100%',
      padding: '0 16px',
    }
  };
  get declineButtonConfig(): IButtonConfig {
    return {
      text: this.dialogConfig.declineButtonText || '',
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '100%',
      padding: '0 16px',
    }
  };
  get informationButtonConfig(): IButtonConfig {
    return {
      text: this.dialogConfig.informationButtonText || '',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      padding: '0 16px',
      isDisabled: this.dialogConfig.checkboxText ? !this.isChecked : false,
    }
  };

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: IDialogConfig
  ) {
    this.dialogConfig = data;
  }

  ngOnInit(): void {
    if (this.data.isSuccess) {
      of(null)
        .pipe(delay(1800))
        .subscribe(() => this.dialogRef.close());
    }
  }

  action(action: DialogActionEnum) {
    this.dialogRef.close(action);
  }

  getBtnIndex(type: DialogButtonType): number {
    return Object.keys(this.dialogConfig).indexOf(type);
  }
}
