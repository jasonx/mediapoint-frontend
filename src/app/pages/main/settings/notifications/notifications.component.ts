import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FieldTypes } from '../../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonType } from '../../../../core/enums/button-type.enum';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { catchError, takeUntil } from 'rxjs';
import { SettingsService } from '../../../../core/services/settings.service';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { updateFormErrors } from '../../../../shared/utils/update-form-errors';
import { INotificationsSettingsItem } from '../../../../core/models/notification.model';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.less'],
})
export class NotificationsComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  form: FormGroup;
  fields: any;
  notificationsDetailsInitialValue: INotificationsSettingsItem[];

  isLoadedBtn: boolean = true;
  isDataLoaded: boolean;

  buttonSubmitConfig: IButtonConfig = {
    text: 'Save',
    type: ButtonType.Submit,
    viewType: ButtonViewType.Filled,
    minWidth: '174px',
  };
  buttonCancelConfig: IButtonConfig = {
    text: 'Cancel',
    type: ButtonType.Button,
    viewType: ButtonViewType.TransparentBlue,
    minWidth: '174px',
  };
  dialogSuccessConfig: IDialogConfig = {
    title: 'Success!',
    isSuccess: true,
  };

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    public destroy$: AutoDestroyService
  ) {}

  get settings(): FormArray {
    return this.form.controls['settings'] as FormArray;
  }

  ngOnInit(): void {
    this.getData();
  }

  private getData() {
    this.settingsService
      .getNotificationsSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.fields = data;
        this.initForm();
        this.patchForm();
        this.notificationsDetailsInitialValue = this.form.value;
        this.isDataLoaded = true;
      });
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      settings: this.formBuilder.array([]),
    });
  }

  private patchForm(): void {
    const control = <FormArray>this.form.get('settings');

    this.fields.forEach((item: INotificationsSettingsItem) => {
      control.push(this.formBuilder.group(item));
    });
  }

  submitForm(): void {
    this.isLoadedBtn = false;
    this.settingsService
      .postNotificationsSettings(
        <
          {
            settings: INotificationsSettingsItem[];
          }
        >this.form.value
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;
          updateFormErrors(this.form, err);

          throw err;
        })
      )
      .subscribe(() => {
        this.notificationsDetailsInitialValue = this.form.value;
        this.isLoadedBtn = true;
        this.openSuccessDialog();
      });
  }

  openSuccessDialog(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogSuccessConfig,
    };

    this.dialog.open(DialogComponent, dialogConfig);
  }

  cancel(): void {
    this.form.setValue(this.notificationsDetailsInitialValue);
  }
}
