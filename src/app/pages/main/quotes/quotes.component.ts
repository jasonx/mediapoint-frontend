import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, takeUntil } from 'rxjs';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { QuotesStatus } from 'src/app/core/enums/status.enum';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { IQuoteItem } from 'src/app/core/models/quotes.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { QuoteService } from 'src/app/core/services/quote.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { paramsStringify } from 'src/app/shared/utils/params-stringify';
import { transformSelectList } from 'src/app/shared/utils/transform-select-list';
import { BaseMainComponent } from '../base-main/base-main.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: [
    '../base-main/base-main.component.less',
    './quotes.component.less',
  ],
  providers: [AutoDestroyService],
})
export class QuotesComponent extends BaseMainComponent<IQuoteItem> {
  displayedColumns: string[] = [
    'select',
    'id',
    'quoteReference',
    'createdAt',
    'validUntil',
    'createdBy',
    'price',
    'status',
  ];
  override PER_PAGE = 25;
  listOfOptions: OptionsMenuItem[] = [];
  override filterConfig = {
    isLoaded: false,
    isFilterStatus: true,
    statuses: transformSelectList(QuotesStatus),
    isFilterDate: true,
    isSizeRange: true,
    isQuantity: true,
    isFilterPrise: true,
  };
  dialogDeleteConfig: IDialogConfig = {
    title: 'Delete quote?',
    message: 'Are you sure?',
    declineButtonText: 'Cancel',
    acceptButtonText: 'Delete',
  };
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
    private quoteService: QuoteService,
    private dialog: MatDialog
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);
  }

  override getData(): void {
    this.quoteService
      .getQuotes(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
        this.initTable();
      });
  }

  initTable(): void {
    if (!this.isAdmin || this.displayedColumns.includes('menu')) {
      return;
    }

    this.displayedColumns = [...this.displayedColumns, 'menu'];
    this.listOfOptions = this.isAdmin
      ? [OptionsMenuItem.Duplicate, OptionsMenuItem.Delete]
      : [
          OptionsMenuItem.Duplicate,
          OptionsMenuItem.AddToCart,
          OptionsMenuItem.Delete,
        ];
  }

  override getFilter(): void {
    this.quoteService
      .getQuotesFilter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setFilter(data);
      });
  }

  onCreateOrder(id?: string): void {
    this.isLoaded = false;

    id
      ? this.quoteService.createOrderByQuotesId(id).subscribe()
      : this.quoteService
          .createOrderByQuotes(this.selection.selected)
          .pipe(
            catchError((err) => {
              this.isLoaded = true;

              throw err;
            }),
            takeUntil(this.destroy$)
          )
          .subscribe();
  }

  onDuplicate(id?: string): void {
    this.isLoaded = false;

    (id
      ? this.quoteService.copyQuoteById(id)
      : this.quoteService.copyQuotes(this.selection.selected)
    )
      .pipe(
        catchError((err) => {
          this.isLoaded = true;

          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.getData();
        this.openSuccessDialog();
        this.selection.clear();
        this.isLoaded = true;
      });
  }

  saveReference(item: IQuoteItem, value: string): void {
    if (item.quoteReference === value || this.isAdmin) {
      return;
    }

    item.quoteReference = value;
    this.quoteService
      .saveQuoteReference(value, 'Q' + item.id)
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

  onDelete(id?: string): void {
    id ? this.deleteQuotes(id) : this.openDeleteDialog();
  }

  deleteQuotes(id?: string): void {
    this.isLoaded = false;

    (id
      ? this.quoteService.deleteQuoteById(id)
      : this.quoteService.deleteQuotes(this.selection.selected)
    )
      .pipe(
        catchError((err) => {
          this.isLoaded = true;

          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.getData();
        this.selection.clear();
        this.isLoaded = true;
      });
  }

  openDeleteDialog(): void {
    let dialogConfig = new MatDialogConfig();
    this.dialogDeleteConfig.title =
      'Delete quote' + (this.selection.selected.length > 1 ? 's?' : '?');

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
          this.deleteQuotes();
        }
      });
  }

  get isAdmin(): boolean {
    return this.quoteService.isAdmin;
  }
}
