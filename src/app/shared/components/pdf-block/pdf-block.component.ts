import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { UploadService } from 'src/app/core/services/upload.service';
import { PdfModalComponent } from './pdf-modal/pdf-modal.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-pdf-block',
  templateUrl: './pdf-block.component.html',
  styleUrls: ['./pdf-block.component.less'],
  providers: [AutoDestroyService],
})
export class PdfBlockComponent {
  @Input() file: any;
  @Input() isReloadBtn: boolean;
  @Input() isDeleteBtn: boolean;
  @Input() isDownloadBtn: boolean;
  @Input() svg: string = 'pdf-file.svg';
  @Input() customClass: string;

  url: string;
  @Output() deleteFileEvent = new EventEmitter();

  constructor(
    private uploadService: UploadService,
    private dialog: MatDialog,
    private destroy$: AutoDestroyService
  ) {}

  get fileSize(): string {
    const units = ['b', 'kb', 'mb'];
    const i = Math.floor(Math.log(this.file.size) / Math.log(1024));

    return (
      parseFloat((this.file.size / Math.pow(1024, i)).toFixed(1)) + units[i]
    );
  }

  onReloadFile(event: any): void {
    this.uploadService.reloadEvent$.next(true);
    event.stopPropagation();
  }

  onDeleteFile(event: any): void {
    this.deleteFileEvent.emit();
    event.stopPropagation();
  }

  onDownloadFile(event: any): void {
    event.stopPropagation();
    saveAs(this.file.url || this.file, this.file.name);
  }

  openPdf(): void {
    this.url = this.url || this.file.url || this.file;

    if (!this.url) {
      this.setUrl();

      return;
    }

    this.dialog
      .open(PdfModalComponent, {
        width: '100%',
        maxWidth: '976px',
        data: this.url,
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.url = ''));
  }

  setUrl(): void {
    let reader = new FileReader();

    reader.onload = (e: any) => {
      this.url = e.target.result;
      this.openPdf();
    };
    reader.readAsArrayBuffer(this.file);
  }
}
