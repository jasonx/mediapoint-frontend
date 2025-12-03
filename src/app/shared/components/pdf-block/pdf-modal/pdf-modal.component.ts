import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pdf-modal',
  templateUrl: './pdf-modal.component.html',
  styleUrls: ['./pdf-modal.component.less'],
})
export class PdfModalComponent {
  height: number;

  constructor(
    public dialogRef: MatDialogRef<PdfModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: string
  ) {}

  get src(): string {
    return this.data;
  }

  pageInitialized(event: any) {
    this.height = event.source.viewer.clientHeight;
  }
}
