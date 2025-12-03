import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldTypes } from '../../../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../../core/enums/button-view-type.enum';
import { ButtonType } from '../../../../../core/enums/button-type.enum';
import { ProductionService } from '../../../../../core/services/production.service';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from '../../../../../core/services/auto-destroy.service';
import { EventService } from '../../../../../core/services/event.service';
import { UploadService } from '../../../../../core/services/upload.service';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

export interface IProductionNewProof {
  job: number;
  artwork: number;
  file: File;
  email: string;
  extraEmail: string;
}

@Component({
  selector: 'app-artwork-confirm-modal',
  templateUrl: './artwork-confirm-modal.component.html',
  styleUrls: ['./artwork-confirm-modal.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkConfirmModalComponent implements OnInit {
  FIELD_TYPES = FieldTypes;
  form: FormGroup;
  isExtraEmail: boolean;
  isLoadedBtn: boolean = true;
  addExtraEmailButtonConfig: IButtonConfig = {
    text: 'Add extra email',
    viewType: ButtonViewType.Link,
    type: ButtonType.Button,
  };

  removeExtraEmailButtonConfig: IButtonConfig = {
    text: 'Delete extra email',
    viewType: ButtonViewType.Link,
    type: ButtonType.Button,
    color: '#D82E2E',
  };

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
  url: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      artwork: string;
      job: number;
      file: File;
    },
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ArtworkConfirmModalComponent>,
    private productionService: ProductionService,
    private eventService: EventService,
    private uploadService: UploadService,
    public destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initPreview();

    this.uploadService.uploadProgress
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.uploadService.isLoaded) {
          this.isLoadedBtn = true;
          this.productionService
            .uploadNewProof(<IProductionNewProof>this.form.value)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
              if (data.message === 'success') {
                this.close();
                this.uploadService.clearBuffer();
                this.eventService.event$.next('');
              }
            });
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.toggleExtraEmailControl(this.isExtraEmail);
    this.preventEmptyFieldPost(this.isExtraEmail);

    if (this.form.valid) {
      this.isLoadedBtn = false;
      this.uploadService.upcomingArtworksSet.add(this.data.artwork);

      this.uploadService.uploadFile(
        this.data.file,
        this.data.file.name,
        this.data.artwork
      );
    }
  }

  toggleExtraEmail(): void {
    this.isExtraEmail = !this.isExtraEmail;
    this.toggleExtraEmailControl(this.isExtraEmail);
  }

  private initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      job: this.data.job,
      artwork: this.data.artwork,
      email: ['', [Validators.required,strictEmailValidator()]],
      extraEmail: ['', strictEmailValidator()],
    });
  }

  private initPreview(): void {
    let reader = new FileReader();

    reader.onload = (e: any) => {
      this.url = e.target.result;
    };
    reader.readAsArrayBuffer(this.data.file);
  }

  private toggleExtraEmailControl(isExtraEmail: boolean): void {
    if (isExtraEmail) {
      if (this.form.get('extraEmail')?.value) {
        return;
      }

      this.form.addControl(
        'extraEmail',
        this.formBuilder.control('', strictEmailValidator())
      );
    } else {
      this.form.removeControl('extraEmail');
    }
  }

  private preventEmptyFieldPost(isExtraEmail: boolean) {
    if (!isExtraEmail) {
      return;
    }

    if (!this.form.get('extraEmail')?.value) {
      this.form.removeControl('extraEmail');
    }
  }
}
