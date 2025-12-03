import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { IAddress } from 'src/app/core/models/address.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { ICompanyAddressItem } from 'src/app/core/models/customers.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CustomersService } from 'src/app/core/services/customers.service';
import { phoneMask } from 'src/app/shared/utils/masks';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { AddressDialogComponent } from '../../../address/address-dialog/address-dialog.component';
import { BaseMainComponent } from '../../../base-main/base-main.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-company-addresses',
  templateUrl: './company-addresses.component.html',
  styleUrls: ['./company-addresses.component.less'],
  providers: [AutoDestroyService],
})
export class CompanyAddressesComponent extends BaseMainComponent<ICompanyAddressItem> {
  phoneMask = phoneMask;
  buttonConfig: IButtonConfig = {
    text: 'Add address',
    viewType: ButtonViewType.LightBlue,
    padding: '9px 34px',
    minWidth: '160px',
  };
  displayedColumns: string[] = [
    'companyName',
    'contactName',
    'phone',
    'address1',
    'action',
  ];
  listOfOptions: OptionsMenuItem[] = [
    OptionsMenuItem.Edit,
    OptionsMenuItem.Delete,
  ];

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    destroy$: AutoDestroyService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone,
    platformDetectorService: PlatformDetectorService,
    private customersService: CustomersService,
    private dialog: MatDialog
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.customersService
      .getCompanyAddresses(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
      });
  }

  addAddress(): void {
    this.openModal();
  }

  onEdit(data: ICompanyAddressItem): void {
    this.customersService
      .getCompanyAddress(data.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((addressData) => {
        this.openModal(addressData);
      });
  }

  openModal(data?: IAddress): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '704px',
      maxHeight: '90vh',
      panelClass: 'dialog__address',
      data: { addressData: data, isCustomersPage: true },
    };

    this.dialog
      .open(AddressDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action !== DialogActionEnum.Close) {
          this.getData();
        }
      });
  }

  onDelete(data: ICompanyAddressItem): void {
    this.customersService
      .deleteAddress(data.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getData();
      });
  }
}
