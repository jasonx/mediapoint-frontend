import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, takeUntil } from 'rxjs';
import {
  IStatusGroup,
  JobStatus,
  OrderStatus,
  orderStatusArray,
  Status,
} from 'src/app/core/enums/status.enum';
import { IOrderItem, IOrderJobItem } from 'src/app/core/models/orders.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { OrderService } from 'src/app/core/services/order.service';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import {
  BaseMainComponent,
  DATE_FORMAT,
  LOCALE,
} from '../base-main/base-main.component';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { FilterType } from 'src/app/core/enums/filter-by.enum';
import { IFilter } from 'src/app/core/models/filter.model';
import { transformSelectList } from 'src/app/shared/utils/transform-select-list';
import saveAs from 'file-saver';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmChangesComponent } from './confirm-changes/confirm-changes.component';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { HotToastService } from '@ngneat/hot-toast';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { DateFormatted } from 'src/app/shared/utils/date';
import { capitalizeFirstLetter } from 'src/app/shared/utils/capitalize-first-letter';
import { IFile } from 'src/app/core/models/file.model';
import { ModalArtworksGalleryComponent } from './modal-artworks-gallery/modal-artworks-gallery.component';
import { ITab } from '../../../shared/components/tabs/tabs.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: [
    '../base-main/base-main.component.less',
    './orders.component.less',
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  providers: [AutoDestroyService],
})
export class OrdersComponent extends BaseMainComponent<
  IOrderItem | IOrderJobItem
