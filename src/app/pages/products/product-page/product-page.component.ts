import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { HasUnsavedChanges } from 'src/app/core/guards/unsaved-changes.guard';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IProduct } from 'src/app/core/models/product.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CreateOrderService } from 'src/app/core/services/create-order.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ProductService } from 'src/app/core/services/product.service';
import { SeoService } from 'src/app/core/services/seo.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { formatText } from 'src/app/shared/utils/format-text';
import { titleCase } from 'src/app/shared/utils/title-case';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.less'],
  providers: [AutoDestroyService],
})
export class ProductPageComponent implements OnInit, HasUnsavedChanges {
  formatText = formatText;
  productData: IProduct | null = null;
  productImages: string[];
  breadcrumbs: IBreadcrumbs[] = [];
  headerHeight$ = this.headerService.headerHeight$;

  get buttonPricingConfig(): IButtonConfig {
    return {
      text: 'Get Pricing',
      viewType: ButtonViewType.FilledRed,
      minWidth: '364px',
    };
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private headerService: HeaderService,
    private orderService: CreateOrderService,
    private dialog: MatDialog,
    private destroy$: AutoDestroyService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.getParams();
  }

  getParams(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((p) => {
      const { product, category } = p;

      this.getProductData(product, category);
    });
  }

  getProductData(product: string, category: string): void {
    this.productData = null;

    this.productService
      .getProductData(product)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.productData = data;
        this.productImages = [data.imageUrl, ...data.images.map((i) => i.url)];

        this.breadcrumbs = [
          {
            name: 'Catalog',
            url: '/catalog',
          },
          {
            name: titleCase(category),
            url: `../../${category}`,
          },
          {
            name: this.productData.title,
          },
        ];
        this.initMetaTags();
      });
  }

  initMetaTags(): void {
    if (!this.productData) {
      return;
    }

    const shortDescription = this.getShortDescription(
      this.productData.description
    );

    this.seoService.updateTitle(`${this.productData.title} | Mediapoint`);
    this.seoService.updateMetaTags([
      {
        property: 'og:title',
        content: this.productData.title,
      },
      {
        name: 'twitter:title',
        content: this.productData.title,
      },
      {
        name: 'description',
        content: shortDescription,
      },
      {
        property: 'og:image',
        content: this.productData.imageUrl,
      },
      {
        property: 'og:description',
        content: shortDescription,
      },
      {
        property: 'twitter:description',
        content: shortDescription,
      },
      {
        property: 'twitter:image',
        content: this.productData.imageUrl,
      },
    ]);
  }

  getShortDescription(description: string): string {
    const maxSymbols = 270;

    return description.length > maxSymbols
      ? description.substring(
          0,
          Math.max(
            description.lastIndexOf(' ', maxSymbols),
            description.indexOf(' ', maxSymbols),
            0
          )
        ) + '... '
      : description;
  }

  toNegativeNumber(number: number | null): number {
    return number ? -number : 0;
  }

  hasUnsavedChanges(): boolean {
    return !!this.orderService.jobIdUnsavedParams;
  }

  showUnsavedModal(): Observable<boolean> {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '558px',
      data: {
        title: 'Leave page?',
        message:
          'Are you sure you want to leave the ordering process? You can save the current setup as the quote and get back to it later',
        informationButtonText: 'Save parameters',
        declineButtonText: 'Continue order',
        acceptButtonText: 'Leave',
      },
    };

    return new Observable<boolean>((subscriber) => {
      if (!this.orderService.jobIdUnsavedParams) {
        subscriber.next(true);
      }

      this.dialog
        .open(DialogComponent, dialogConfig)
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe((event: DialogActionEnum) => {
          if (!this.orderService.jobIdUnsavedParams) {
            return;
          }

          if (event === DialogActionEnum.Close) {
            this.orderService
              .saveParams(this.orderService.jobIdUnsavedParams)
              .pipe(takeUntil(this.destroy$))
              .subscribe(() => subscriber.next(true));
          } else if (event === DialogActionEnum.Accept) {
            this.orderService
              .deleteJob(this.orderService.jobIdUnsavedParams)
              .pipe(takeUntil(this.destroy$))
              .subscribe(() => subscriber.next(true));
          }
        });
    });
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): boolean {
    return !this.orderService.jobIdUnsavedParams;
  }
}
