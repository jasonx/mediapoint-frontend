import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { ICustomerItem } from 'src/app/core/models/customers.model';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CustomersService } from 'src/app/core/services/customers.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { phoneMask } from 'src/app/shared/utils/masks';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { fromSnakeCase } from 'src/app/shared/utils/snake-case.util';
import { BaseMainComponent } from '../base-main/base-main.component';
import { CompanyDialogComponent } from './company/company-dialog/company-dialog.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: [
    '../base-main/base-main.component.less',
    './customers.component.less',
  ],
  providers: [AutoDestroyService],
})
export class CustomersComponent extends BaseMainComponent<ICustomerItem> {
  phoneMask = phoneMask;
  fromSnakeCase = fromSnakeCase;
  displayedColumns: string[] = [
    // 'select',
    'companyName',
    'mainContact',
    'email',
    'phone',
    'type',
    'action',
  ];
  dialogDeleteConfig: IDialogConfig = {
    title: 'Delete company?',
    message: 'Are you sure?',
    declineButtonText: 'Cancel',
    acceptButtonText: 'Delete',
  };
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
    public dialog: MatDialog
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.customersService
      .getCustomersList(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
      });
  }

  onDeleteSelectedItem(): void {
    let dialogConfig = new MatDialogConfig();
    this.dialogDeleteConfig.title =
      'Delete customer' + (this.selection.selected.length > 1 ? 's?' : '?');

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogDeleteConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: DialogActionEnum) => {
        if (event === DialogActionEnum.Accept) {
          this.customersService
            .deleteCustomers(this.selection.selected)
            .subscribe(() => {
              this.getData();
              this.selection.clear();
            });
        }
      });
  }

  onDelete(id: string): void {
    this.customersService
      .deleteCustomer(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getData();
      });
  }

  onEdit(id: string): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '1050px',
      maxHeight: '90vh',
      data: id,
    };

    this.dialog
      .open(CompanyDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action !== DialogActionEnum.Close) {
          this.getData();
        }
      });
  }
}
