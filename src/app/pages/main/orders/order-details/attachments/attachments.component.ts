import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { catchError, forkJoin, of, takeUntil, tap } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IFile } from 'src/app/core/models/file.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.less'],
  providers: [AutoDestroyService],
})
export class AttachmentsComponent implements OnInit {
  @Input() orderId: string;
  pdf: any;
  companyLogoPdf: File;
  supportDocumentPdf: File;
  pickupLabelPdf: File;
  printPdf: IFile;
  iframe: HTMLIFrameElement;

  @Output() loaded: EventEmitter<boolean> = new EventEmitter();

  get printBtnConfig(): IButtonConfig {
    return {
      text: 'Print Labels',
      viewType: ButtonViewType.LightBlue,
      icon: 'print.svg',
      minWidth: '100%',
      isDisabled: !this.printPdf || !this.pdf,
    };
  }

  constructor(
    private orderService: OrderService,
    private destroy$: AutoDestroyService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    this.getAllFiles();
  }

  getAllFiles(): void {
    const companyLogoPdf$ = this.orderService
      .getCompanyLogoPdf(this.orderId)
      .pipe(
        tap(
          (companyLogoPdf) =>
            (this.companyLogoPdf = new File(
              [companyLogoPdf],
              `Logo lable ${this.orderId}.pdf`
            ))
        ),
        catchError((error) => of(error))
      );
    const supportDocumentPdf$ = this.orderService
      .getSupportDocumentPdf(this.orderId)
      .pipe(
        tap(
          (supportDocumentPdf) =>
            (this.supportDocumentPdf = new File(
              [supportDocumentPdf],
              `Supporting Document ${this.orderId}.pdf`
            ))
        ),
        catchError((error) => of(error))
      );
    const pickupLabelPdf$ = this.orderService
      .getPickupLabelPdf(this.orderId)
      .pipe(
        tap(
          (pickupLabelPdf) =>
            (this.pickupLabelPdf = new File(
              [pickupLabelPdf],
              `Pickup Label ${this.orderId}.pdf`
            ))
        ),
        catchError((error) => of(error))
      );
    const printPdf$ = this.orderService.getPrintPdf(this.orderId).pipe(
      tap((printPdf) => (this.printPdf = printPdf)),
      catchError((error) => of(error))
    );

    forkJoin([companyLogoPdf$, supportDocumentPdf$, pickupLabelPdf$, printPdf$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loaded.emit(true);
      });
  }

  onLoaded(pdf: any) {
    this.pdf = pdf;
    this.pdf.getData().then((u8: any) => {
      if (this.platformDetectorService.isBrowser()) {
        const blob = new Blob([u8.buffer], {
          type: 'application/pdf',
        });
        const blobUrl = window.URL.createObjectURL(blob);
  
        this.iframe = document.createElement('iframe');
  
        this.iframe.classList.add('print-pdf');
        this.iframe.src = blobUrl;
        document.body.appendChild(this.iframe);
      }
    });
  }

  print(): void {
    this.iframe.contentWindow?.print();
  }

  get isShowAttachmentBlock(): boolean {
    return !!(
      this.companyLogoPdf ||
      this.supportDocumentPdf ||
      this.pickupLabelPdf
    );
  }
}
