import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { IQuoteJob } from 'src/app/core/models/quotes.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { QuoteService } from 'src/app/core/services/quote.service';
import { EditJobModalComponent } from 'src/app/pages/products/product-page/compose-product/edit-job-modal/edit-job-modal.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';

@Component({
  selector: 'app-quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.less'],
  providers: [AutoDestroyService],
})
export class QuoteDetailsComponent implements OnInit {
  toKebabCase = toKebabCase;
  FIELD_TYPES = FieldTypes;
  quoteId: string;
  quoteData: IQuoteJob;
  file: File;
  form: FormGroup;
  listOfOptions = [OptionsMenuItem.Delete];
  isLoaded: boolean = true;

  breadcrumbs: IBreadcrumbs[] = [
    {
      name: 'Quotes',
      url: 'back',
    },
    {
      name: this.activatedRoute.snapshot.params?.['id'],
    },
  ];

  buttonConfig: IButtonConfig = {
    text: 'Add to cart',
    viewType: ButtonViewType.Filled,
    minWidth: '100%',
  };
  dialogSuccessConfig: IDialogConfig = {
    title: 'Success!',
    isSuccess: true,
  };

  constructor(
    private quoteService: QuoteService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private destroy$: AutoDestroyService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.quoteId = this.activatedRoute.snapshot.params['id'];
    this.getQuoteData();
    this.getQuotePdf();

    if (!this.isAdmin) {
      this.listOfOptions.unshift(
        ...[OptionsMenuItem.Edit, OptionsMenuItem.Duplicate]
      );
    }
  }

  getQuoteData(): void {
    this.quoteService
      .getQuote(+this.quoteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.quoteData = data;
        this.initForm();
      });
  }

  getQuotePdf(): void {
    this.quoteService
      .getQuotePdf(this.quoteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.file = new File([data], `Quote-${this.quoteId}.pdf`);
      });
  }

  initForm(): void {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      reference: this.quoteData.quoteReference || '',
    });
  }

  editJob(jobId: string): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '834px',
      maxHeight: '90vh',
      data: {
        title: 'Edit the job #' + jobId,
        jobId,
      },
    };

    this.dialog
      .open(EditJobModalComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getQuoteData();
      });
  }

  duplicateJob(jobId: string): void {
    this.quoteService
      .copyQuoteJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getQuoteData();
        this.openSuccessDialog();
      });
  }

  deleteJob(jobId: string): void {
    this.quoteService
      .deleteQuoteJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.quoteData.jobs = this.quoteData.jobs.filter((j) => j.id !== jobId);

        if (!this.quoteData.jobs.length) {
          this.backToPreviousPage();
        }
      });
  }

  deleteQuote(): void {
    this.quoteService
      .deleteQuoteById(this.quoteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.backToPreviousPage());
  }

  saveReference(): void {
    const value = this.form.get('reference')?.value;

    if (this.quoteData.quoteReference === value || this.isAdmin) {
      return;
    }

    this.quoteData.quoteReference = value;

    this.quoteService
      .saveQuoteReference(value, 'Q' + this.quoteId)
      .subscribe(() => this.openSuccessDialog());
  }

  onCreateOrder(): void {
    const quoteReference = this.form.get('reference')?.value;

    this.isLoaded = false;
    this.quoteService
      .createOrderByQuotesId(this.quoteId, quoteReference)
      .pipe(
        catchError((err) => {
          this.isLoaded = true;

          throw err;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
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

  backToPreviousPage(): void {
    this.ngZone.run(() => {
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    });
  }

  get isAdmin(): boolean {
    return this.quoteService.isAdmin;
  }
}
