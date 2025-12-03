import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, takeUntil } from 'rxjs';
import { OrderDirection } from 'src/app/core/enums/order-direction.enum';
import { IAddressItem } from 'src/app/core/models/address.model';
import {
  ICompanyItems,
  ICustomerItem,
} from 'src/app/core/models/customers.model';
import {
  IFilter,
  IFilterConfig,
  IFilterDefaultValues,
} from 'src/app/core/models/filter.model';
import { IInvoiceItem } from 'src/app/core/models/invoices.model';
import { IOrderItem } from 'src/app/core/models/orders.model';
import { IQueryParams } from 'src/app/core/models/query-params.model';
import { IQuoteItem } from 'src/app/core/models/quotes.model';
import { ITableRequest } from 'src/app/core/models/table.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import {
  fromCamel,
  fromCamelObj,
  toCamelObj,
} from 'src/app/shared/utils/camel';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';
import { numberMask } from 'src/app/shared/utils/masks';
import { isValue, removeEmptyFromObj } from 'src/app/shared/utils/remove-empty';
import { toSnakeCase } from 'src/app/shared/utils/snake-case.util';
import { IUserItem } from '../../../core/models/user.model';
import { IMyProductsItem } from 'src/app/core/models/my-products.model';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

export const DATE_FORMAT = 'YYYY-MM-dd';
export const LOCALE = 'en-US';

@Component({
  selector: 'app-base-main',
  template: '',
})
export class BaseMainComponent<
  ItemType extends
    | IQuoteItem
    | IInvoiceItem
    | IAddressItem
    | IMyProductsItem
    | IOrderItem
    | ICustomerItem
    | IUserItem
    | ICompanyItems
> implements OnInit, AfterViewInit
{
  toKebabCase = toKebabCase;
  numberMask = numberMask;
  PER_PAGE = 5;
  params: IQueryParams = {
    orderBy: 'id',
    orderDirection: OrderDirection.DESC,
    perPage: this.PER_PAGE,
    currentPage: 1,
  };
  filterConfig: IFilterConfig = { isLoaded: false } as IFilterConfig;
  dataSource = new MatTableDataSource<ItemType>([]);
  selection = new SelectionModel<string>(true, []);
  isSearch: boolean;
  filterLabels: any;
  totalItems = 0;
  isLoaded = true;
  isDataLoaded: boolean;
  generalUrl = '';

  @Output() dataLoadedEvent = new EventEmitter();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public destroy$: AutoDestroyService,
    public cdr: ChangeDetectorRef,
    public ngZone: NgZone,
    public platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    this.initParams();
    this.getFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  initParams(): void {
    let subscription: Subscription;
    this.params.perPage = this.PER_PAGE;

    subscription = this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (subscription) {
          subscription.unsubscribe();

          return;
        }

        if (Object.keys(params).length) {
          this.params = toCamelObj(params);
        }

        this.updateUrl();
      });

    this.generalUrl = this.router.url.split('?')[0];
  }

  updateUrl(): void {
    this.params = removeEmptyFromObj(this.params) as IQueryParams;
    const queryParams = fromCamelObj(this.params);

    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
      })
      .then(() => this.getData());
  }

  getData(): void {}

  setData(data: ITableRequest<ItemType[]>): void {
    if (data.totalPages && this.params.currentPage > data.totalPages) {
      this.params.currentPage = data.totalPages;
      this.updateUrl();
    }

    this.dataSource.data = data.data;
    this.totalItems = data.totalItems;
    this.isDataLoaded = true;
    this.dataLoadedEvent.emit();

    this.cdr.detectChanges();
  }

  getFilter(): void {}

  setFilter(data: IFilterDefaultValues): void {
    this.filterConfig = {
      ...this.filterConfig,
      ...data,
      maxCreatedAt: data.maxCreatedAt || data.maxDispatchEtaAt,
      minCreatedAt: data.minCreatedAt || data.minDispatchEtaAt,
      typeOfPrint: data.products || [],
      isLoaded: true,
    };
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;

    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();

      return;
    }

    this.selection.select(...this.dataSource.data.map((d) => d.id as string));
  }

  searchByText(searchText: string): void {
    this.isSearch = !!searchText;
    this.params.search = encodeURIComponent(searchText);

    if (!this.isSearch) {
      this.isDataLoaded = false;
    }

    this.reloadData();
  }

  searchByFilters(data: { data: IFilter; isReload?: boolean }): void {
    this.filterLabels = removeEmptyFromObj(data.data);
    this.isSearch = !!Object.keys(this.filterLabels).length;
    this.isDataLoaded = false;

    if (data.isReload) {
      this.setParams();
      this.setDateToParams();
      this.reloadData();
    }
  }

  setParams(): void {
    this.params = {
      ...this.params,
      status: toSnakeCase(this.filterLabels?.status || ''),
      productSizeFrom: this.filterLabels?.productSizeFrom,
      productSizeTo: this.filterLabels?.productSizeTo,
      quantityFrom: this.filterLabels?.quantityFrom,
      quantityTo: this.filterLabels?.quantityTo,
      priceFrom: this.filterLabels?.priceFrom,
      priceTo: this.filterLabels?.priceTo,
      typeOfPrint: isValue(this.filterLabels?.typeOfPrint?.id)
        ? this.filterLabels?.typeOfPrint?.id
        : '',
      customer: isValue(this.filterLabels?.customer?.id)
        ? this.filterLabels?.customer?.id
        : '',
    };
  }

  setDateToParams(): void {
    const startDate = this.filterLabels?.startDate;
    const endDate = this.filterLabels?.endDate;

    this.params = {
      ...this.params,
      createdAtFrom: startDate
        ? formatDate(startDate, DATE_FORMAT, LOCALE)
        : '',
      createdAtTo: endDate ? formatDate(endDate, DATE_FORMAT, LOCALE) : '',
    };
  }

  sortData(sortState: Sort): void {
    const isSort = !!sortState.direction;
    let orderBy = isSort ? fromCamel(sortState.active) : 'id';

    if (isSort && orderBy === 'due_date') {
      orderBy = 'created_at';
    }

    this.params = {
      ...this.params,
      orderBy,
      orderDirection: isSort
        ? (sortState.direction as OrderDirection)
        : OrderDirection.DESC,
    };

    this.reloadData();
  }

  onChangePage(page: PageEvent): void {
    this.params.perPage = page.pageSize;
    this.params.currentPage = page.pageIndex + 1;
    this.updateUrl();
  }

  resetPaginator(): void {
    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.params.currentPage = 1;
  }

  reloadData(): void {
    this.resetPaginator();
    this.updateUrl();
  }

  goToDetailsPage(
    event: Event | PointerEvent,
    id?: number,
    url: string = './'
  ): void {
    const { className } = event.target as HTMLElement;
    const isClickOnBtn =
      className.includes('btn') ||
      className.includes('checkbox') ||
      className.includes('artwork');
    const isNewTab = (event as PointerEvent).button === 1;

    event.preventDefault();

    if (isClickOnBtn) {
      return;
    }

    if (this.platformDetectorService.isBrowser()) {
      this.ngZone.run(() => {
        const newUrl = this.router.serializeUrl(
          this.router.createUrlTree([url, id], {
            relativeTo: this.activatedRoute,
          })
        );
  
        isNewTab
          ? window.open(newUrl, '_blank')
          : this.router.navigate([newUrl]).then();
      });
    }
  }

  get isDisplayPaginator(): boolean {
    return this.totalItems > this.PER_PAGE;
  }
}
