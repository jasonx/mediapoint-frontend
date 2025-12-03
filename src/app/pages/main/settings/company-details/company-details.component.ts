import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldTypes } from '../../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { ButtonType } from '../../../../core/enums/button-type.enum';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  of,
  Subject,
  takeUntil,
  throwError,
} from 'rxjs';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { SettingsService } from '../../../../core/services/settings.service';
import {
  ICompanyDetails,
  IOption,
} from '../../../../core/models/company-details.model';
import { phoneMask } from 'src/app/shared/utils/masks';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { updateFormErrors } from '../../../../shared/utils/update-form-errors';
import { IAddressBySearch } from 'src/app/core/models/address.model';
import { AddressService } from 'src/app/core/services/address.service';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.less'],
  providers: [AutoDestroyService],
})
export class CompanyDetailsComponent implements OnInit {
  @Input() customerId: string;
  @Output() closeEvent = new EventEmitter();

  @ViewChild('logoUpload') logoUploadEl: ElementRef;

  phoneMask = phoneMask;
  FIELD_TYPES = FieldTypes;
  form: FormGroup;
  logoPath: string;
  listOfAddress: IAddressBySearch[] = [];
  listOfAddressString: string[] = [];
  companyDetails: ICompanyDetails;
  isLoadedBtn: boolean = true;
  isDataLoaded: boolean;
  companyDetailsInitialValue: ICompanyDetails;
  isLogoSizeError: boolean;
  isLogoFormatError: boolean;

  searchAddressSubject$ = new Subject<string>();
  isNotFound: boolean;

  uploadLogoButtonConfig: IButtonConfig = {
    text: 'Upload logo',
    viewType: ButtonViewType.Filled,
    minWidth: '170px',
  };
  deleteLogoButtonConfig: IButtonConfig = {
    text: 'Delete logo',
    viewType: ButtonViewType.Text,
    color: '#FF5858',
    minWidth: '120px',
  };

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
    public destroy$: AutoDestroyService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getData();
    this.subscribeToSearchAddress();
  }

  subscribeToSearchAddress(): void {
    this.searchAddressSubject$
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.addressService
          .searchAddress(value)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.isNotFound = !data.length;
            this.listOfAddress = data;
            this.listOfAddressString = data.map((d) => d.shortAddress);
            this.cdr.detectChanges();
          });
      });
  }

  imagePreview(e: any): void {
    let file: FileList | File | null = (e.target as HTMLInputElement).files;
    file = file ? file[0] : null;

    if (file) {
      this.checkFile(file);

      if (this.isLogoSizeError || this.isLogoFormatError) {
        this.form.patchValue({
          companyLogo: null,
        });

        return;
      }

      this.form.patchValue({
        companyLogo: file,
      });

      const reader = new FileReader();

      reader.onload = () => {
        this.logoPath = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  checkFile(file: any): void {
    this.isLogoSizeError = file.size >= 5 * 1000000;
    // this.isLogoFormatError = !'application/pdf'.includes(file.type);
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

  reloadFile(): void {
    if (!this.logoUploadEl) {
      return;
    }

    this.logoUploadEl.nativeElement.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  }

  deleteLogo(): void {
    this.logoPath = '';
    this.logoUploadEl.nativeElement.value = '';

    this.form.get('companyLogo')?.setValue('');
  }

  cancel(): void {
    this.isLogoSizeError = false;
    this.isLogoFormatError = false;
    this.logoPath = this.companyDetailsInitialValue.companyLogo;
    this.logoUploadEl.nativeElement.value = '';
    this.form.setValue(this.companyDetailsInitialValue);
    this.form.markAsUntouched();
    this.closeEvent.emit(DialogActionEnum.Close);
  }

  private getData(): void {
    this.settingsService
      .getCompanySettings(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.companyDetails = {
          ...data,
          defaultProofEmailOptions: [
            { id: -1, label: 'No default proof email' },
            ...data.defaultProofEmailOptions,
          ],
        };
        this.logoPath = this.companyDetails.companyLogo;
        this.initForm();
        this.isDataLoaded = true;
      });
  }

  private initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      companyLogo: [this.companyDetails.companyLogo || File || ''],
      companyName: [
        this.companyDetails.companyName || '',
        [Validators.required],
      ],
      website: [this.companyDetails.website || '', [Validators.required]],
      email: [
        this.companyDetails.email || '',
        [Validators.required, strictEmailValidator()],
      ],
      secondaryEmail: [
        this.companyDetails.secondaryEmail || '',
        [strictEmailValidator()],
      ],
      defaultProofEmail: [
        this.setProofEmail(this.companyDetails.defaultProofEmailId),
      ],
      defaultProofEmailId: this.companyDetails.defaultProofEmailId || '',
      phone: [this.companyDetails.phone || '', [Validators.required]],
      mainContact: [
        this.setMainContact(this.companyDetails.mainContactId),
        [Validators.required],
      ],
      mainContactId: [this.companyDetails.mainContactId || ''],
      address1: [this.companyDetails.address1 || '', Validators.required],
      address2: [this.companyDetails.address2 || ''],
      state: [this.companyDetails.state || '', [Validators.required]],
      suburb: [this.companyDetails.suburb || '', [Validators.required]],
      postcode: [this.companyDetails.postcode || '', [Validators.required]],
      abn: [this.companyDetails.abn || '', [Validators.required]],
    });

    this.companyDetailsInitialValue = this.form.value;
    this.subscribeToForm();
  }

  setProofEmail(id: number | null): IOption | null {
    let emailOption: IOption | null | undefined =
      this.companyDetails.defaultProofEmailOptions.find(
        (option) => option?.id === id
      );

    return emailOption || null;
  }

  private setMainContact(mainContactId?: number): IOption | null {
    let contactOption: IOption | undefined =
      this.companyDetails.contactOptions?.find(
        (option) => option.id === mainContactId
      );

    return contactOption || null;
  }

  private subscribeToForm(): void {
    this.form
      .get('mainContact')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((option) => {
        this.form.get('mainContactId')?.setValue(option?.id);
      });

    this.form
      .get('defaultProofEmail')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((option) => {
        const id = option?.id && option?.id !== -1 ? option.id : '';

        this.form.get('defaultProofEmailId')?.setValue(id);

        if (option?.id === -1) {
          this.form.get('defaultProofEmail')?.reset('');
        }
      });
  }

  submitForm(): void {
    if (this.form.invalid || this.isLogoSizeError || this.isLogoFormatError) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;
    this.settingsService
      .postCompanySettings(this.form.value, this.customerId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;
          updateFormErrors(this.form, err);

          return throwError(() => new Error(err));
        })
      )
      .subscribe(() => {
        this.companyDetailsInitialValue = this.form.value;
        this.isLoadedBtn = true;
        this.openSuccessDialog();
        this.closeEvent.emit();
      });
  }

  searchAddress(value: string): void {
    if (value.length < 3) {
      of(null).pipe(delay(1000)).subscribe(() => this.listOfAddressString = []);

      return;
    }

    this.searchAddressSubject$.next(value.trimStart());
  }

  selectAddress(value: string): void {
    const selectedAddress = this.listOfAddress.find(
      (a) => a.shortAddress === value
    );

    if (!selectedAddress) {
      return;
    }

    this.addressService
      .getDataByAddressId(selectedAddress.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.form.setValue({
          ...this.form.value,
          address1: data.addressLine,
          postcode: data.postcode,
          state: data.state,
          suburb: data.suburb,
        });

        this.cdr.detectChanges();
      });
  }
}
