import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { BaseMainComponent } from '../base-main/base-main.component';
import { IMyProductsItem } from 'src/app/core/models/my-products.model';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MyProductsService } from 'src/app/core/services/my-products.service';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { catchError, takeUntil } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { IFilterConfig } from 'src/app/core/models/filter.model';
import { EditJobModalComponent } from '../../products/product-page/compose-product/edit-job-modal/edit-job-modal.component';
import { HotToastService } from '@ngneat/hot-toast';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrls: [
    '../base-main/base-main.component.less',
    './my-products.component.less',
  ],
  providers: [AutoDestroyService],
})
export class MyProductsComponent extends BaseMainComponent<IMyProductsItem> {
  selectedCategoryId: string =
    this.activatedRoute.snapshot.queryParams['category'] || '';
  displayedColumns: string[] = [
    'productName',
    'productType',
    'createdBy',
    'createdAt',
    'actions',
  ];
  override filterConfig: IFilterConfig = {
    isLoaded: false,
    isFilterStatus: true,
    isFilterDate: true,
    isSizeRange: true,
    isQuantity: true,
    isFilterPrise: true,
  };
  dialogDeleteConfig: IDialogConfig = {
    title: 'Delete product?',
    message: 'Are you sure?',
    declineButtonText: 'Cancel',
    acceptButtonText: 'Delete',
  };

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    destroy$: AutoDestroyService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone,
    platformDetectorService: PlatformDetectorService,
    private myProductsService: MyProductsService,
    private dialog: MatDialog,
    private toast: HotToastService
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.myProductsService
      .getMyProducts(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
      });
  }

  override getFilter(): void {
    this.myProductsService
      .getMyProductsFilter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setFilter(data);
      });
  }

  selectCategory(categoryId: string): void {
    if (this.selectedCategoryId === categoryId) {
      return;
    }

    this.selectedCategoryId = categoryId;
    this.params = {
      ...this.params,
      category: categoryId,
      currentPage: 1,
    };

    this.isDataLoaded = false;
    this.updateUrl();
  }

  openEditDialog(product: IMyProductsItem): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '1084px',
      maxHeight: '90vh',
      data: {
        title: product.productName,
        productId: product.id,
        callbackFn: this.editName.bind(this),
      },
    };

    this.dialog
      .open(EditJobModalComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data === DialogActionEnum.Accept) {
          this.addToCart(product.jobId);
        }

        this.getData();
      });
  }

  editName(id: string, name: string): void {
    this.myProductsService
      .editMyProductName(id, name)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showSuccessToast();
      });
  }

  addToCart(jobId: string): void {
    this.myProductsService
      .addMyProductToCart(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showSuccessToast(
          'The product has been successfully added to the cart.'
        );
      });
  }

  openDeleteDialog(id: string): void {
    let dialogConfig = new MatDialogConfig();
    this.dialogDeleteConfig.title = 'Delete this product?';

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
          this.deleteProduct(id);
        }
      });
  }

  deleteProduct(id: string): void {
    this.isLoaded = false;

    this.myProductsService
      .deleteProduct(id)
      .pipe(
        catchError((err) => {
          this.isLoaded = true;

          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.getData();
        this.showSuccessToast('The product has been successfully deleted.');
        this.isLoaded = true;
      });
  }

  showSuccessToast(message: string = 'Success!'): void {
    this.toast.show(message, {
      position: 'top-center',
      duration: 5000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px 50px',
        color: '#168952',
      },
    });
  }
}
