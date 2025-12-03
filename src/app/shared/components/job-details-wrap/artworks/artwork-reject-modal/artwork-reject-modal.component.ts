import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IArtworkItem } from '../../../../../core/models/artwork.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FieldTypes } from '../../../../../core/enums/field-type.enum';
import { IButtonConfig } from '../../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../../core/enums/button-view-type.enum';
import { OrderService } from 'src/app/core/services/order.service';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { EventService } from '../../../../../core/services/event.service';

@Component({
  selector: 'app-artwork-reject-modal',
  templateUrl: './artwork-reject-modal.component.html',
  styleUrls: ['./artwork-reject-modal.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkRejectModalComponent implements OnInit {
  form: FormGroup;
  FIELD_TYPES = FieldTypes;
  cancelButtonConfig: IButtonConfig = {
    text: 'Cancel',
    viewType: ButtonViewType.LightBlue,
    minWidth: '172px',
  };
  rejectButtonConfig: IButtonConfig = {
    text: 'Reject artwork',
    viewType: ButtonViewType.Filled,
    minWidth: '172px',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { jobId: string; artwork: IArtworkItem },
    public dialogRef: MatDialogRef<ArtworkRejectModalComponent>,
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private destroy$: AutoDestroyService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      comment: [''],
    });
  }

  close(artworks: IArtworkItem[] | null): void {
    this.dialogRef.close(artworks);
  }

  rejectArtwork(): void {
    this.orderService
      .rejectArtworkByAdmin(
        this.data.jobId,
        this.data.artwork.id,
        this.form.value
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((artworks) => {
        this.close(artworks);
        this.eventService.event$.next('');
      });
  }
}
