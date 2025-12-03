import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { MAIN_MENU_ADMIN } from 'src/app/core/constants/main-menu.constant';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { ICustomerDetails } from 'src/app/core/models/customers.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CustomersService } from 'src/app/core/services/customers.service';
import { numberMask, phoneMask } from 'src/app/shared/utils/masks';
import { fromSnakeCase } from 'src/app/shared/utils/snake-case.util';
import { CompanyDialogComponent } from './company-dialog/company-dialog.component';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.less'],
  providers: [AutoDestroyService],
})
export class CompanyComponent implements OnInit {
  numberMask = numberMask;
  phoneMask = phoneMask;
  fromSnakeCase = fromSnakeCase;
  tabs = [
    { title: 'Addresses', isLoaded: false },
    { title: 'Employees', isLoaded: false },
    { title: 'Orders', isLoaded: false },
    { title: 'Invoices', isLoaded: false },
  ];
  companyId: string;
  customersDetails: ICustomerDetails;
  buttonBackConfig: IButtonConfig = {
    text: 'Back',
    viewType: ButtonViewType.Back,
    padding: '0 22px',
  };
  listOfOptions: OptionsMenuItem[] = [
    OptionsMenuItem.Edit,
    OptionsMenuItem.Delete,
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private customersService: CustomersService,
    private destroy$: AutoDestroyService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.companyId = this.activatedRoute.snapshot.params?.['id'];
    this.customersService.companyId = this.companyId;

    this.getCompanyData();
  }

  getCompanyData(): void {
    this.customersService
      .getCustomersDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.customersDetails = data;
        this.cdr.detectChanges();
      });
  }

  onEdit(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '1050px',
      maxHeight: '90vh',
      data: this.companyId,
    };

    this.dialog
      .open(CompanyDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action !== DialogActionEnum.Close) {
          this.getCompanyData();
        }
      });
  }

  onDelete(): void {
    this.customersService
      .deleteCustomer(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate([MAIN_MENU_ADMIN.CUSTOMERS]).then();
      });
  }

  get isDataLoaded(): boolean {
    return !!this.customersDetails && this.tabs.every((tab) => tab.isLoaded);
  }
}
