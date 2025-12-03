import { Component, Inject } from '@angular/core';
import { IButtonConfig } from '../../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../../core/enums/button-view-type.enum';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { IArtworkItem } from '../../../../../core/models/artwork.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ArtworkConfirmModalComponent } from '../artwork-confirm-modal/artwork-confirm-modal.component';
import { AutoDestroyService } from '../../../../../core/services/auto-destroy.service';

@Component({
  selector: 'app-artwork-upload-modal',
  templateUrl: './artwork-upload-modal.component.html',
  styleUrls: ['./artwork-upload-modal.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkUploadModalComponent {
  form: FormGroup;
  closeButtonConfig: IButtonConfig = {
    text: 'Close',
    viewType: ButtonViewType.LightBlue,
    minWidth: '174px',
  };
  saveButtonConfig: IButtonConfig = {
    text: 'Save',
    viewType: ButtonViewType.Filled,
    minWidth: '174px',
  };
  boxLabel: any;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      artwork: IArtworkItem;
      jobId: number;
    },
    public dialogRef: MatDialogRef<ArtworkUploadModalComponent>,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {}

  get isFile(): boolean {
    return !!this.boxLabel;
  }

  loadFile(file: any): void {
    this.boxLabel = file;
    this.save();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.initForm();
    this.dialog.open(ArtworkConfirmModalComponent, {
      width: '70%',
      maxWidth: '900px',
      data: this.form.value,
    });
    this.close();
  }

  private initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      job: this.data.jobId,
      artwork: this.data.artwork.id,
      file: this.boxLabel,
    });
  }
}
