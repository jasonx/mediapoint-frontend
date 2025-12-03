import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { IButtonConfig } from '../../../core/models/button-config.model';
import { ButtonViewType } from '../../../core/enums/button-view-type.enum';
import { ButtonType } from '../../../core/enums/button-type.enum';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddressDialogComponent } from './address-dialog/address-dialog.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { takeUntil } from 'rxjs';
import { DialogActionEnum } from '../../../core/enums/dialog-action.enum';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { IAddressItem } from 'src/app/core/models/address.model';
import { BaseMainComponent } from '../base-main/base-main.component';
import { AddressService } from 'src/app/core/services/address.service';
import { ActivatedRoute, Router } from '@angular/router';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: [
    '../base-main/base-main.component.less',
    './address.component.less',
  ],
  providers: [AutoDestroyService],
})
export class AddressComponent extends BaseMainComponent<IAddressItem> {
  addAddressButtonConfig: IButtonConfig = {
    text: 'Add address',
    type: ButtonType.Button,
    viewType: ButtonViewType.TransparentBlue,
    padding: '21px 26px 21px 23px',
    icon: 'plus-2.svg',
  };
  displayedColumns: string[] = ['main', 'type', 'actions'];

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    destroy$: AutoDestroyService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone,
    private addressService: AddressService,
    public dialog: MatDialog,
    platformDetectorService: PlatformDetectorService
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.addressService
      .getAddresses(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => this.setData(data));
  }

  edit(id: string): void {
    this.addressService
      .getAddress(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((address) => {
        let dialogConfig = new MatDialogConfig();

        dialogConfig = {
          ...dialogConfig,
          width: '100%',
          maxWidth: '704px',
          maxHeight: '90vh',
          panelClass: 'dialog__address',
          data: { addressData: address },
        };

        const dialogRef = this.dialog.open(
          AddressDialogComponent,
          dialogConfig
        );

        dialogRef
          .afterClosed()
          .pipe(takeUntil(this.destroy$))
          .subscribe((action) => {
            if (action !== DialogActionEnum.Close) {
              this.getData();
            }
          });
      });
  }

  delete(id: string): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: {
        title: 'Are you sure?',
        message: 'Are you sure you want to delete this address?',
        declineButtonText: 'Cancel',
        acceptButtonText: 'Delete address',
      },
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Accept) {
          this.addressService
            .deleteAddress(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.getData());
        }
      });
  }

  addAddress(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '704px',
      maxHeight: '90vh',
      panelClass: 'dialog__address',
    };

    const dialogRef = this.dialog.open(AddressDialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action !== DialogActionEnum.Close) {
          this.getData();
        }
      });
  }
}