> {
  displayedColumns: string[] = [];
  override PER_PAGE = 25;
  override filterConfig = {
    isLoaded: false,
    filterType: FilterType.Order,
    statuses: transformSelectList(OrderStatus),
    isSizeRange: true,
    isQuantity: true,
    isFilterDate: true,
    filterDateTitle: this.isAdmin ? 'Data accepted' : '',
    isFilterPrise: true,
  };
  filterTypeTabs: ITab[] = [
    { index: 0, title: FilterType.Order },
    { index: 1, title: FilterType.Job },
  ];
  selectedTab: ITab;

  expandedElements: any[] = [];
  listOfOptions: OptionsMenuItem[] = [OptionsMenuItem.Reprocess];
  orderStatusArray: IStatusGroup[] = orderStatusArray;
  selectedStatusId: number = 0;

  dialogSuccessConfig: IDialogConfig = {
    title: 'Success!',
    isSuccess: true,
  };

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    destroy$: AutoDestroyService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone,
    platformDetectorService: PlatformDetectorService,
    private orderService: OrderService,
    private dialog: MatDialog,
    private toast: HotToastService,
    private datePipe: DatePipe
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.orderService
      .getTableData(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.initFilters();
        this.setData(data);
        this.orderService.statusChangesData = {
          orders: [],
        };
      });
  }

  initFilters(): void {
    const filterTab = (capitalizeFirstLetter(this.params.filterType) ||
      FilterType.Order) as FilterType;

    this.selectedTab = {
      index: filterTab === FilterType.Order ? 0 : 1,
      title: filterTab,
    };

    this.filterConfig = {
      ...this.filterConfig,
      isLoaded: true,
      filterType: filterTab,
      statuses: transformSelectList(
        filterTab === FilterType.Order ? OrderStatus : JobStatus
      ),
    };

    this.initTable();
  }

  initTable(): void {
    if (this.isFilteredByOrder) {
      this.displayedColumns = this.isAdmin
        ? [
            'select',
            'id',
            'artwork',
            'customer',
            'accepted',
            'jobEntered',
            'dispatchEta',
            'totalPrice',
            'status',
            'menu',
            'expand',
          ]
        : [
            'empty',
            'id',
            'artwork',
            'customer',
            'accepted',
            'dispatchEta',
            'totalPrice',
            'status',
            'expand',
          ];
    } else {
      this.displayedColumns = [
        'icon',
        'id',
        'productName',
        'quantity',
        'size',
        'accepted',
        'price',
        'status',
      ];
    }
  }

  override getFilter(): void {
    this.orderService
      .getOrdersFilter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setFilter(data);
      });
  }

  override setDateToParams(): void {
    const startDate = this.filterLabels?.startDate;
    const endDate = this.filterLabels?.endDate;

    this.params = this.isAdmin
      ? {
          ...this.params,
          createdAtFrom: startDate
            ? formatDate(startDate, DATE_FORMAT, LOCALE)
            : '',
          createdAtTo: endDate ? formatDate(endDate, DATE_FORMAT, LOCALE) : '',
        }
      : {
          ...this.params,
          dispatchEtaAtFrom: startDate
            ? formatDate(startDate, DATE_FORMAT, LOCALE)
            : '',
          dispatchEtaAtTo: endDate
            ? formatDate(endDate, DATE_FORMAT, LOCALE)
            : '',
        };
  }

  changeFilterType(filterType: ITab): void {
    if (filterType.title === this.selectedTab.title) {
      return;
    }

    const type: FilterType = filterType.title as FilterType;

    this.selectedTab = filterType;
    this.params = {
      ...this.params,
      filterType: type.toLowerCase(),
      currentPage: 1,
    };

    this.filterConfig = {
      ...this.filterConfig,
      filterType: type,
      statuses: transformSelectList(
        type === FilterType.Order ? OrderStatus : JobStatus
      ),
    };

    this.isDataLoaded = false;
    this.updateUrl();
    this.initTable();
  }

  override searchByFilters(data: { data: IFilter; isReload?: boolean }): void {
    super.searchByFilters(data);
    this.initTable();
  }

  setExpandedElement(event: Event, element: IOrderItem): void {
    const isClickOnBtn = (event.target as HTMLElement).className.includes(
      'btn'
    );

    if (isClickOnBtn) {
      return;
    }

    const index = this.expandedElements.indexOf(element);

    if (index === -1) {
      this.expandedElements.push(element);
    } else {
      this.expandedElements.splice(index, 1);
    }

    event.stopPropagation();
  }

  isExpanded(el: any): boolean {
    return this.expandedElements.includes(el);
  }

  onExportXML(id: string): void {
    this.orderService
      .exportOrder(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        const file = new File([data], `Order-${id}.xml`);

        saveAs(file, file.name);
      });
  }

  onReprocess(id: string): void {
    this.orderService
      .updateMaps(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.openSuccessDialog());
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

  getListOfOptions(isXmlAvailable: boolean): OptionsMenuItem[] {
    return isXmlAvailable
      ? [OptionsMenuItem.Export, ...this.listOfOptions]
      : this.listOfOptions;
  }

  override toggleAllRows(): void {
    super.toggleAllRows();

    this.orderService.statusChangesData.orders = [];
    this.selection.selected.forEach((id) => {
      this.setSelectedStatus(id);
    });
  }

  onToggleCheckbox(id: string): void {
    this.selection.toggle(id);
    this.setSelectedStatus(id);
  }

  setSelectedStatus(id: string): void {
    const isItemSelected = this.selection.isSelected(id);
    const { orders } = this.orderService.statusChangesData;

    if (isItemSelected) {
      const oldStatus = (this.dataSource.data as IOrderItem[]).find(
        (d) => d.id === id
      )?.status;

      if (!oldStatus) {
        return;
      }

      orders?.push({
        id,
        oldStatus,
      });
    } else {
      this.orderService.statusChangesData.orders = orders?.filter(
        (o) => o.id !== id
      );
    }

    const selectedStatusIds =
      this.orderService.statusChangesData.orders?.map(
        (order) =>
          this.orderStatusArray.find((o) => o.status === order.oldStatus)
            ?.groupIndex || 0
      ) || [];

    this.selectedStatusId = Math.max(...selectedStatusIds);
  }

  changeOrderStatus(status: Status): void {
    this.orderService.statusChangesData.orders =
      this.orderService.statusChangesData.orders?.map((o) => {
        return { ...o, newStatus: status as OrderStatus };
      });

    this.openConfirmDialog();
  }

  openConfirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmChangesComponent);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Accept) {
          this.orderService
            .changeStatus(this.selection.selected)
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                if (err.status === 422) {
                  this.toast.show('This status cannot be changed!', {
                    position: 'top-center',
                    duration: 5000,
                    style: {
                      boxShadow: '0 3px 12px #ffecec',
                      border: '1px solid #A83B3B',
                      padding: '16px',
                      color: '#A83B3B',
                    },
                  });
                }

                this.getData();
                throw err;
              })
            )
            .subscribe(() => {
              this.getData();
            });
        }
      });
  }

  displayArtwork(artworks: IFile[]): void {
    const imgs = artworks.map((a) => a.previewUrl);

    this.dialog.open(ModalArtworksGalleryComponent, {
      data: { imgs },
    });
  }

  getDate(date: string): string | null {
    return new DateFormatted(this.datePipe).getDate(date);
  }

  get isFilteredByOrder(): boolean {
    return this.selectedTab && this.selectedTab.title === FilterType.Order;
  }

  get isAdmin(): boolean {
    return this.orderService.isAdmin;
  }
}
