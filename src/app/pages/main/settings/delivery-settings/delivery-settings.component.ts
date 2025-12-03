import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldTypes } from '../../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { catchError, takeUntil, throwError } from 'rxjs';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { SettingsService } from '../../../../core/services/settings.service';
import {
  DeliveryType,
  ISettingsDeliveryDetails,
} from '../../../../core/models/delivery-details.model';
import { AnswerYesNo } from '../../../../core/enums/answer-yes-no.enum';
import { titleCase } from '../../../../shared/utils/title-case';
import { convertBooleanToAnswer } from '../../../../shared/utils/convert-answer';
import { IOption } from '../../../../core/models/company-details.model';
import { ButtonType } from '../../../../core/enums/button-type.enum';
import { updateFormErrors } from '../../../../shared/utils/update-form-errors';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';

@Component({
  selector: 'app-delivery-settings',
  templateUrl: './delivery-settings.component.html',
  styleUrls: ['./delivery-settings.component.less'],
})
export class DeliverySettingsComponent implements OnInit {
  form: FormGroup;
  FIELD_TYPES = FieldTypes;
  DELIVERY_TYPE = DeliveryType;
  ANSWER_YES_NO = AnswerYesNo;

  buttonSubmitConfig: IButtonConfig = {
    text: 'Save',
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
  deliveryDetails: ISettingsDeliveryDetails;
  isLoadedBtn: boolean = true;
  isDataLoaded: boolean;
  isAddressOptionsDisabled: boolean = false;
  private deliveryDetailsInitialValue: ISettingsDeliveryDetails;

  constructor(
    private formBuilder: FormBuilder,
    public destroy$: AutoDestroyService,
    private settingsService: SettingsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  submitForm(): void {
    if (this.form.valid) {
      this.isLoadedBtn = false;
      this.settingsService
        .postDeliverySettings(<ISettingsDeliveryDetails>this.form.value)
        .pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.isLoadedBtn = true;
            updateFormErrors(this.form, err);

            return throwError(() => new Error(err));
          })
        )
        .subscribe(() => {
          this.deliveryDetailsInitialValue = this.form.value;
          this.isLoadedBtn = true;
          this.openSuccessDialog();
        });
    } else {
      this.form.markAllAsTouched();
    }
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
    this.form.setValue(this.deliveryDetailsInitialValue);
    this.form.markAsUntouched();
  }

  private getData(): void {
    this.settingsService
      .getDeliverySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.deliveryDetails = {
          ...data,
          deliveryUsersOptions: [
            { id: -1, label: 'No delivery user' },
            ...data.deliveryUsersOptions,
          ],
        };
        this.initForm();
        this.isDataLoaded = true;
      });
  }

  private initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      deliveryType: [
        titleCase(this.deliveryDetails.deliveryType) || '',
        [Validators.required],
      ],
      addLogoToBox: [
        convertBooleanToAnswer(this.deliveryDetails.addLogoToBox) || '',
        [Validators.required],
      ],
      addressOptions: [
        this.setAddressOption(this.deliveryDetails.defaultAddressId),
      ],
      defaultAddressId: [this.deliveryDetails.defaultAddressId],
      deliveryUsersOptions: [
        this.setUsersAddressOption(this.deliveryDetails.defaultUsersAddressId),
      ],
      defaultUsersAddressId: [this.deliveryDetails.defaultUsersAddressId],
    });
    this.deliveryDetailsInitialValue = this.form.value;
    this.configureAddressOptionInput(this.deliveryDetails.deliveryType);
    this.subscribeForm();
  }

  private subscribeForm(): void {
    this.form
      .get('addressOptions')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((option) => {
        this.form.get('defaultAddressId')?.setValue(option?.id || null);
      });
    this.form
      .get('deliveryUsersOptions')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((option) => {
        const id = option?.id && option?.id !== -1 ? option.id : null;

        this.form.get('defaultUsersAddressId')?.setValue(id);

        if (option?.id === -1) {
          this.form.get('deliveryUsersOptions')?.reset(null);
        }
      });

    this.form
      .get('deliveryType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((option) => {
        if (this.deliveryDetailsInitialValue.deliveryType !== option) {
          this.form.get('defaultAddressId')?.setValue(null);
          this.form.get('addressOptions')?.reset(null);
        }

        this.configureAddressOptionInput(option);
      });
  }

  setAddressOption(id: number | null): IOption | null {
    let contactOption: IOption | undefined =
      this.deliveryDetails.addressOptions.find((option) => option.id === id);

    return contactOption || null;
  }

  setUsersAddressOption(id: number | null): IOption | null {
    let contactOption: IOption | null | undefined =
      this.deliveryDetails.deliveryUsersOptions.find(
        (option) => option?.id === id
      );

    return contactOption || null;
  }

  private configureAddressOptionInput(option: DeliveryType | string): void {
    this.isAddressOptionsDisabled =
      String(option).toLowerCase() ===
      String(this.DELIVERY_TYPE.Pickup).toLowerCase();
  }
}
