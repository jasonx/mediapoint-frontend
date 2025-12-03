import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';

@Component({
  selector: 'app-company-dialog',
  templateUrl: './company-dialog.component.html',
  styleUrls: ['./company-dialog.component.less'],
})
export class CompanyDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  close(event: DialogActionEnum): void {
    this.dialogRef.close(event);
  }
}
