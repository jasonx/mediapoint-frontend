import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { ICompanyEmployeeItem } from 'src/app/core/models/customers.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CustomersService } from 'src/app/core/services/customers.service';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { BaseMainComponent } from '../../../base-main/base-main.component';
import { UserDialogComponent } from '../../../settings/users/user-dialog/user-dialog.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-company-employees',
  templateUrl: './company-employees.component.html',
  styleUrls: ['./company-employees.component.less'],
  providers: [AutoDestroyService],
})
export class CompanyEmployeesComponent extends BaseMainComponent<ICompanyEmployeeItem> {
  buttonConfig: IButtonConfig = {
    text: 'Add employee',
    viewType: ButtonViewType.LightBlue,
    padding: '9px 25px',
    minWidth: '160px',
  };
  displayedColumns: string[] = [
    'mainContact',
    'email',
    'typeUser',
    'createdAt',
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
      .getCompanyEmployees(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
      });
  }

  addEmployee(): void {
    this.openModal();
  }

  editEmployee(id: number): void {
    this.customersService
      .getCompanyEmployee(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.openModal(data);
      });
  }

  openModal(data?: any): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '704px',
      maxHeight: '95vh',
      data: { userData: data, isCustomersPage: true },
    };

    this.dialog
      .open(UserDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action !== DialogActionEnum.Close) {
          this.getData();
        }
      });
  }

  onDelete(id: number): void {
    this.customersService
      .deleteEmployee(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getData();
      });
  }
}
